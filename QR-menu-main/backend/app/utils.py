"""
Shared utility functions for the QR Restaurant Ordering API.
"""
from fastapi import HTTPException, status


def not_found(resource: str, identifier: int | str) -> HTTPException:
    """Return a standardized 404 HTTPException."""
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"{resource} with ID {identifier} not found."
    )


def bad_request(message: str) -> HTTPException:
    """Return a standardized 400 HTTPException."""
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=message
    )
