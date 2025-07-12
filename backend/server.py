from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
import uuid
from dotenv import load_dotenv
import google.generativeai as genai
import requests
from typing import Optional, List, Dict, Any

load_dotenv()

app = FastAPI(title="MK7 Trading Bot API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Environment variables
MONGO_URL = os.getenv("MONGO_URL")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Configure Gemini AI
genai.configure(api_key=GEMINI_API_KEY)

# MongoDB connection
client = MongoClient(MONGO_URL)
db = client.get_database()
users_collection = db.users
admin_settings_collection = db.admin_settings

# Pydantic models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: str
    email: str
    full_name: str
    user_type: str
    is_active: bool
    created_at: datetime

class MarketAnalysisRequest(BaseModel):
    symbol: str
    timeframe: str = "1d"
    analysis_type: str = "technical"

class AdminSettings(BaseModel):
    basic_plan_price: float = 29.99
    premium_plan_price: float = 99.99
    trading_api_keys: Dict[str, str] = {}
    payment_api_keys: Dict[str, str] = {}

# Utility functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=60)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm="HS256")
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET_KEY, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = users_collection.find_one({"id": user_id})
    if user is None:
        raise credentials_exception
    return user

def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("user_type") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

# API Routes
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "MK7 Trading Bot API"}

@app.post("/api/auth/register")
async def register_user(user_data: UserRegister):
    # Check if user already exists
    if users_collection.find_one({"email": user_data.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user_data.password)
    
    new_user = {
        "id": user_id,
        "email": user_data.email,
        "password": hashed_password,
        "full_name": user_data.full_name,
        "user_type": "basic",  # Default to basic plan
        "is_active": True,
        "created_at": datetime.utcnow()
    }
    
    users_collection.insert_one(new_user)
    
    # Create access token
    access_token = create_access_token(data={"sub": user_id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "email": user_data.email,
            "full_name": user_data.full_name,
            "user_type": "basic"
        }
    }

@app.post("/api/auth/login")
async def login_user(user_data: UserLogin):
    user = users_collection.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user["password"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=400, detail="Account is disabled")
    
    access_token = create_access_token(data={"sub": user["id"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "user_type": user["user_type"]
        }
    }

@app.get("/api/auth/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "full_name": current_user["full_name"],
        "user_type": current_user["user_type"],
        "is_active": current_user["is_active"]
    }

@app.get("/api/market/crypto-prices")
async def get_crypto_prices():
    """Get cryptocurrency prices from CoinGecko (free API)"""
    try:
        url = "https://api.coingecko.com/api/v3/simple/price"
        params = {
            "ids": "bitcoin,ethereum,binancecoin,cardano,solana,polygon,chainlink,litecoin",
            "vs_currencies": "usd",
            "include_24hr_change": "true",
            "include_market_cap": "true"
        }
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch crypto prices: {str(e)}")

@app.post("/api/analysis/gemini")
async def analyze_market_with_gemini(request: MarketAnalysisRequest, current_user: dict = Depends(get_current_user)):
    """Use Gemini AI to analyze market data"""
    try:
        # Get market data first
        if request.symbol.upper() in ["BTC", "ETH", "BNB", "ADA", "SOL"]:
            # Crypto analysis
            crypto_data = await get_crypto_prices()
            market_context = f"Current crypto prices: {crypto_data}"
        else:
            # For forex, we'll use a simple context for now
            market_context = f"Analyzing {request.symbol} in {request.timeframe} timeframe"
        
        # Create Gemini model
        model = genai.GenerativeModel('gemini-pro')
        
        # Craft analysis prompt
        prompt = f"""
        As a professional trading analyst, analyze the following market data for {request.symbol}:
        
        Market Context: {market_context}
        Timeframe: {request.timeframe}
        Analysis Type: {request.analysis_type}
        
        Please provide:
        1. Market Overview
        2. Technical Analysis (if applicable)
        3. Key Support/Resistance levels
        4. Trend Direction
        5. Risk Assessment
        6. Trading Recommendations
        
        Keep the analysis concise but comprehensive.
        """
        
        response = model.generate_content(prompt)
        
        return {
            "symbol": request.symbol,
            "timeframe": request.timeframe,
            "analysis": response.text,
            "generated_at": datetime.utcnow(),
            "analyst": "Gemini AI"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/api/admin/settings")
async def get_admin_settings(current_user: dict = Depends(require_admin)):
    """Get admin settings"""
    settings = admin_settings_collection.find_one({"type": "general"})
    if not settings:
        # Create default settings
        default_settings = {
            "type": "general",
            "basic_plan_price": 29.99,
            "premium_plan_price": 99.99,
            "trading_api_keys": {},
            "payment_api_keys": {},
            "created_at": datetime.utcnow()
        }
        admin_settings_collection.insert_one(default_settings)
        return default_settings
    return settings

@app.put("/api/admin/settings")
async def update_admin_settings(settings: AdminSettings, current_user: dict = Depends(require_admin)):
    """Update admin settings"""
    admin_settings_collection.update_one(
        {"type": "general"},
        {"$set": {
            "basic_plan_price": settings.basic_plan_price,
            "premium_plan_price": settings.premium_plan_price,
            "trading_api_keys": settings.trading_api_keys,
            "payment_api_keys": settings.payment_api_keys,
            "updated_at": datetime.utcnow()
        }},
        upsert=True
    )
    return {"message": "Settings updated successfully"}

@app.get("/api/admin/users")
async def get_all_users(current_user: dict = Depends(require_admin)):
    """Get all users for admin"""
    users = list(users_collection.find({}, {"password": 0}))  # Exclude passwords
    return users

@app.put("/api/admin/users/{user_id}/upgrade")
async def upgrade_user_plan(user_id: str, new_plan: str, current_user: dict = Depends(require_admin)):
    """Upgrade user plan"""
    if new_plan not in ["basic", "premium", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid plan type")
    
    result = users_collection.update_one(
        {"id": user_id},
        {"$set": {"user_type": new_plan, "updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": f"User plan updated to {new_plan}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)