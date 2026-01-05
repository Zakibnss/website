from datetime import datetime
from typing import List, Dict, Any
import os
from supabase import create_client

class SupabaseService:
    def __init__(self):
        # Get credentials from environment
        self.url = os.getenv("SUPABASE_URL", "https://sfxdncqldxgfssenmrql.supabase.co")
        self.key = os.getenv("SUPABASE_SERVICE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmeGRuY3FsZHhnZnNzZW5tcnFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MjU1NjUsImV4cCI6MjA4MjUwMTU2NX0.2-l7viDJl9TTkC9qrwdq5jqMxMt3VmEp6ZpDkfmauEo")
        
        if not self.url or not self.key:
            raise ValueError("Missing Supabase credentials")
        
        self.client = create_client(self.url, self.key)
        self.table_name = "water_quality_readings"
        print(f"✅ Connected to Supabase: {self.url}")
    
    def create_reading(self, reading_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new water quality reading"""
        try:
            # Add timestamp
            reading_data['created_at'] = datetime.utcnow().isoformat()
            
            # Insert into Supabase
            response = self.client.table(self.table_name).insert(reading_data).execute()
            
            if response.data and len(response.data) > 0:
                print(f"✅ Reading created: {response.data[0]['id']}")
                return response.data[0]
            else:
                raise Exception("No data returned from Supabase")
                
        except Exception as e:
            print(f"❌ Error creating reading: {str(e)}")
            raise
    
    def get_readings(self, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        """Get recent readings"""
        try:
            response = self.client.table(self.table_name)\
                                 .select("*")\
                                 .order("created_at", desc=True)\
                                 .range(offset, offset + limit - 1)\
                                 .execute()
            
            return response.data if response.data else []
            
        except Exception as e:
            print(f"❌ Error getting readings: {str(e)}")
            return []
    
    def get_latest_readings(self) -> List[Dict[str, Any]]:
        """Get latest reading for each device"""
        try:
            # Get all readings ordered by date
            response = self.client.table(self.table_name)\
                                 .select("*")\
                                 .order("created_at", desc=True)\
                                 .execute()
            
            # Group by device and take latest
            latest_by_device = {}
            for reading in response.data:
                device_id = reading['device_id']
                if device_id not in latest_by_device:
                    latest_by_device[device_id] = reading
            
            return list(latest_by_device.values())
            
        except Exception as e:
            print(f"❌ Error getting latest readings: {str(e)}")
            return []
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get statistics about readings"""
        try:
            # Get total count
            count_response = self.client.table(self.table_name)\
                                       .select("id", count="exact")\
                                       .execute()
            
            total_count = count_response.count or 0
            
            # Get all readings for analysis
            all_readings = self.get_readings(limit=1000)
            
            # Calculate quality summary
            quality_summary = {"good": 0, "warning": 0, "danger": 0}
            for reading in all_readings:
                quality = self.determine_water_quality(reading)
                quality_summary[quality] += 1
            
            # Get unique devices
            device_ids = list(set([r['device_id'] for r in all_readings]))
            
            # Get latest reading
            latest_reading = all_readings[0] if all_readings else None
            
            return {
                "total_readings": total_count,
                "unique_devices": len(device_ids),
                "device_list": device_ids,
                "quality_summary": quality_summary,
                "latest_reading": latest_reading,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            print(f"❌ Error getting statistics: {str(e)}")
            return {
                "total_readings": 0,
                "unique_devices": 0,
                "device_list": [],
                "quality_summary": {"good": 0, "warning": 0, "danger": 0},
                "latest_reading": None,
                "timestamp": datetime.utcnow().isoformat()
            }
    
    def determine_water_quality(self, reading: Dict[str, Any]) -> str:
        """Determine water quality based on parameters"""
        if not reading:
            return "unknown"
        
        issues = 0
        
        temp = reading.get('temperature')
        ph = reading.get('ph')
        tds = reading.get('tds')
        turbidity = reading.get('turbidity')
        
        if temp and (temp < 15 or temp > 25):
            issues += 1
        if ph and (ph < 6.5 or ph > 8.5):
            issues += 1
        if tds and tds > 500:
            issues += 1
        if turbidity and turbidity > 5:
            issues += 1
        
        if issues == 0:
            return "good"
        elif issues == 1:
            return "warning"
        else:
            return "danger"

# Singleton instance
supabase_service = SupabaseService()