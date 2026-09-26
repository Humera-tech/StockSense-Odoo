from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg2://stocksense:stocksense@localhost:5432/stocksense"
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440
    cors_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    # No mail server offline: when true, the reset code is returned by the API so the demo can show it.
    show_dev_otp: bool = False

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
