#!/usr/bin/env python3
"""
Zoom API Integration for PassionBots LMS
Allows direct creation and management of Zoom meetings from admin panel
"""

import os
import requests
import json
import base64
from datetime import datetime, timedelta
import jwt
import time

# Zoom API Configuration
ZOOM_ACCOUNT_ID = os.environ.get('ZOOM_ACCOUNT_ID', '')
ZOOM_CLIENT_ID = os.environ.get('ZOOM_CLIENT_ID', '')
ZOOM_CLIENT_SECRET = os.environ.get('ZOOM_CLIENT_SECRET', '')

# Alternative: Use JWT (Server-to-Server OAuth)
ZOOM_API_KEY = os.environ.get('ZOOM_API_KEY', '')  # Deprecated but still works
ZOOM_API_SECRET = os.environ.get('ZOOM_API_SECRET', '')  # Deprecated but still works

class ZoomIntegration:
    """
    Zoom API Integration Class
    Supports both OAuth and JWT authentication
    """
    
    def __init__(self):
        self.base_url = "https://api.zoom.us/v2"
        self.access_token = None
        self.token_expires_at = None
        
    def get_access_token(self):
        """
        Get OAuth access token using Server-to-Server OAuth
        This is the NEW recommended method by Zoom
        """
        if self.access_token and self.token_expires_at and time.time() < self.token_expires_at:
            return self.access_token
        
        if not ZOOM_ACCOUNT_ID or not ZOOM_CLIENT_ID or not ZOOM_CLIENT_SECRET:
            raise Exception("Zoom OAuth credentials not configured. Please set ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, and ZOOM_CLIENT_SECRET")
        
        url = "https://zoom.us/oauth/token"
        
        # Create Basic Auth header
        auth_string = f"{ZOOM_CLIENT_ID}:{ZOOM_CLIENT_SECRET}"
        auth_bytes = auth_string.encode('ascii')
        auth_base64 = base64.b64encode(auth_bytes).decode('ascii')
        
        headers = {
            "Authorization": f"Basic {auth_base64}",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        data = {
            "grant_type": "account_credentials",
            "account_id": ZOOM_ACCOUNT_ID
        }
        
        try:
            response = requests.post(url, headers=headers, data=data, timeout=10)
            response.raise_for_status()
            
            result = response.json()
            self.access_token = result['access_token']
            # Token expires in 1 hour, refresh 5 minutes before
            self.token_expires_at = time.time() + result.get('expires_in', 3600) - 300
            
            return self.access_token
        except Exception as e:
            raise Exception(f"Failed to get Zoom access token: {str(e)}")
    
    def get_jwt_token(self):
        """
        Generate JWT token (Legacy method - still works)
        Use this if you have JWT credentials
        """
        if not ZOOM_API_KEY or not ZOOM_API_SECRET:
            raise Exception("Zoom JWT credentials not configured")
        
        payload = {
            'iss': ZOOM_API_KEY,
            'exp': datetime.utcnow() + timedelta(hours=1)
        }
        
        token = jwt.encode(payload, ZOOM_API_SECRET, algorithm='HS256')
        return token
    
    def get_headers(self):
        """Get authorization headers for API requests"""
        try:
            # Try OAuth first (recommended)
            token = self.get_access_token()
            return {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
        except:
            # Fall back to JWT if OAuth not configured
            try:
                token = self.get_jwt_token()
                return {
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                }
            except:
                raise Exception("No valid Zoom credentials configured")
    
    def create_meeting(self, topic, start_time, duration_minutes, agenda=None, password=None):
        """
        Create a new Zoom meeting
        
        Args:
            topic (str): Meeting title/topic
            start_time (str): Start time in ISO format (YYYY-MM-DDTHH:MM:SSZ)
            duration_minutes (int): Meeting duration in minutes
            agenda (str): Meeting description/agenda
            password (str): Meeting password (optional, Zoom auto-generates if not provided)
        
        Returns:
            dict: Meeting details including join URL, meeting ID, password, etc.
        """
        url = f"{self.base_url}/users/me/meetings"
        headers = self.get_headers()
        
        meeting_data = {
            "topic": topic,
            "type": 2,  # Scheduled meeting
            "start_time": start_time,
            "duration": duration_minutes,
            "timezone": "Asia/Kolkata",  # IST
            "agenda": agenda or topic,
            "settings": {
                "host_video": True,
                "participant_video": True,
                "join_before_host": False,
                "mute_upon_entry": True,
                "watermark": False,
                "use_pmi": False,
                "approval_type": 0,  # Automatically approve
                "audio": "both",  # Telephone and VoIP
                "auto_recording": "cloud",  # Auto record to cloud
                "waiting_room": False,
                "registrants_email_notification": True
            }
        }
        
        if password:
            meeting_data["password"] = password
        
        try:
            response = requests.post(url, headers=headers, json=meeting_data, timeout=10)
            response.raise_for_status()
            
            meeting = response.json()
            
            return {
                "success": True,
                "meeting_id": str(meeting['id']),
                "meeting_number": meeting['id'],
                "topic": meeting['topic'],
                "start_time": meeting['start_time'],
                "duration": meeting['duration'],
                "timezone": meeting['timezone'],
                "password": meeting.get('password', ''),
                "join_url": meeting['join_url'],
                "start_url": meeting['start_url'],
                "host_id": meeting['host_id'],
                "status": meeting['status']
            }
        except requests.exceptions.HTTPError as e:
            error_msg = e.response.json() if e.response else str(e)
            return {
                "success": False,
                "error": f"Failed to create Zoom meeting: {error_msg}"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Unexpected error: {str(e)}"
            }
    
    def get_meeting(self, meeting_id):
        """Get meeting details"""
        url = f"{self.base_url}/meetings/{meeting_id}"
        headers = self.get_headers()
        
        try:
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            return {"success": True, "meeting": response.json()}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def update_meeting(self, meeting_id, topic=None, start_time=None, duration=None, agenda=None):
        """Update existing meeting"""
        url = f"{self.base_url}/meetings/{meeting_id}"
        headers = self.get_headers()
        
        update_data = {}
        if topic:
            update_data["topic"] = topic
        if start_time:
            update_data["start_time"] = start_time
        if duration:
            update_data["duration"] = duration
        if agenda:
            update_data["agenda"] = agenda
        
        try:
            response = requests.patch(url, headers=headers, json=update_data, timeout=10)
            response.raise_for_status()
            return {"success": True, "message": "Meeting updated successfully"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def delete_meeting(self, meeting_id):
        """Delete meeting"""
        url = f"{self.base_url}/meetings/{meeting_id}"
        headers = self.get_headers()
        
        try:
            response = requests.delete(url, headers=headers, timeout=10)
            response.raise_for_status()
            return {"success": True, "message": "Meeting deleted successfully"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def list_meetings(self, user_id='me', meeting_type='scheduled'):
        """List all meetings for a user"""
        url = f"{self.base_url}/users/{user_id}/meetings"
        headers = self.get_headers()
        params = {"type": meeting_type}
        
        try:
            response = requests.get(url, headers=headers, params=params, timeout=10)
            response.raise_for_status()
            return {"success": True, "meetings": response.json().get('meetings', [])}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def get_recording(self, meeting_id):
        """Get meeting recording details"""
        url = f"{self.base_url}/meetings/{meeting_id}/recordings"
        headers = self.get_headers()
        
        try:
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            return {"success": True, "recording": response.json()}
        except Exception as e:
            return {"success": False, "error": str(e)}


def create_zoom_meeting_for_class(class_title, class_date, class_time, duration_minutes, instructor_name, description=None):
    """
    Convenience function to create Zoom meeting for a class
    
    Args:
        class_title (str): Title of the class
        class_date (str): Date in YYYY-MM-DD format
        class_time (str): Time in HH:MM format
        duration_minutes (int): Duration in minutes
        instructor_name (str): Name of the instructor
        description (str): Class description
    
    Returns:
        dict: Meeting details or error
    """
    zoom = ZoomIntegration()
    
    # Combine date and time into ISO format
    start_datetime = f"{class_date}T{class_time}:00"
    
    # Create meeting
    result = zoom.create_meeting(
        topic=f"{class_title} - {instructor_name}",
        start_time=start_datetime,
        duration_minutes=duration_minutes,
        agenda=description or class_title
    )
    
    return result


if __name__ == "__main__":
    """
    Test the Zoom integration
    """
    print("\n🔵 Zoom API Integration Test\n")
    print("=" * 70)
    
    # Check if credentials are configured
    if not (ZOOM_ACCOUNT_ID and ZOOM_CLIENT_ID and ZOOM_CLIENT_SECRET) and not (ZOOM_API_KEY and ZOOM_API_SECRET):
        print("\n❌ ERROR: Zoom credentials not configured!")
        print("\nPlease set environment variables:")
        print("\nOption 1: Server-to-Server OAuth (Recommended)")
        print("  export ZOOM_ACCOUNT_ID='your-account-id'")
        print("  export ZOOM_CLIENT_ID='your-client-id'")
        print("  export ZOOM_CLIENT_SECRET='your-client-secret'")
        print("\nOption 2: JWT (Legacy)")
        print("  export ZOOM_API_KEY='your-api-key'")
        print("  export ZOOM_API_SECRET='your-api-secret'")
        print("\n📚 Setup Guide: See ZOOM_INTEGRATION_GUIDE.md")
        exit(1)
    
    # Test creating a meeting
    print("\n📅 Creating test Zoom meeting...")
    
    zoom = ZoomIntegration()
    result = create_zoom_meeting_for_class(
        class_title="Test IoT Class",
        class_date="2026-01-15",
        class_time="18:00",
        duration_minutes=90,
        instructor_name="Test Instructor",
        description="This is a test class for Zoom integration"
    )
    
    if result.get('success'):
        print("\n✅ Meeting created successfully!")
        print(f"\n📋 Meeting Details:")
        print(f"   Meeting ID: {result['meeting_id']}")
        print(f"   Topic: {result['topic']}")
        print(f"   Start Time: {result['start_time']}")
        print(f"   Duration: {result['duration']} minutes")
        print(f"   Password: {result['password']}")
        print(f"\n🔗 Join URL: {result['join_url']}")
        print(f"🎥 Start URL (Host): {result['start_url']}")
        
        # Test getting meeting details
        print("\n\n🔍 Fetching meeting details...")
        details = zoom.get_meeting(result['meeting_id'])
        if details.get('success'):
            print("✅ Meeting details retrieved successfully")
        
        # Clean up - delete test meeting
        print("\n\n🗑️ Cleaning up test meeting...")
        delete_result = zoom.delete_meeting(result['meeting_id'])
        if delete_result.get('success'):
            print("✅ Test meeting deleted successfully")
    else:
        print(f"\n❌ Failed to create meeting: {result.get('error')}")
    
    print("\n" + "=" * 70)
    print("Test complete!")
