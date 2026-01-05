"""
Water Quality API - Supabase Backend
"""

import os
import logging
from dotenv import load_dotenv

print("=" * 80)
print("🌊 Water Quality Monitoring System - Starting Up")
print("=" * 80)

# Load environment variables
load_dotenv()

# Check Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ ERROR: Missing Supabase configuration")
    print("Please create a .env file with:")
    print("SUPABASE_URL=https://sfxdncqldxgfssenmrql.supabase.co")
    print("SUPABASE_SERVICE_KEY=your-service-key")
    exit(1)

print(f"🔗 Supabase URL: {SUPABASE_URL}")
print(f"🔑 Supabase Key: {SUPABASE_KEY[:20]}...")

# Set up paths
base_dir = os.path.dirname(os.path.abspath(__file__))
logs_dir = os.path.join(base_dir, 'logs')

# Create directories
os.makedirs(logs_dir, exist_ok=True)

print(f"📁 Logs directory: {logs_dir}")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(logs_dir, 'api.log')),
        logging.StreamHandler()
    ]
)

# Now create the app
try:
    from app import create_app
    app = create_app()
    print("✅ Flask app created successfully")
except Exception as e:
    print(f"❌ Error creating Flask app: {e}")
    exit(1)

# Test Supabase connection
try:
    from services.supabase_service import supabase_service
    stats = supabase_service.get_statistics()
    print(f"✅ Supabase connection successful")
    print(f"📊 Current statistics: {stats['total_readings']} readings from {stats['unique_devices']} devices")
except Exception as e:
    print(f"⚠️ Supabase connection failed: {e}")
    print("⚠️ Some features may not work properly")

# Import ML integrator after app is created
try:
    from app.controllers.ml_integrator import MLIntegrator
    ml_integrator = MLIntegrator()
    ml_status = "✅ Available" if ml_integrator.is_available() else "⚠️ Fallback"
    print(f"🤖 ML Integration: {ml_status}")
except Exception as e:
    print(f"⚠️ ML Integration failed: {e}")

if __name__ == '__main__':
    host = '0.0.0.0'
    port = 5000
    
    print(f"\n🚀 Starting server on {host}:{port}")
    print(f"📡 API Endpoint: http://{host}:{port}/api/sensor/data")
    print(f"🏥 Health Check: http://{host}:{port}/api/health")
    print("=" * 80)
    print("✅ Ready to receive IoT data!")
    print("=" * 80)
    
    app.run(
        host=host,
        port=port,
        debug=True
    )