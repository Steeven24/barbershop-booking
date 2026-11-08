from zoneinfo import ZoneInfo

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://barbershop:barbershop@localhost:5432/barbershop"
    cors_origins: list[str] = ["http://localhost:5173"]
    timezone: str = "America/Guayaquil"
    slot_step_minutes: int = 15

    # Auth: always override SECRET_KEY outside local development
    secret_key: str = "dev-only-insecure-secret-key-change-me-in-prod"
    access_token_expire_minutes: int = 60 * 8

    @property
    def tz(self) -> ZoneInfo:
        return ZoneInfo(self.timezone)


settings = Settings()
