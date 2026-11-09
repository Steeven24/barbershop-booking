from zoneinfo import ZoneInfo

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """App configuration. Secrets have no defaults: they must come from env vars or .env."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str
    test_database_url: str | None = None
    cors_origins: list[str] = ["http://localhost:5173"]
    timezone: str = "America/Guayaquil"
    slot_step_minutes: int = 15

    secret_key: str = Field(min_length=32)
    access_token_expire_minutes: int = 60 * 8

    business_name: str = "La Navaja Barbería"

    # Email: without SMTP_HOST, emails are only written to the log
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_user: str | None = None
    smtp_password: str | None = None
    smtp_starttls: bool = True
    email_from: str = "no-reply@example.com"

    @property
    def tz(self) -> ZoneInfo:
        return ZoneInfo(self.timezone)


settings = Settings()
