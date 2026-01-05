from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import logging
from services.supabase_service import supabase_service  # Import Supabase service

api_bp = Blueprint('api', __name__)
logger = logging.getLogger(__name__)


# ============================================================================
# HEALTH & STATUS ENDPOINTS
# ============================================================================

@api_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Test Supabase connection
        stats = supabase_service.get_statistics()
        
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'service': 'Water Quality API',
            'version': '1.0.0',
            'database': 'Supabase',
            'stats': {
                'total_readings': stats['total_readings'],
                'unique_devices': stats['unique_devices']
            }
        }), 200
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            'status': 'unhealthy',
            'timestamp': datetime.utcnow().isoformat(),
            'error': str(e)
        }), 500


# ============================================================================
# SENSOR DATA ENDPOINTS
# ============================================================================

@api_bp.route('/sensor/data', methods=['POST'])
def receive_sensor_data():
    """
    Receive sensor data from IoT devices
    
    Expected JSON:
    {
        "device_id": "sensor-01",
        "temperature": 22.5,
        "ph": 7.5,
        "tds": 180,
        "turbidity": 2.0,
        "latitude": 35.1892,
        "longitude": -0.6417
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'device_id' not in data:
            return jsonify({'error': 'device_id is required'}), 400
        
        # Validate required fields
        required_fields = ['device_id', 'temperature', 'ph', 'tds', 'turbidity', 'latitude', 'longitude']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({
                'error': f'Missing required fields: {missing_fields}',
                'received': data
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
        
        logger.info(f"✅ Data received from {data['device_id']} (Quality: {quality})")
        
        return jsonify({
            'success': True,
            'id': reading['id'],
            'message': 'Data saved successfully in Supabase',
            'quality': quality,
            'timestamp': reading['created_at'],
            'data': reading
        }), 201
        
    except Exception as e:
        logger.error(f"❌ Error receiving data: {str(e)}")
        return jsonify({'error': str(e)}), 500


# ============================================================================
# READINGS ENDPOINTS
# ============================================================================

@api_bp.route('/readings', methods=['GET'])
def get_readings():
    """
    Get stored sensor readings
    
    Query parameters:
    - limit: Number of readings to return (default: 10)
    - device_id: Filter by device_id (optional)
    """
    try:
        limit = request.args.get('limit', 10, type=int)
        device_id = request.args.get('device_id', None)
        offset = request.args.get('offset', 0, type=int)
        
        # Get readings from Supabase
        readings = supabase_service.get_readings(limit=limit, offset=offset)
        
        # Filter by device if specified
        if device_id:
            readings = [r for r in readings if r['device_id'] == device_id]
        
        # Add quality analysis
        for reading in readings:
            reading['quality'] = supabase_service.determine_water_quality(reading)
        
        logger.info(f"Retrieved {len(readings)} readings")
        
        return jsonify({
            'count': len(readings),
            'limit': limit,
            'offset': offset,
            'readings': readings
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error retrieving readings: {str(e)}")
        return jsonify({'error': str(e)}), 500


@api_bp.route('/readings/history', methods=['GET'])
def get_historical_data():
    """
    Get historical data for specified number of days
    
    Query parameters:
    - days: Number of days to retrieve (default: 7)
    """
    try:
        days = request.args.get('days', 7, type=int)
        
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Get all readings (we'll filter by date in code for simplicity)
        # In production, you'd want to add date filtering to Supabase query
        readings = supabase_service.get_readings(limit=1000)  # Get more readings
        
        # Filter by date
        filtered_readings = []
        for reading in readings:
            if 'created_at' in reading:
                reading_date = datetime.fromisoformat(reading['created_at'].replace('Z', '+00:00'))
                if start_date <= reading_date <= end_date:
                    # Add quality
                    reading['quality'] = supabase_service.determine_water_quality(reading)
                    filtered_readings.append(reading)
        
        # Group by date
        data_by_date = {}
        for reading in filtered_readings:
            if 'created_at' in reading:
                date_key = reading['created_at'][:10]  # Extract YYYY-MM-DD
                if date_key not in data_by_date:
                    data_by_date[date_key] = []
                data_by_date[date_key].append(reading)
        
        logger.info(f"Retrieved {len(filtered_readings)} historical readings")
        
        return jsonify({
            'days': days,
            'count': len(filtered_readings),
            'data': data_by_date
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error retrieving historical data: {str(e)}")
        return jsonify({'error': str(e)}), 500


# ============================================================================
# STATISTICS ENDPOINTS
# ============================================================================

@api_bp.route('/statistics', methods=['GET'])
def get_statistics():
    """Get basic statistics about stored readings"""
    try:
        stats = supabase_service.get_statistics()
        
        return jsonify(stats), 200
        
    except Exception as e:
        logger.error(f"❌ Error calculating statistics: {str(e)}")
        return jsonify({
            'error': str(e),
            'total_readings': 0,
            'unique_devices': 0,
            'quality_summary': {'good': 0, 'warning': 0, 'danger': 0}
        }), 500


# ============================================================================
# HEATMAP DATA ENDPOINT
# ============================================================================

@api_bp.route('/heatmap', methods=['GET'])
def get_heatmap_data():
    """
    Get heatmap data (aggregated readings by location)
    
    Query parameters:
    - days: Number of days to retrieve (default: 7)
    """
    try:
        days = request.args.get('days', 7, type=int)
        
        # Get latest readings for each device
        latest_readings = supabase_service.get_latest_readings()
        
        # Create heatmap data points
        heatmap_data = []
        for reading in latest_readings:
            if reading.get('latitude') and reading.get('longitude'):
                quality = supabase_service.determine_water_quality(reading)
                
                heatmap_data.append({
                    'lat': reading['latitude'],
                    'lng': reading['longitude'],
                    'value': 1.0 if quality == 'good' else 0.5 if quality == 'warning' else 0.1,
                    'quality': quality,
                    'device_id': reading['device_id'],
                    'temperature': reading.get('temperature'),
                    'ph': reading.get('ph'),
                    'tds': reading.get('tds'),
                    'turbidity': reading.get('turbidity'),
                    'timestamp': reading.get('created_at')
                })
        
        logger.info(f"Retrieved {len(heatmap_data)} heatmap points")
        
        return jsonify({
            'days': days,
            'count': len(heatmap_data),
            'heatmap': heatmap_data
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error retrieving heatmap data: {str(e)}")
        return jsonify({'error': str(e)}), 500


# ============================================================================
# ALERTS ENDPOINTS
# ============================================================================

@api_bp.route('/alerts', methods=['GET'])
def get_alerts():
    """Get current alerts based on quality flags"""
    try:
        # Get all readings
        readings = supabase_service.get_readings(limit=100)
        
        alerts = []
        
        for reading in readings:
            quality = supabase_service.determine_water_quality(reading)
            
            if quality == 'danger':
                alerts.append({
                    'id': f"alert_{reading['id']}",
                    'severity': 'critical',
                    'message': f"Critical water quality issue at {reading['device_id']}",
                    'timestamp': reading.get('created_at'),
                    'resolved': False,
                    'reading_id': reading['id'],
                    'device_id': reading['device_id'],
                    'quality': quality
                })
            elif quality == 'warning':
                alerts.append({
                    'id': f"alert_{reading['id']}_suspect",
                    'severity': 'warning',
                    'message': f"Suspect water quality at {reading['device_id']}",
                    'timestamp': reading.get('created_at'),
                    'resolved': False,
                    'reading_id': reading['id'],
                    'device_id': reading['device_id'],
                    'quality': quality
                })
        
        logger.info(f"Retrieved {len(alerts)} alerts")
        
        return jsonify({
            'count': len(alerts),
            'alerts': alerts
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error retrieving alerts: {str(e)}")
        return jsonify({'error': str(e)}), 500


@api_bp.route('/alerts/<alert_id>', methods=['PATCH'])
def update_alert_status(alert_id):
    """Update alert status"""
    try:
        data = request.get_json()
        resolved = data.get('resolved', False)
        
        logger.info(f"✅ Alert {alert_id} marked as {'resolved' if resolved else 'unresolved'}")
        
        return jsonify({
            'success': True,
            'alert_id': alert_id,
            'resolved': resolved
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error updating alert: {str(e)}")
        return jsonify({'error': str(e)}), 500


# ============================================================================
# DEVICES ENDPOINTS
# ============================================================================

@api_bp.route('/devices', methods=['GET'])
def get_devices():
    """Get list of all devices"""
    try:
        stats = supabase_service.get_statistics()
        
        devices = []
        for device_id in stats['device_list']:
            # Get latest reading for this device
            readings = supabase_service.get_readings(limit=1)
            latest = None
            for reading in readings:
                if reading['device_id'] == device_id:
                    latest = reading
                    break
            
            devices.append({
                'id': device_id,
                'name': f"Device {device_id}",
                'status': 'active',
                'last_seen': latest['created_at'] if latest else None,
                'latitude': latest['latitude'] if latest else None,
                'longitude': latest['longitude'] if latest else None
            })
        
        logger.info(f"Retrieved {len(devices)} devices")
        
        return jsonify({
            'count': len(devices),
            'devices': devices
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error retrieving devices: {str(e)}")
        return jsonify({'error': str(e)}), 500


@api_bp.route('/devices/<device_id>', methods=['PATCH'])
def update_device(device_id):
    """Update device information"""
    try:
        data = request.get_json()
        
        # Note: In Supabase, we'd need a separate devices table
        # For now, we'll just log the update
        logger.info(f"✅ Device {device_id} update requested: {data}")
        
        return jsonify({
            'success': True,
            'device_id': device_id,
            'message': 'Device update logged (full implementation requires devices table)'
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error updating device: {str(e)}")
        return jsonify({'error': str(e)}), 500


# ============================================================================
# DEVICE-SPECIFIC ENDPOINTS
# ============================================================================

@api_bp.route('/device/<device_id>/latest', methods=['GET'])
def get_latest_reading(device_id):
    """Get latest reading from specific device"""
    try:
        # Get all readings and filter
        readings = supabase_service.get_readings(limit=100)
        
        device_readings = [r for r in readings if r['device_id'] == device_id]
        
        if not device_readings:
            return jsonify({'error': f'No readings for device {device_id}'}), 404
        
        # Get latest
        latest = max(device_readings, key=lambda x: x.get('created_at', ''))
        latest['quality'] = supabase_service.determine_water_quality(latest)
        
        return jsonify(latest), 200
        
    except Exception as e:
        logger.error(f"❌ Error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@api_bp.route('/device/<device_id>/readings', methods=['GET'])
def get_device_readings(device_id):
    """Get readings for specific device"""
    try:
        limit = request.args.get('limit', 50, type=int)
        
        # Get all readings and filter
        readings = supabase_service.get_readings(limit=1000)
        device_readings = [r for r in readings if r['device_id'] == device_id]
        
        # Apply limit
        device_readings = device_readings[:limit]
        
        # Add quality
        for reading in device_readings:
            reading['quality'] = supabase_service.determine_water_quality(reading)
        
        return jsonify({
            'device_id': device_id,
            'count': len(device_readings),
            'readings': device_readings
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error: {str(e)}")
        return jsonify({'error': str(e)}), 500


# ============================================================================
# SIMPLE TEST ENDPOINT
# ============================================================================

@api_bp.route('/test', methods=['GET'])
def test_endpoint():
    """Simple test endpoint"""
    return jsonify({
        'status': 'online',
        'service': 'Water Quality API',
        'backend': 'Flask + Supabase',
        'timestamp': datetime.utcnow().isoformat(),
        'message': 'API is working!'
    }), 200