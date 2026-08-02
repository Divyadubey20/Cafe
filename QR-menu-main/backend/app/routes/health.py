from fastapi import APIRouter

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check():
    """
    Simple health check endpoint to verify that the server is running.
    """
    return {"status": "ok"}
