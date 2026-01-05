import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

class SupabaseConfig:
    def __init__(self):
        self.url = os.getenv("SUPABASE_URL")
        self.key = os.getenv("SUPABASE_SERVICE_KEY")
        
        if not self.url or not self.key:
            raise ValueError("Missing Supabase credentials in environment variables")
        
        print(f"🔗 Connecting to Supabase: {self.url}")
        self.client: Client = create_client(self.url, self.key)
        print("✅ Supabase client initialized")
    
    def get_client(self):
        return self.client

# Singleton instance
supabase_config = SupabaseConfig()