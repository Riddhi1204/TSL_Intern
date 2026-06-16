from fastapi import APIRouter

from app.api.v1.routes.check import router as check_router

api_router = APIRouter()

api_router.include_router(check_router, tags=["email-check"])
