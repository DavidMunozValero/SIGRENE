"""Authentication and cryptography services for the SIGRENE platform.

This module provides the core utilities for securely hashing passwords
using bcrypt and generating JSON Web Tokens (JWT) for user sessions.
"""


from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from passlib.context import CryptContext

import jwt
import os


# Load environment variables
load_dotenv()

# Security configuration
# In production, SECRET_KEY MUST be a long random string loaded from .env
SECRET_KEY = os.getenv("SECRET_KEY", "super_secret_key_for_development_only_change_me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480  # 8 hours (typical work day)

# Initialize the password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against its hashed version.

    Args:
        plain_password (str): The raw password provided by the user.
        hashed_password (str): The encrypted password stored in the database.

    Returns:
        bool: True if the passwords match, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generates a secure bcrypt hash from a plain text password.

    Args:
        password (str): The raw password to encrypt.

    Returns:
        str: The resulting hashed password.
    """
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Creates a JSON Web Token (JWT) for user authentication.

    Args:
        data (dict): The payload to encode into the token (e.g., {"sub": user_email}).
        expires_delta (timedelta | None, optional): Custom expiration time.
            Defaults to ACCESS_TOKEN_EXPIRE_MINUTES if not provided.

    Returns:
        str: The encoded JWT as a string.
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})

    # Encode the JWT using the secret key and algorithm
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt


# Esta línea le dice a FastAPI dónde tienen que ir los usuarios para conseguir su token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/login")


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """Validates the JWT token and extracts the user payload.

    This function acts as a dependency for protected endpoints. It decodes
    the token and ensures it is valid and has not expired.

    Args:
        token (str): The JWT bearer token extracted from the request header.

    Returns:
        dict: The decoded payload containing user information (e.g., 'sub', 'rol').

    Raises:
        HTTPException: If the token is invalid, expired, or missing the subject.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas o token caducado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Intentamos decodificar el token con nuestra llave maestra
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str | None = payload.get("sub")
        if email is None:
            raise credentials_exception
        return payload

    except InvalidTokenError:
        raise credentials_exception


def decode_token(token: str) -> dict:
    """Decodes a JWT token without requiring authentication.

    Args:
        token (str): The JWT token to decode.

    Returns:
        dict: The decoded payload.

    Raises:
        InvalidTokenError: If the token is invalid or expired.
    """
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    return payload