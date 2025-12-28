from app import db
from datetime import datetime


class SensorReading(db.Model):
    __tablename__ = 'sensor_readings'
    
    id = db.Column(db.Integer, primary_key=True)
    device_id = db.Column(db.String(100), nullable=False, index=True)
    
    # Only 4 sensors needed
    temperature = db.Column(db.Float)
    ph = db.Column(db.Float)
    tds = db.Column(db.Float)
    turbidity = db.Column(db.Float)
    
    # Location data
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    
    # Quality assessment
    quality_flag = db.Column(db.String(20), default='OK')  # OK, SUSPECT, FAIL
    quality_score = db.Column(db.Float, default=0.5)
    
    # Metadata
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def to_dict(self):
        """Convert to dictionary for JSON response"""
        return {
            'id': self.id,
            'device_id': self.device_id,
            'temperature': self.temperature,
            'ph': self.ph,
            'tds': self.tds,
            'turbidity': self.turbidity,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'quality_flag': self.quality_flag,
            'quality_score': self.quality_score,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }
    
    def __repr__(self):
        return f'<SensorReading {self.device_id} at {self.timestamp}>'


# Optional: Device model for tracking devices
class Device(db.Model):
    __tablename__ = 'devices'
    
    id = db.Column(db.String(100), primary_key=True)
    name = db.Column(db.String(200))
    location = db.Column(db.String(200))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    status = db.Column(db.String(20), default='active')
    last_reading = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'location': self.location,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'status': self.status,
            'last_reading': self.last_reading.isoformat() if self.last_reading else None
        }