import os
import jwt
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
from shared.exceptions import UnauthorizedException
from .models import AuthenticatedUser

DEFAULT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your_super_secret_jwt_key_here")
DEFAULT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
DEFAULT_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None,
    secret_key: Optional[str] = None,
    algorithm: Optional[str] = None,
    issuer: Optional[str] = None,
    audience: Optional[str] = None,
) -> str:
    """Creates a signed JWT access token."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=DEFAULT_EXPIRE_MINUTES)

    to_encode.update({"exp": expire, "iat": now})
    
    if issuer:
        to_encode["iss"] = issuer
    if audience:
        to_encode["aud"] = audience

    key = secret_key or DEFAULT_SECRET_KEY
    alg = algorithm or DEFAULT_ALGORITHM
    
    return jwt.encode(to_encode, key, algorithm=alg)

def decode_access_token(
    token: str,
    secret_key: Optional[str] = None,
    algorithm: Optional[str] = None,
    issuer: Optional[str] = None,
    audience: Optional[str] = None,
) -> Dict[str, Any]:
    """Decodes and validates a JWT access token with clock-drift leeway."""
    key = secret_key or DEFAULT_SECRET_KEY
    alg = algorithm or DEFAULT_ALGORITHM

    options = {
        "verify_signature": True,
        "verify_exp": True,
        "verify_iat": True,
        "verify_iss": issuer is not None,
        "verify_aud": audience is not None,
    }

    try:
        payload = jwt.decode(
            token,
            key,
            algorithms=[alg],
            options=options,
            issuer=issuer,
            audience=audience,
            leeway=10,  # 10 seconds leeway for container clock drift
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise UnauthorizedException("JWT access token has expired")
    except jwt.InvalidTokenError as exc:
        raise UnauthorizedException(f"Invalid JWT access token: {str(exc)}")

def verify_access_token(
    token: str,
    secret_key: Optional[str] = None,
    algorithm: Optional[str] = None,
    issuer: Optional[str] = None,
    audience: Optional[str] = None,
) -> AuthenticatedUser:
    """Verifies access token and returns standard AuthenticatedUser model."""
    payload = decode_access_token(
        token,
        secret_key=secret_key,
        algorithm=algorithm,
        issuer=issuer,
        audience=audience,
    )

    user_id = payload.get("sub") or payload.get("user_id")
    email = payload.get("email", "")
    roles = payload.get("roles", [])

    if not user_id:
        raise UnauthorizedException("Token payload missing user_id / sub claim")

    return AuthenticatedUser(
        user_id=str(user_id),
        email=str(email),
        roles=roles if isinstance(roles, list) else [str(roles)],
    )
