"""
Setup script
"""

print("Setting up Water Quality Backend...")
print("=" * 60)

# Create necessary directories
import os
os.makedirs('data', exist_ok=True)
os.makedirs('logs', exist_ok=True)
os.makedirs('app/controllers', exist_ok=True)

print("✅ Created directories: data/, logs/, app/controllers/")

# Create empty database
import sqlite3
conn = sqlite3.connect('data/water_quality.db')
conn.close()
print("✅ Created database: data/water_quality.db")

print("\n✅ Setup complete!")
print("Run: python app.py")