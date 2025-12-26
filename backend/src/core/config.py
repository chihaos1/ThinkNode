import pathlib
import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from typing import Literal

load_dotenv(dotenv_path=pathlib.Path(__file__).parent.parent / ".env")

class Settings(BaseSettings):
    """Contains the configuration settings for the application"""

    # Core Settings
    CORS_ORIGINS: list[str] = os.getenv("CORS_ORIGINS")
    ENVIRONMENT: Literal["DEV","PREPROD","PROD"] = os.getenv("ENVIRONMENT")

    # Project Settings
    PROJECT_NAME: str = "ThinkNode"
    API_VERSION: str = os.getenv("API_VERSION")

    # Claude Settings
    CLAUDE_API_KEY: str = os.getenv("CLAUDE_API_KEY")
    CLAUDE_MODEL: str = os.getenv("CLAUDE_MODEL")
    CLAUDE_MAX_TOKENS: int = os.getenv("CLAUDE_MAX_TOKENS")

settings: Settings = Settings()