"""MongoDB connection and utilities."""
import logging
from motor.motor_asyncio import AsyncIOMotorClient as AsyncClient
from typing import TYPE_CHECKING
from datetime import datetime
from app.config import settings

if TYPE_CHECKING:
    from motor.motor_asyncio import AsyncIOMotorDatabase as AsyncDatabase
    from motor.motor_asyncio import AsyncIOMotorCollection as AsyncCollection

logger = logging.getLogger(__name__)

# Global MongoDB client
db_client: AsyncClient = None
db = None


async def connect_to_mongo():
    """Connect to MongoDB."""
    global db_client, db
    try:
        db_client = AsyncClient(settings.MONGODB_URI)
        db = db_client[settings.DATABASE_NAME]
        # Test connection
        await db_client.admin.command("ping")
        logger.info("Connected to MongoDB")
        
        # Create indexes
        await create_indexes()
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise


async def disconnect_from_mongo():
    """Disconnect from MongoDB."""
    global db_client, db
    if db_client:
        db_client.close()
        logger.info("Disconnected from MongoDB")


async def create_indexes():
    """Create necessary indexes."""
    try:
        # Incident collection indexes
        incidents = db["incidents"]
        await incidents.create_index("createdAt")
        await incidents.create_index("status")
        await incidents.create_index("severity")
        await incidents.create_index("latitude")
        await incidents.create_index("longitude")
        
        # Hospital collection indexes
        hospitals = db["hospitals"]
        await hospitals.create_index("latitude")
        await hospitals.create_index("longitude")
        
        logger.info("Indexes created successfully")
    except Exception as e:
        logger.error(f"Failed to create indexes: {e}")


def get_db():
    """Get database connection."""
    return db


def get_collection(collection_name: str):
    """Get a specific collection."""
    return db[collection_name]
