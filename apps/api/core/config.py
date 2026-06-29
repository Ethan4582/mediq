from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    CLOUDFLARE_R2_ENDPOINT: str
    CLOUDFLARE_R2_ACCESS_KEY: str
    CLOUDFLARE_R2_SECRET_KEY: str
    CLOUDFLARE_R2_BUCKET: str
    UPSTASH_REDIS_REST_URL: str
    UPSTASH_REDIS_REST_TOKEN: str
    ENCRYPTION_KEY: str
    MISTRAL_API_KEY: str = ""
    GROQ_API_KEY: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
