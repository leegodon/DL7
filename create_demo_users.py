#!/usr/bin/env python3
"""
Script to create demo users for MK7 Trading Bot
"""
import sys
import os
sys.path.append('/app/backend')

import requests
from datetime import datetime

API_URL = "http://localhost:8001"

def create_demo_users():
    """Create demo users with different plan types"""
    
    demo_users = [
        {
            "email": "admin@mk7.com",
            "password": "admin123",
            "full_name": "Admin User",
            "user_type": "admin"
        },
        {
            "email": "premium@mk7.com", 
            "password": "premium123",
            "full_name": "Premium User",
            "user_type": "premium"
        },
        {
            "email": "basic@mk7.com",
            "password": "basic123", 
            "full_name": "Basic User",
            "user_type": "basic"
        }
    ]
    
    print("Creating demo users...")
    
    for user_data in demo_users:
        try:
            # Register user
            response = requests.post(f"{API_URL}/api/auth/register", json={
                "email": user_data["email"],
                "password": user_data["password"],
                "full_name": user_data["full_name"]
            })
            
            if response.status_code == 200:
                print(f"✅ Created user: {user_data['email']}")
                
                # For admin user, upgrade the plan
                if user_data["user_type"] != "basic":
                    token = response.json()["access_token"]
                    
                    # First, we need to create an admin token to upgrade users
                    # For now, let's just note that manual upgrade will be needed
                    print(f"   Note: {user_data['email']} needs manual upgrade to {user_data['user_type']}")
                    
            else:
                print(f"❌ Failed to create user {user_data['email']}: {response.text}")
                
        except Exception as e:
            print(f"❌ Error creating user {user_data['email']}: {str(e)}")
    
    print("\nDemo users created! Use these credentials to test:")
    print("- Admin: admin@mk7.com / admin123")
    print("- Premium: premium@mk7.com / premium123") 
    print("- Basic: basic@mk7.com / basic123")
    print("\nNote: Admin will need to manually upgrade premium user in the admin dashboard.")

if __name__ == "__main__":
    create_demo_users()