from flask import Blueprint, request, jsonify
from datetime import datetime
import logging
from services.supabase_service import supabase_service

bp = Blueprint('api', __name__, url_prefix='/api')
logger = logging.getLogger(__name__)

@bp.route('/sensor/data', methods=['POST', 'GET', 'OPTIONS'])
def sensor_data():
    """Handle sensor data"""
    
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        return jsonify({'status': 'preflight'}), 200
    
    if request.method == 'GET':
        return get_sensor_data()
    
    elif request.method == 'POST':
        return post_sensor_data()

def get_sensor_data():
    """Get sensor data"""
    try:
        # Get query parameters
        limit = int(request.args.get('limit', 100))
        offset = int(request.args.get('offset', 0))
        
        # Get readings from Supabase
        readings = supabase_service.get_readings(limit=limit, offset=offset)
        
        # Add quality analysis
        for reading in readings:
            reading['quality'] = supabase_service.determine_water_quality(reading)
        
        return jsonify({
            'status': 'success',
            'count': len(readings),
            'readings': readings
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting sensor data: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

def post_sensor_data():
    """Post new sensor data"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'No data provided'
            }), 400
        
        print(f"📥 Received data: {data}")
        
        # Validate required fields
        required_fields = ['device_id', 'temperature', 'ph', 'tds', 'turbidity', 'latitude', 'longitude']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({
                'status': 'error',
                'message': f'Missing required fields: {missing_fields}',
                'received_data': data
            }), 400
        
        # Prepare data for Supabase
        reading_data = {
            'device_id': str(data['device_id']),
            'temperature': float(data['temperature']),
            'ph': float(data['ph']),
            'tds': int(float(data['tds'])),
            'turbidity': float(data['turbidity']),
            'latitude': float(data['latitude']),
            'longitude': float(data['longitude'])
        }
        
        # Create reading in Supabase
        reading = supabase_service.create_reading(reading_data)
        
        # Determine water quality
        quality = supabase_service.determine_water_quality(reading_data)
        
        print(f"✅ Data saved. Quality: {quality}")
        
        return jsonify({
            'status': 'success',
            'message': 'Data received and stored in Supabase',
            'reading_id': reading['id'],
            'quality': quality,
            'data': reading
        }), 201
        
    except Exception as e:
        logger.error(f"Error posting sensor data: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@bp.route('/statistics', methods=['GET'])
def get_statistics():
    """Get statistics"""
    try:
        stats = supabase_service.get_statistics()
        
        return jsonify({
            'status': 'success',
            'data': stats
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting statistics: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@bp.route('/latest', methods=['GET'])
def get_latest():
    """Get latest readings for each device"""
    try:
        latest_readings = supabase_service.get_latest_readings()
        
        # Add quality to each reading
        for reading in latest_readings:
            reading['quality'] = supabase_service.determine_water_quality(reading)
        
        return jsonify({
            'status': 'success',
            'count': len(latest_readings),
            'readings': latest_readings
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting latest readings: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Test Supabase connection
        stats = supabase_service.get_statistics()
        
        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'supabase': 'online',
            'timestamp': datetime.utcnow().isoformat(),
            'statistics': {
                'total_readings': stats['total_readings'],
                'unique_devices': stats['unique_devices']
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            'status': 'unhealthy',
            'database': 'disconnected',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@bp.route('/test', methods=['GET'])
def test_endpoint():
    """Test endpoint"""
    return jsonify({
        'status': 'online',
        'service': 'Water Quality Monitoring API',
        'backend': 'Flask + Supabase',
        'timestamp': datetime.utcnow().isoformat(),
        'endpoints': {
            'POST sensor data': '/api/sensor/data',
            'GET all data': '/api/sensor/data',
            'GET statistics': '/api/statistics',
            'GET latest': '/api/latest',
            'Health check': '/api/health'
        }
    }), 200