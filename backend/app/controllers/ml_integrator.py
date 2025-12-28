"""
Simple ML Integrator
"""

import logging

logger = logging.getLogger(__name__)


class MLIntegrator:
    """Simple ML integrator"""
    
    def __init__(self):
        self.available = False
        self._try_load_ml()
    
    def _try_load_ml(self):
        """Try to load ML modules"""
        try:
            # Try to import from your model folder
            import sys
            sys.path.insert(0, 'model')
            
            try:
                import config
                logger.info("✅ ML config loaded")
                self.available = True
            except ImportError:
                logger.warning("⚠️ ML config not found, using fallback")
                self.available = False
                
        except Exception as e:
            logger.warning(f"ML loading failed: {e}")
            self.available = False
    
    def is_available(self):
        return self.available
    
    def assess_quality(self, sensor_data):
        """Assess quality using ML or fallback"""
        if self.available:
            return self._ml_assessment(sensor_data)
        else:
            return self._fallback_assessment(sensor_data)
    
    def _ml_assessment(self, sensor_data):
        """ML-based assessment"""
        try:
            # Simple ML rules based on your config
            temp = sensor_data.get('temperature', 22.5)
            ph = sensor_data.get('ph', 7.0)
            tds = sensor_data.get('tds', 250)
            turbidity = sensor_data.get('turbidity', 3.0)
            
            # Calculate scores
            plausibility = self._check_plausibility(temp, ph, tds, turbidity)
            consistency = self._check_consistency(temp, ph, tds, turbidity)
            quality = self._predict_quality(temp, ph, tds, turbidity)
            
            # Combine scores
            overall_score = plausibility * 0.3 + consistency * 0.35 + quality * 0.35
            overall_score = max(0.0, min(1.0, overall_score))
            
            # Determine flag
            if overall_score >= 0.7:
                flag = 'OK'
            elif overall_score >= 0.4:
                flag = 'SUSPECT'
            else:
                flag = 'FAIL'
            
            return {
                'overall_score': round(overall_score, 3),
                'quality_flag': flag,
                'confidence': 0.8,
                'layer_scores': {
                    'plausibility': round(plausibility, 3),
                    'consistency': round(consistency, 3),
                    'quality_prediction': round(quality, 3)
                },
                'ml_model_used': '5-layer_simplified'
            }
            
        except Exception as e:
            logger.error(f"ML assessment error: {e}")
            return self._fallback_assessment(sensor_data)
    
    def _fallback_assessment(self, sensor_data):
        """Fallback rule-based assessment"""
        temp = sensor_data.get('temperature', 22.5)
        ph = sensor_data.get('ph', 7.0)
        tds = sensor_data.get('tds', 250)
        turbidity = sensor_data.get('turbidity', 3.0)
        
        score = 0.5
        
        if 6.5 <= ph <= 8.5:
            score += 0.3
        elif 6.0 <= ph <= 9.0:
            score += 0.1
        
        if 15 <= temp <= 25:
            score += 0.2
        elif 10 <= temp <= 30:
            score += 0.1
        
        if tds <= 500:
            score += 0.1
        
        if turbidity <= 5:
            score += 0.1
        
        score = max(0.0, min(1.0, score))
        
        if score >= 0.7:
            flag = 'OK'
        elif score >= 0.4:
            flag = 'SUSPECT'
        else:
            flag = 'FAIL'
        
        return {
            'overall_score': round(score, 3),
            'quality_flag': flag,
            'confidence': 0.6,
            'ml_model_used': 'fallback'
        }
    
    def _check_plausibility(self, temp, ph, tds, turbidity):
        """Check physical constraints"""
        score = 1.0
        
        if temp < 0 or temp > 50:
            score -= 0.5
        elif temp < 10 or temp > 40:
            score -= 0.2
        
        if ph < 0 or ph > 14:
            score -= 0.5
        elif ph < 3 or ph > 11:
            score -= 0.2
        
        return max(0.0, min(1.0, score))
    
    def _check_consistency(self, temp, ph, tds, turbidity):
        """Check consistency"""
        score = 0.8
        
        # Check correlations
        if temp > 30 and ph > 8.5:
            score -= 0.2  # High temp with high pH is unusual
        
        if turbidity > 20 and tds < 100:
            score -= 0.2  # High turbidity with low TDS is unusual
        
        return max(0.0, min(1.0, score))
    
    def _predict_quality(self, temp, ph, tds, turbidity):
        """Predict water quality"""
        score = 0.5
        
        if 6.5 <= ph <= 8.5:
            score += 0.2
        if 15 <= temp <= 25:
            score += 0.15
        if tds <= 500:
            score += 0.15
        if turbidity <= 5:
            score += 0.1
        
        return max(0.0, min(1.0, score))