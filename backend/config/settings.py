"""
Water Quality Backend - Configuration
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Base Configuration"""
    
    # ============ FLASK ============
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-key-change-in-production')
    DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    
    # ============ DATABASE ============
    DATABASE_PATH = os.getenv('DATABASE_PATH', './data/water_quality.db')
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{DATABASE_PATH}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # ============ API ============
    API_HOST = os.getenv('API_HOST', '0.0.0.0')
    API_PORT = int(os.getenv('API_PORT', 5000))
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
    
    # ============ SENSOR THRESHOLDS ============
    SENSOR_THRESHOLDS = {
        'temperature': {'min': 0, 'max': 50, 'optimal_min': 15, 'optimal_max': 25},
        'ph': {'min': 0, 'max': 14, 'optimal_min': 6.5, 'optimal_max': 8.5},
        'tds': {'min': 0, 'max': 2000, 'optimal_min': 50, 'optimal_max': 250},
        'turbidity': {'min': 0, 'max': 40, 'optimal_min': 0, 'optimal_max': 5},
        'do': {'min': 0, 'max': 15, 'optimal_min': 5, 'optimal_max': 10},
    }
    
    # ============ QUALITY ASSESSMENT ============
    QUALITY_THRESHOLDS = {
        'OK': 0.70,
        'SUSPECT': 0.40,
        'FAIL': 0.00
    }
    
    QUALITY_ACTIONS = {
        'OK': 'ACCEPT_DATA',
        'SUSPECT': 'IMPUTE_AND_LOG',
        'FAIL': 'REQUEST_CALIBRATION'
    }


class DevelopmentConfig(Config):
    DEBUG = True
    TESTING = False


class ProductionConfig(Config):
    DEBUG = False
    TESTING = False


class TestingConfig(Config):
    DEBUG = True
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

FLASK_ENV = os.getenv('FLASK_ENV', 'development')
active_config = config.get(FLASK_ENV, config['default'])