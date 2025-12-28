from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from sqlalchemy import func
import logging
from app import db
from app.models import SensorReading, Device

api_bp = Blueprint('api', __name__)
logger = logging.getLogger(__name__)


# ============================================================================
# HEALTH & STATUS ENDPOINTS
# ============================================================================

@api_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.utcnow().isoformat(),
        'service': 'Water Quality API',
        'version': '1.0.0'
    }), 200


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
        
        # Create sensor reading
        reading = SensorReading(
            device_id=data['device_id'],
            temperature=data.get('temperature'),
            ph=data.get('ph'),
            tds=data.get('tds'),
            turbidity=data.get('turbidity'),
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            quality_flag='OK'
        )
        
        db.session.add(reading)
        db.session.commit()
        
        # Update device last reading
        device = Device.query.get(data['device_id'])
        if not device:
            device = Device(
                id=data['device_id'],
                name=f"Device {data['device_id']}",
                latitude=data.get('latitude'),
                longitude=data.get('longitude'),
                status='active'
            )
            db.session.add(device)
        device.last_reading = datetime.utcnow()
        db.session.commit()
        
        logger.info(f"✅ Data received from {data['device_id']} (ID: {reading.id})")
        
        return jsonify({
            'success': True,
            'id': reading.id,
            'message': 'Data saved successfully',
            'timestamp': reading.timestamp.isoformat() if reading.timestamp else None
        }), 201
        
    except Exception as e:
        logger.error(f"❌ Error receiving data: {str(e)}")
        db.session.rollback()
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
        
        query = SensorReading.query
        
        if device_id:
            query = query.filter_by(device_id=device_id)
        
        readings = query.order_by(SensorReading.timestamp.desc()).limit(limit).all()
        
        logger.info(f"Retrieved {len(readings)} readings")
        
        return jsonify({
            'count': len(readings),
            'readings': [r.to_dict() for r in readings]
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
        
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        readings = SensorReading.query.filter(
            SensorReading.timestamp >= start_date,
            SensorReading.timestamp <= end_date
        ).order_by(SensorReading.timestamp.desc()).all()
        
        # Group by date
        data_by_date = {}
        for reading in readings:
            date_key = reading.timestamp.strftime('%Y-%m-%d') if reading.timestamp else 'unknown'
            if date_key not in data_by_date:
                data_by_date[date_key] = []
            data_by_date[date_key].append(reading.to_dict())
        
        logger.info(f"Retrieved {len(readings)} historical readings")
        
        return jsonify({
            'days': days,
            'count': len(readings),
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
        readings = SensorReading.query.all()
        
        if not readings:
            return jsonify({
                'total_readings': 0,
                'devices': 0,
                'temperature': {'min': None, 'max': None, 'avg': None, 'count': 0},
                'ph': {'min': None, 'max': None, 'avg': None, 'count': 0},
                'tds': {'min': None, 'max': None, 'avg': None, 'count': 0},
                'turbidity': {'min': None, 'max': None, 'avg': None, 'count': 0},
                'quality_flags': {'ok': 0, 'suspect': 0, 'fail': 0}
            }), 200
        
        # Calculate statistics
        temps = [r.temperature for r in readings if r.temperature is not None]
        phs = [r.ph for r in readings if r.ph is not None]
        tdss = [r.tds for r in readings if r.tds is not None]
        turbidities = [r.turbidity for r in readings if r.turbidity is not None]
        
        def get_stats(values):
            if not values:
                return {'min': None, 'max': None, 'avg': None, 'count': 0}
            return {
                'min': round(min(values), 2),
                'max': round(max(values), 2),
                'avg': round(sum(values) / len(values), 2),
                'count': len(values)
            }
        
        stats = {
            'total_readings': len(readings),
            'devices': len(set(r.device_id for r in readings)),
            'temperature': get_stats(temps),
            'ph': get_stats(phs),
            'tds': get_stats(tdss),
            'turbidity': get_stats(turbidities),
            'quality_flags': {
                'ok': sum(1 for r in readings if r.quality_flag == 'OK'),
                'suspect': sum(1 for r in readings if r.quality_flag == 'SUSPECT'),
                'fail': sum(1 for r in readings if r.quality_flag == 'FAIL'),
            }
        }
        
        return jsonify(stats), 200
        
    except Exception as e:
        logger.error(f"❌ Error calculating statistics: {str(e)}")
        return jsonify({'error': str(e)}), 500


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
        
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        readings = SensorReading.query.filter(
            SensorReading.timestamp >= start_date,
            SensorReading.timestamp <= end_date
        ).all()
        
        # Create heatmap data points
        heatmap_data = []
        for reading in readings:
            if reading.latitude and reading.longitude:
                heatmap_data.append({
                    'lat': reading.latitude,
                    'lng': reading.longitude,
                    'value': reading.quality_score if reading.quality_score else 0.5,
                    'quality_flag': reading.quality_flag,
                    'device_id': reading.device_id,
                    'temperature': reading.temperature,
                    'ph': reading.ph,
                    'tds': reading.tds,
                    'turbidity': reading.turbidity,
                    'timestamp': reading.timestamp.isoformat() if reading.timestamp else None
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
        failed_readings = SensorReading.query.filter_by(quality_flag='FAIL').all()
        suspect_readings = SensorReading.query.filter_by(quality_flag='SUSPECT').all()
        
        alerts = []
        
        for reading in failed_readings:
            alerts.append({
                'id': f"alert_{reading.id}",
                'severity': 'critical',
                'message': f"Critical water quality issue at {reading.device_id}",
                'timestamp': reading.timestamp.isoformat() if reading.timestamp else None,
                'resolved': False,
                'reading_id': reading.id
            })
        
        for reading in suspect_readings:
            alerts.append({
                'id': f"alert_{reading.id}_suspect",
                'severity': 'warning',
                'message': f"Suspect water quality at {reading.device_id}",
                'timestamp': reading.timestamp.isoformat() if reading.timestamp else None,
                'resolved': False,
                'reading_id': reading.id
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
        devices = Device.query.all()
        
        device_list = [d.to_dict() for d in devices]
        
        logger.info(f"Retrieved {len(device_list)} devices")
        
        return jsonify({
            'count': len(device_list),
            'devices': device_list
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error retrieving devices: {str(e)}")
        return jsonify({'error': str(e)}), 500


@api_bp.route('/devices/<device_id>', methods=['PATCH'])
def update_device(device_id):
    """Update device information"""
    try:
        data = request.get_json()
        
        device = Device.query.get(device_id)
        if not device:
            return jsonify({'error': f'Device {device_id} not found'}), 404
        
        if 'name' in data:
            device.name = data['name']
        if 'location' in data:
            device.location = data['location']
        if 'status' in data:
            device.status = data['status']
        
        db.session.commit()
        
        logger.info(f"✅ Device {device_id} updated")
        
        return jsonify({
            'success': True,
            'device_id': device_id,
            'device': device.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error updating device: {str(e)}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ============================================================================
# DEVICE-SPECIFIC ENDPOINTS
# ============================================================================

@api_bp.route('/device/<device_id>/latest', methods=['GET'])
def get_latest_reading(device_id):
    """Get latest reading from specific device"""
    try:
        reading = SensorReading.query.filter_by(device_id=device_id).order_by(
            SensorReading.timestamp.desc()
        ).first()
        
        if not reading:
            return jsonify({'error': f'No readings for device {device_id}'}), 404
        
        return jsonify(reading.to_dict()), 200
        
    except Exception as e:
        logger.error(f"❌ Error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@api_bp.route('/device/<device_id>/readings', methods=['GET'])
def get_device_readings(device_id):
    """Get readings for specific device"""
    try:
        limit = request.args.get('limit', 50, type=int)
        days = request.args.get('days', None, type=int)
        
        query = SensorReading.query.filter_by(device_id=device_id)
        
        if days:
            start_date = datetime.utcnow() - timedelta(days=days)
            query = query.filter(SensorReading.timestamp >= start_date)
        
        readings = query.order_by(SensorReading.timestamp.desc()).limit(limit).all()
        
        return jsonify({
            'device_id': device_id,
            'count': len(readings),
            'readings': [r.to_dict() for r in readings]
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error: {str(e)}")
        return jsonify({'error': str(e)}), 500