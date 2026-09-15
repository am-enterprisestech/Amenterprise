from typing import Any


class APIError(Exception):
    status_code = 500
    code = "internal_error"

    def __init__(self, message: str, details: Any = None) -> None:
        super().__init__(message)
        self.message = message
        self.details = details


class BadRequestError(APIError):
    status_code = 400
    code = "bad_request"


class UnauthorizedError(APIError):
    status_code = 401
    code = "unauthorized"


class ForbiddenError(APIError):
    status_code = 403
    code = "forbidden"


class NotFoundError(APIError):
    status_code = 404
    code = "not_found"


class ConflictError(APIError):
    status_code = 409
    code = "conflict"
