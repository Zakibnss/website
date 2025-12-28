"""
Water Quality API - Fixed Database Issue
"""

import os
import logging

print("=" * 80)
print("🌊 Water Quality Monitoring System - Starting Up")
print("=" * 80)

# Set up paths before creating app
base_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(base_dir, 'data')
logs_dir = os.path.join(base_dir, 'logs')

# Create directories
os.makedirs(data_dir, exist_ok=True)
os.makedirs(logs_dir, exist_ok=True)

print(f"📁 Data directory: {data_dir}")
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
from app import create_app, db

app = create_app()

# Test database connection
with app.app_context():
    try:
        # Create tables
        db.create_all()
        print("✅ Database tables created successfully")
        
        # Test connection
        from sqlalchemy import text
        db.session.execute(text('SELECT 1'))
        db.session.close()
        print("✅ Database connection successful")
        
    except Exception as e:
        print(f"❌ Database error: {e}")
        print("⚠️ Continuing without database...")

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
    print("=" * 80)
    
    app.run(
        host=host,
        port=port,
        debug=True
    )