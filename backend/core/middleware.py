from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from jose import jwt, JWTError, ExpiredSignatureError

from core.config import settings

# Paths that do not require a valid JWT token
_PUBLIC_PATHS = {
    "/docs",
    "/redoc",
    "/openapi.json",
}

_PUBLIC_PREFIXES = (
    "/api/auth/",
    "/images/",
    "/audio/",
)


class JWTAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        if (
            request.method == "OPTIONS"
            or path in _PUBLIC_PATHS
            or any(path.startswith(p) for p in _PUBLIC_PREFIXES)
        ):
            return await call_next(request)

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=401,
                content={"detail": "Unauthorized: missing or invalid Authorization header"},
            )

        token = auth_header.split(" ", 1)[1]

        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[settings.ALGORITHM],
            )
            request.state.user = payload
        except ExpiredSignatureError:
            return JSONResponse(
                status_code=401,
                content={"detail": "Token has expired"},
            )
        except JWTError:
            return JSONResponse(
                status_code=401,
                content={"detail": "Invalid token"},
            )

        return await call_next(request)
