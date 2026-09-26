from pydantic_settings import BaseSettings, SettingsConfigDict

DEFAULT_CORS_ORIGINS = (
    "http://localhost:5173,http://127.0.0.1:5173,https://stocksense-frontend-bcik.onrender.com"
)


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg2://stocksense:stocksense@localhost:5432/stocksense"
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440
    # Comma-separated list of allowed frontend origins, e.g. "https://app.onrender.com,https://foo.com"
    cors_origins: str = DEFAULT_CORS_ORIGINS
    # No mail server offline: when true, the reset code is returned by the API so the demo can show it.
    show_dev_otp: bool = False

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
