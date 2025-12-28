"""
Quality Assessor - Rule-based fallback
"""

import logging

logger = logging.getLogger(__name__)


class QualityAssessor:
    """Rule-based quality assessor"""
    
    def assess(self, sensor_data):
        """Simple rule-based assessment"""
        try:
            temp = sensor_data.get('temperature', 22.5)
            ph = sensor_data.get('ph', 7.0)
            tds = sensor_data.get('tds', 250)
            turbidity = sensor_data.get('turbidity', 3.0)
            
            score = 0.5
            
            # pH check
            if 6.5 <= ph <= 8.5:
                score += 0.3
            elif 6.0 <= ph <= 9.0:
                score += 0.1
            
            # Temperature check
            if 15 <= temp <= 25:
                score += 0.2
            elif 10 <= temp <= 30:
                score += 0.1
            
            # TDS check
            if tds <= 500:
                score += 0.1
            elif tds <= 1000:
                score += 0.05
            
            # Turbidity check
            if turbidity <= 5:
                score += 0.1
            elif turbidity <= 10:
                score += 0.05
            
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
                'confidence': 0.7,
                'ml_model_used': 'rule_based'
            }
            
        except Exception as e:
            logger.error(f"Quality assessment error: {e}")
            return {
                'overall_score': 0.5,
                'quality_flag': 'SUSPECT',
                'confidence': 0.5,
                'ml_model_used': 'error_fallback'
            }