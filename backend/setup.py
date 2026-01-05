#!/usr/bin/env python3
"""
Setup script for Water Quality API
"""

import os
import sys

def setup_environment():
    print("🔧 Setting up Water Quality API...")
    
    # Check Python version
    if sys.version_info < (3, 7):
        print("❌ Python 3.7 or higher is required")
        return False
    
    # Create necessary directories
    directories = ['logs', 'config', 'services', 'app/controllers']
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"✅ Created directory: {directory}")
    
    # Create .env file if it doesn't exist
    if not os.path.exists('.env'):
        with open('.env', 'w') as f:
            f.write("""# Supabase Configuration
SUPABASE_URL=https://sfxdncqldxgfssenmrql.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmeGRuY3FsZHhnZnNzZW5tcnFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MjU1NjUsImV4cCI6MjA4MjUwMTU2NX0.2-l7viDJl9TTkC9qrwdq5jqMxMt3VmEp6ZpDkfmauEo
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmeGRuY3FsZHhnZnNzZW5tcnFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MjU1NjUsImV4cCI6MjA4MjUwMTU2NX0.2-l7viDJl9TTkC9qrwdq5jqMxMt3VmEp6ZpDkfmauEo

# Flask Configuration
SECRET_KEY=water-quality-monitoring-secret-key-2024
FLASK_ENV=production

# Server Configuration
HOST=0.0.0.0
PORT=5000
""")
        print("✅ Created .env file")
    
    print("\n📦 Installing dependencies...")
    os.system("pip install -r requirements.txt")
    
    print("\n✅ Setup complete!")
    print("\nTo start the server:")
    print("  python run.py")
    
    return True

if __name__ == '__main__':
    setup_environment()