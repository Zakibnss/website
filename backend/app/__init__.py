from flask import Flask
from flask_cors import CORS
import os

def create_app():
    app = Flask(__name__)
    
    # Enable CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'water-quality-secret-key')
    
    # Register blueprint
    from app.routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')
    
    print("✅ API routes registered")
    
    return app