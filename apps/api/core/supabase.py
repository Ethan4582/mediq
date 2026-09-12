from supabase import create_client
from core.config import settings

import threading

class DynamicDB:
    def __init__(self):
        self._local = threading.local()

    def _get_client(self):
        if not hasattr(self._local, "client"):
            self._local.client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
        return self._local.client

    def __getattr__(self, name):
        return getattr(self._get_client(), name)

db = DynamicDB()
