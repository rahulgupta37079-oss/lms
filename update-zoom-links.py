#!/usr/bin/env python3
"""
Update Zoom Meeting Links for Live Classes
"""
import subprocess
import json

# Real Zoom meeting configuration
# Replace these with your actual Zoom meeting details
ZOOM_CLASSES = [
    {
        "class_id": 1,
        "title": "Introduction to IoT & Robotics",
        "zoom_meeting_id": "123-456-7890",  # Replace with real ID
        "zoom_password": "iot2024",          # Replace with real password
        "zoom_join_url": "https://zoom.us/j/1234567890?pwd=iot2024",  # Replace with real URL
        "zoom_start_url": "https://zoom.us/s/1234567890?zak=host_token",  # Optional: Host start URL
    },
    {
        "class_id": 2,
        "title": "Arduino Basics - Part 1",
        "zoom_meeting_id": "234-567-8901",
        "zoom_password": "arduino2024",
        "zoom_join_url": "https://zoom.us/j/2345678901?pwd=arduino2024",
        "zoom_start_url": "https://zoom.us/s/2345678901?zak=host_token",
    },
    {
        "class_id": 3,
        "title": "Sensor Integration Workshop",
        "zoom_meeting_id": "345-678-9012",
        "zoom_password": "sensor2024",
        "zoom_join_url": "https://zoom.us/j/3456789012?pwd=sensor2024",
        "zoom_start_url": "https://zoom.us/s/3456789012?zak=host_token",
    }
]

def update_zoom_links_local():
    """Update Zoom links in local database"""
    print("🔄 Updating Zoom Links - LOCAL DATABASE")
    print("=" * 70)
    
    for zoom_class in ZOOM_CLASSES:
        print(f"\n📹 Updating: {zoom_class['title']}")
        print(f"   Class ID: {zoom_class['class_id']}")
        print(f"   Meeting ID: {zoom_class['zoom_meeting_id']}")
        
        sql = f"""
        UPDATE live_classes 
        SET 
            zoom_meeting_id = '{zoom_class['zoom_meeting_id']}',
            zoom_password = '{zoom_class['zoom_password']}',
            zoom_join_url = '{zoom_class['zoom_join_url']}',
            zoom_start_url = '{zoom_class['zoom_start_url']}',
            updated_at = CURRENT_TIMESTAMP
        WHERE class_id = {zoom_class['class_id']}
        """
        
        cmd = [
            "npx", "wrangler", "d1", "execute",
            "passionbots-lms-production",
            "--local",
            "--command=" + sql
        ]
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            if result.returncode == 0:
                print(f"   ✅ Updated successfully")
            else:
                print(f"   ❌ Failed: {result.stderr}")
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
    
    print("\n" + "=" * 70)
    print("✅ Local database updated!")

def update_zoom_links_production():
    """Update Zoom links in production database"""
    print("\n🔄 Updating Zoom Links - PRODUCTION DATABASE")
    print("=" * 70)
    
    for zoom_class in ZOOM_CLASSES:
        print(f"\n📹 Updating: {zoom_class['title']}")
        print(f"   Class ID: {zoom_class['class_id']}")
        print(f"   Meeting ID: {zoom_class['zoom_meeting_id']}")
        
        sql = f"""
        UPDATE live_classes 
        SET 
            zoom_meeting_id = '{zoom_class['zoom_meeting_id']}',
            zoom_password = '{zoom_class['zoom_password']}',
            zoom_join_url = '{zoom_class['zoom_join_url']}',
            zoom_start_url = '{zoom_class['zoom_start_url']}',
            updated_at = CURRENT_TIMESTAMP
        WHERE class_id = {zoom_class['class_id']}
        """
        
        cmd = [
            "npx", "wrangler", "d1", "execute",
            "passionbots-lms-production",
            "--remote",
            "--command=" + sql
        ]
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            if result.returncode == 0:
                print(f"   ✅ Updated successfully")
            else:
                print(f"   ❌ Failed: {result.stderr}")
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
    
    print("\n" + "=" * 70)
    print("✅ Production database updated!")

def verify_zoom_links():
    """Verify Zoom links are updated correctly"""
    print("\n🔍 Verifying Zoom Links")
    print("=" * 70)
    
    cmd = [
        "npx", "wrangler", "d1", "execute",
        "passionbots-lms-production",
        "--remote",
        "--command=SELECT class_id, class_title, zoom_meeting_id, zoom_join_url FROM live_classes"
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        print(result.stdout)
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    import sys
    
    print("\n🎓 PassionBots - Zoom Link Updater")
    print("=" * 70)
    print("\n⚠️  IMPORTANT: Edit this script to add your real Zoom meeting details")
    print("   Update the ZOOM_CLASSES list at the top of this file")
    print("\nOptions:")
    print("  1. Update LOCAL database (for testing)")
    print("  2. Update PRODUCTION database (live site)")
    print("  3. Verify current links")
    print("=" * 70)
    
    if len(sys.argv) < 2:
        print("\nUsage:")
        print("  python3 update-zoom-links.py local      # Update local database")
        print("  python3 update-zoom-links.py production # Update production database")
        print("  python3 update-zoom-links.py verify     # Verify current links")
        sys.exit(1)
    
    action = sys.argv[1].lower()
    
    if action == "local":
        update_zoom_links_local()
    elif action == "production":
        print("\n⚠️  WARNING: This will update PRODUCTION database!")
        confirm = input("Are you sure? (yes/no): ")
        if confirm.lower() == "yes":
            update_zoom_links_production()
        else:
            print("❌ Cancelled")
    elif action == "verify":
        verify_zoom_links()
    else:
        print(f"❌ Unknown action: {action}")
        print("Use: local, production, or verify")
