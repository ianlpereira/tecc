"""
Health check router for basic API verification.
"""

from fastapi import APIRouter

router = APIRouter(prefix="/api/health", tags=["health"])


@router.get("/", response_model=dict)
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "message": "TECC API is running"}
