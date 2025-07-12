#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for MK7 Trading Bot
Tests all authentication, market data, AI analysis, and admin endpoints
"""

import requests
import json
import time
from datetime import datetime

# Use the frontend environment URL for testing
BACKEND_URL = "http://localhost:8001"
API_BASE = f"{BACKEND_URL}/api"

class MK7BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.admin_token = None
        self.premium_token = None
        self.basic_token = None
        self.test_results = []
        
    def log_test(self, test_name, success, message, details=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "details": details
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_health_check(self):
        """Test basic health endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/health")
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    self.log_test("Health Check", True, "API is healthy")
                    return True
                else:
                    self.log_test("Health Check", False, "Unexpected health response", data)
            else:
                self.log_test("Health Check", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Health Check", False, "Connection failed", str(e))
        return False
    
    def test_user_registration(self):
        """Test user registration endpoint"""
        test_user = {
            "email": "testuser@mk7.com",
            "password": "testpass123",
            "full_name": "Test User"
        }
        
        try:
            response = self.session.post(f"{API_BASE}/auth/register", json=test_user)
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "user" in data:
                    self.log_test("User Registration", True, "New user registered successfully")
                    return True
                else:
                    self.log_test("User Registration", False, "Missing token or user data", data)
            elif response.status_code == 400 and "already registered" in response.text:
                self.log_test("User Registration", True, "User already exists (expected)")
                return True
            else:
                self.log_test("User Registration", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("User Registration", False, "Registration failed", str(e))
        return False
    
    def test_user_login(self, email, password, expected_user_type=None):
        """Test user login and return token"""
        try:
            login_data = {"email": email, "password": password}
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "user" in data:
                    token = data["access_token"]
                    user_type = data["user"]["user_type"]
                    
                    if expected_user_type and user_type != expected_user_type:
                        self.log_test(f"Login {email}", False, f"Expected {expected_user_type}, got {user_type}")
                        return None
                    
                    self.log_test(f"Login {email}", True, f"Login successful as {user_type}")
                    return token
                else:
                    self.log_test(f"Login {email}", False, "Missing token or user data", data)
            else:
                self.log_test(f"Login {email}", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test(f"Login {email}", False, "Login failed", str(e))
        return None
    
    def test_auth_me(self, token, expected_email):
        """Test /auth/me endpoint with token"""
        try:
            headers = {"Authorization": f"Bearer {token}"}
            response = self.session.get(f"{API_BASE}/auth/me", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("email") == expected_email:
                    self.log_test("Auth Me", True, f"User info retrieved for {expected_email}")
                    return True
                else:
                    self.log_test("Auth Me", False, f"Email mismatch: expected {expected_email}, got {data.get('email')}")
            else:
                self.log_test("Auth Me", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Auth Me", False, "Auth me failed", str(e))
        return False
    
    def test_crypto_prices(self):
        """Test cryptocurrency prices endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/market/crypto-prices")
            
            if response.status_code == 200:
                data = response.json()
                # Check if we have expected crypto data
                expected_cryptos = ["bitcoin", "ethereum", "binancecoin"]
                found_cryptos = [crypto for crypto in expected_cryptos if crypto in data]
                
                if len(found_cryptos) >= 2:  # At least 2 cryptos should be present
                    self.log_test("Crypto Prices", True, f"Retrieved prices for {len(data)} cryptocurrencies")
                    return True
                else:
                    self.log_test("Crypto Prices", False, "Insufficient crypto data", data)
            else:
                self.log_test("Crypto Prices", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Crypto Prices", False, "Crypto prices failed", str(e))
        return False
    
    def test_gemini_analysis(self, token):
        """Test Gemini AI analysis endpoint"""
        try:
            headers = {"Authorization": f"Bearer {token}"}
            analysis_request = {
                "symbol": "BTC",
                "timeframe": "1d",
                "analysis_type": "technical"
            }
            
            response = self.session.post(f"{API_BASE}/analysis/gemini", 
                                       json=analysis_request, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "analysis" in data and "symbol" in data:
                    analysis_length = len(data["analysis"])
                    if analysis_length > 100:  # Reasonable analysis length
                        self.log_test("Gemini Analysis", True, f"AI analysis generated ({analysis_length} chars)")
                        return True
                    else:
                        self.log_test("Gemini Analysis", False, "Analysis too short", data)
                else:
                    self.log_test("Gemini Analysis", False, "Missing analysis data", data)
            else:
                self.log_test("Gemini Analysis", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Gemini Analysis", False, "Gemini analysis failed", str(e))
        return False
    
    def test_admin_settings_get(self, admin_token):
        """Test getting admin settings"""
        try:
            headers = {"Authorization": f"Bearer {admin_token}"}
            response = self.session.get(f"{API_BASE}/admin/settings", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "basic_plan_price" in data and "premium_plan_price" in data:
                    self.log_test("Admin Settings Get", True, "Admin settings retrieved")
                    return True
                else:
                    self.log_test("Admin Settings Get", False, "Missing settings data", data)
            else:
                self.log_test("Admin Settings Get", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Admin Settings Get", False, "Admin settings get failed", str(e))
        return False
    
    def test_admin_settings_update(self, admin_token):
        """Test updating admin settings"""
        try:
            headers = {"Authorization": f"Bearer {admin_token}"}
            settings_update = {
                "basic_plan_price": 39.99,
                "premium_plan_price": 119.99,
                "trading_api_keys": {"test": "key"},
                "payment_api_keys": {"stripe": "test_key"}
            }
            
            response = self.session.put(f"{API_BASE}/admin/settings", 
                                      json=settings_update, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data:
                    self.log_test("Admin Settings Update", True, "Admin settings updated")
                    return True
                else:
                    self.log_test("Admin Settings Update", False, "Unexpected response", data)
            else:
                self.log_test("Admin Settings Update", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Admin Settings Update", False, "Admin settings update failed", str(e))
        return False
    
    def test_admin_users_list(self, admin_token):
        """Test getting all users (admin only)"""
        try:
            headers = {"Authorization": f"Bearer {admin_token}"}
            response = self.session.get(f"{API_BASE}/admin/users", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    self.log_test("Admin Users List", True, f"Retrieved {len(data)} users")
                    return True
                else:
                    self.log_test("Admin Users List", False, "No users found or invalid format", data)
            else:
                self.log_test("Admin Users List", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Admin Users List", False, "Admin users list failed", str(e))
        return False
    
    def test_admin_user_upgrade(self, admin_token, user_id, new_plan):
        """Test upgrading user plan"""
        try:
            headers = {"Authorization": f"Bearer {admin_token}"}
            # The endpoint expects new_plan as a query parameter
            response = self.session.put(f"{API_BASE}/admin/users/{user_id}/upgrade", 
                                      headers=headers, params={"new_plan": new_plan})
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data:
                    self.log_test("Admin User Upgrade", True, f"User upgraded to {new_plan}")
                    return True
                else:
                    self.log_test("Admin User Upgrade", False, "Unexpected response", data)
            else:
                self.log_test("Admin User Upgrade", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Admin User Upgrade", False, "Admin user upgrade failed", str(e))
        return False
    
    def test_unauthorized_access(self):
        """Test that admin endpoints reject non-admin users"""
        try:
            # Try to access admin endpoint without token
            response = self.session.get(f"{API_BASE}/admin/settings")
            if response.status_code == 401:
                self.log_test("Unauthorized Access", True, "Admin endpoint properly protected")
                return True
            else:
                self.log_test("Unauthorized Access", False, f"Expected 401, got {response.status_code}")
        except Exception as e:
            self.log_test("Unauthorized Access", False, "Unauthorized test failed", str(e))
        return False
    
    def run_all_tests(self):
        """Run comprehensive test suite"""
        print("🚀 Starting MK7 Trading Bot Backend API Tests")
        print("=" * 60)
        
        # 1. Basic connectivity
        if not self.test_health_check():
            print("❌ Health check failed - stopping tests")
            return False
        
        # 2. Authentication tests
        print("\n📝 Testing Authentication...")
        self.test_user_registration()
        
        # Login with demo users
        self.admin_token = self.test_user_login("admin@mk7.com", "admin123", "admin")
        self.premium_token = self.test_user_login("premium@mk7.com", "premium123", "premium")
        self.basic_token = self.test_user_login("basic@mk7.com", "basic123", "basic")
        
        # Test auth/me endpoint
        if self.admin_token:
            self.test_auth_me(self.admin_token, "admin@mk7.com")
        
        # 3. Market data tests
        print("\n📊 Testing Market Data...")
        self.test_crypto_prices()
        
        # 4. AI Analysis tests
        print("\n🤖 Testing AI Analysis...")
        if self.basic_token:
            self.test_gemini_analysis(self.basic_token)
        
        # 5. Admin functionality tests
        print("\n👑 Testing Admin Functionality...")
        if self.admin_token:
            self.test_admin_settings_get(self.admin_token)
            self.test_admin_settings_update(self.admin_token)
            users_data = self.test_admin_users_list(self.admin_token)
            
            # Test user upgrade with testuser
            if users_data:
                # Find testuser to upgrade
                test_user_id = None
                for user in users_data:
                    if user.get("email") == "testuser@mk7.com":
                        test_user_id = user.get("id")
                        break
                
                if test_user_id:
                    self.test_admin_user_upgrade(self.admin_token, test_user_id, "premium")
        
        # 6. Security tests
        print("\n🔒 Testing Security...")
        self.test_unauthorized_access()
        
        # Summary
        print("\n" + "=" * 60)
        print("📋 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        # Show failed tests
        failed_tests = [result for result in self.test_results if not result["success"]]
        if failed_tests:
            print("\n❌ Failed Tests:")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['message']}")
        
        return passed == total

if __name__ == "__main__":
    tester = MK7BackendTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All tests passed! Backend API is fully functional.")
    else:
        print("\n⚠️  Some tests failed. Check the details above.")