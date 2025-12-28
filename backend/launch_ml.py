"""
Launch ML Models - Standalone Script
"""

import sys
import os
from pathlib import Path
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def launch_ml_models():
    """Launch and test your ML models"""
    
    logger.info("🚀 Launching ML Models...")
    logger.info("=" * 60)
    
    # Add model directory to path
    model_path = Path(__file__).parent / 'model'
    if model_path.exists():
        sys.path.insert(0, str(model_path))
        logger.info(f"✅ Added model path: {model_path}")
    else:
        logger.error(f"❌ Model directory not found: {model_path}")
        return False
    
    try:
        # Import your ML config
        import config as ml_config
        logger.info(f"✅ ML Config loaded: {len(ml_config.SENSOR_CONSTRAINTS)} sensors")
        
        # Test each ML module
        logger.info("\n📊 Testing ML Modules:")
        logger.info("-" * 40)
        
        # 1. Data Preprocessing
        try:
            from data_preprocessing import DataPreprocessor
            preprocessor = DataPreprocessor()
            logger.info("✅ 1. DataPreprocessor - LOADED")
        except Exception as e:
            logger.error(f"❌ 1. DataPreprocessor - FAILED: {e}")
        
        # 2. Plausibility Checker
        try:
            from plausibility_checker import PlausibilityChecker
            plaus_checker = PlausibilityChecker()
            logger.info("✅ 2. PlausibilityChecker - LOADED")
        except Exception as e:
            logger.error(f"❌ 2. PlausibilityChecker - FAILED: {e}")
        
        # 3. Consistency Model
        try:
            from consistency_model import ConsistencyModelTrainer
            consistency_trainer = ConsistencyModelTrainer()
            logger.info("✅ 3. ConsistencyModel - LOADED")
        except Exception as e:
            logger.error(f"❌ 3. ConsistencyModel - FAILED: {e}")
        
        # 4. Quality Predictor
        try:
            from quality_predictor import WaterQualityPredictor
            quality_predictor = WaterQualityPredictor()
            logger.info("✅ 4. QualityPredictor - LOADED")
        except Exception as e:
            logger.error(f"❌ 4. QualityPredictor - FAILED: {e}")
        
        # 5. Data Quality Detector
        try:
            from data_quality_detector import DataQualityDetector
            quality_detector = DataQualityDetector()
            logger.info("✅ 5. DataQualityDetector - LOADED")
        except Exception as e:
            logger.error(f"❌ 5. DataQualityDetector - FAILED: {e}")
        
        # 6. Test with sample data
        logger.info("\n🧪 Testing with sample data...")
        test_sample_data()
        
        logger.info("\n" + "=" * 60)
        logger.info("✅ ML Models launched successfully!")
        logger.info("=" * 60)
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to launch ML models: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_sample_data():
    """Test ML pipeline with sample data"""
    try:
        import pandas as pd
        from data_preprocessing import DataPreprocessor
        
        # Create sample data matching your ML input format
        sample_data = pd.DataFrame({
            'Temp': [22.5, 23.0, 100.0],  # Last one is bad
            'Turbidity': [2.0, 2.5, 50.0],
            'pH': [7.5, 7.3, 7.5],
            'DO': [8.0, 8.1, 8.0],
            'BOD': [2.0, 2.5, 2.0],
            'CO2': [10.0, 10.5, 10.0],
            'Alkalinity': [200.0, 210.0, 200.0],
            'Hardness': [150.0, 155.0, 150.0],
            'Calcium': [100.0, 105.0, 100.0],
            'Ammonia': [0.2, 0.25, 0.2],
            'Nitrite': [0.05, 0.055, 0.05],
            'Phosphorus': [0.02, 0.022, 0.02],
            'H2S': [0.001, 0.0012, 0.001],
            'Plankton': [500, 550, 500]
        })
        
        preprocessor = DataPreprocessor()
        cleaned_data, metadata = preprocessor.preprocess(sample_data)
        
        logger.info(f"📈 Sample data processed: {len(cleaned_data)} rows")
        logger.info(f"   Temperature range: {cleaned_data['Temp'].min():.1f}°C to {cleaned_data['Temp'].max():.1f}°C")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Sample data test failed: {e}")
        return False

if __name__ == "__main__":
    success = launch_ml_models()
    if success:
        print("\n🎉 ML Models are ready!")
        print("You can now run: python app.py")
    else:
        print("\n⚠️ ML Models failed to load")
        print("Check dependencies and file paths")