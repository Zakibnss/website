"""
Flask Application Factory - Fixed version
"""

from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os
from flask_cors import CORS

db = SQLAlchemy()


def create_app():
    """Create and configure Flask app"""
    
    app = Flask(__name__)
    
    # Get absolute path to backend directory
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(base_dir, 'data')
    
    # Create data directory if it doesn't exist
    os.makedirs(data_dir, exist_ok=True)
    
    # Database configuration
    database_path = os.path.join(data_dir, 'water_quality.db')
    database_uri = f'sqlite:///{database_path}'
    
    app.config['SECRET_KEY'] = 'dev-key-change-in-production'
    app.config['DEBUG'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = database_uri
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    print(f"📁 Database path: {database_path}")
    print(f"📁 Data directory: {data_dir}")
    
    # Initialize extensions
    db.init_app(app)
    CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173", "http://localhost:3000"],
        "methods": ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type"],
        "supports_credentials": True
    }
})

    
    # Create logs directory
    logs_dir = os.path.join(base_dir, 'logs')
    os.makedirs(logs_dir, exist_ok=True)
    
    # Register blueprints
    from app.routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')
    
    return app