from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes import router
from src.core.config import settings

app = FastAPI(
    title = settings.PROJECT_NAME,
    version = settings.API_VERSION, 
    docs_url = None if settings.ENVIRONMENT == "PROD" else "/docs"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins = [origin for origin in settings.CORS_ORIGINS],
    allow_methods = ["*"],
    allow_headers = ["*"],
    allow_credentials = True
)

app.include_router(router, prefix = "/api")

@app.get("/")
async def root():
    return {
        "message": f"{settings.PROJECT_NAME} API"
    }