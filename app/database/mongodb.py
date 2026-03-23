"""MongoDB connection manager for the SIGRENE platform.

This module handles the initialization, verification, and connection
pooling to the local or remote MongoDB instance using PyMongo.
"""

import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.database import Database
from pymongo.errors import ConnectionFailure

# Load environment variables from the .env file
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = os.getenv("MONGO_DB_NAME", "sigrene_db")


class DatabaseClient:
    """Manages the MongoDB connection and database instance.

    This class uses class methods to ensure a single connection pool
    is shared across the entire application (Singleton-like pattern).

    Attributes:
        client (MongoClient | None): The PyMongo client instance.
        db (Database | None): The specific MongoDB database instance.
    """

    client: MongoClient | None = None
    db: Database | None = None

    @classmethod
    def connect(cls) -> None:
        """Establishes the connection to the MongoDB server.

        It attempts to connect and sends a 'ping' command to verify
        the server is responsive.

        Raises:
            ConnectionFailure: If the connection to the database cannot be established.
        """
        try:
            cls.client = MongoClient(MONGO_URI)
            # Send a ping to confirm a successful connection
            cls.client.admin.command('ping')
            cls.db = cls.client[DB_NAME]
            print(f"Successfully connected to MongoDB database: '{DB_NAME}'")
        except ConnectionFailure as e:
            print(f"Failed to connect to MongoDB: {e}")
            raise

    @classmethod
    def disconnect(cls) -> None:
        """Closes the active connection to the MongoDB server."""
        if cls.client:
            cls.client.close()
            print("MongoDB connection safely closed.")

    @classmethod
    def get_db(cls) -> Database:
        """Retrieves the active database instance.

        If the connection has not been established yet, it will trigger
        the connection process automatically.

        Returns:
            Database: The active PyMongo Database object.
        """
        if cls.db is None:
            cls.connect()
        return cls.db


def get_database() -> Database:
    """Dependency injection helper to get the database instance.

    This function is designed to be used in FastAPI route endpoints.

    Returns:
        Database: The active PyMongo Database object.
    """
    return DatabaseClient.get_db()