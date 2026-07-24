"""MongoDB connection and utilities with automatic in-memory fallback."""
import logging
from motor.motor_asyncio import AsyncIOMotorClient as AsyncClient
from typing import TYPE_CHECKING, List, Dict, Any, Optional
from datetime import datetime
from bson import ObjectId
from app.config import settings

if TYPE_CHECKING:
    from motor.motor_asyncio import AsyncIOMotorDatabase as AsyncDatabase
    from motor.motor_asyncio import AsyncIOMotorCollection as AsyncCollection

logger = logging.getLogger(__name__)

# --- In-Memory Fallback Database Classes ---
class InMemoryCursor:
    def __init__(self, data: List[Dict[str, Any]]):
        self._data = list(data)

    def sort(self, key_or_list, direction=1):
        if isinstance(key_or_list, list):
            for k, d in reversed(key_or_list):
                reverse = (d == -1)
                self._data.sort(key=lambda x: str(x.get(k, "")), reverse=reverse)
        elif isinstance(key_or_list, str):
            reverse = (direction == -1)
            self._data.sort(key=lambda x: str(x.get(key_or_list, "")), reverse=reverse)
        return self

    async def to_list(self, length: Optional[int] = None) -> List[Dict[str, Any]]:
        if length is not None:
            return [dict(d) for d in self._data[:length]]
        return [dict(d) for d in self._data]


class InMemoryInsertOneResult:
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id


class InMemoryInsertManyResult:
    def __init__(self, inserted_ids):
        self.inserted_ids = inserted_ids


class InMemoryCollection:
    def __init__(self, name: str):
        self.name = name
        self._documents: List[Dict[str, Any]] = []

    async def insert_one(self, document: Dict[str, Any]):
        doc = dict(document)
        if "_id" not in doc:
            doc["_id"] = ObjectId()
        self._documents.append(doc)
        return InMemoryInsertOneResult(doc["_id"])

    async def insert_many(self, documents: List[Dict[str, Any]]):
        ids = []
        for d in documents:
            res = await self.insert_one(d)
            ids.append(res.inserted_id)
        return InMemoryInsertManyResult(ids)

    async def find_one(self, filter_dict: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        if not filter_dict:
            return dict(self._documents[0]) if self._documents else None
        for doc in self._documents:
            match = True
            for k, v in filter_dict.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                return dict(doc)
        return None

    async def update_one(self, filter_dict: Dict[str, Any], update_dict: Dict[str, Any]):
        target = await self.find_one(filter_dict)
        if target:
            # find matching ref in list
            for idx, doc in enumerate(self._documents):
                if doc.get("_id") == target.get("_id"):
                    if "$set" in update_dict:
                        for k, v in update_dict["$set"].items():
                            doc[k] = v
                    self._documents[idx] = doc
                    break

    def find(self, filter_dict: Optional[Dict[str, Any]] = None) -> InMemoryCursor:
        if not filter_dict:
            return InMemoryCursor(self._documents)
        matched = []
        for doc in self._documents:
            match = True
            for k, v in filter_dict.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                matched.append(doc)
        return InMemoryCursor(matched)

    async def count_documents(self, filter_dict: Optional[Dict[str, Any]] = None) -> int:
        if not filter_dict:
            return len(self._documents)
        count = 0
        for doc in self._documents:
            match = True
            for k, v in filter_dict.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                count += 1
        return count

    async def create_index(self, *args, **kwargs):
        pass


class InMemoryDatabase:
    def __init__(self):
        self.collections: Dict[str, InMemoryCollection] = {}

    def __getitem__(self, collection_name: str) -> InMemoryCollection:
        if collection_name not in self.collections:
            self.collections[collection_name] = InMemoryCollection(collection_name)
        return self.collections[collection_name]


# Global MongoDB client and db instance
db_client: Optional[AsyncClient] = None
db: Any = None


async def connect_to_mongo():
    """Connect to MongoDB with automatic in-memory fallback for local development."""
    global db_client, db
    try:
        logger.info(f"Connecting to MongoDB at {settings.MONGODB_URI}...")
        db_client = AsyncClient(settings.MONGODB_URI, serverSelectionTimeoutMS=2000)
        # Test connection with ping
        await db_client.admin.command("ping")
        db = db_client[settings.DATABASE_NAME]
        logger.info("Successfully connected to MongoDB")
        await create_indexes()
    except Exception as e:
        logger.warning(
            f"MongoDB connection failed on localhost:27017 ({e}). "
            "Initializing In-Memory Database for local development mode."
        )
        db_client = None
        db = InMemoryDatabase()
        # Pre-seed hospital data into in-memory db
        await _seed_in_memory_hospitals(db)


async def _seed_in_memory_hospitals(in_memory_db: InMemoryDatabase):
    """Seed initial sample hospitals into in-memory db."""
    try:
        sample_hospitals = [
            {
                "_id": ObjectId(),
                "name": "City Trauma Center",
                "latitude": 40.7128,
                "longitude": -74.0060,
                "type": "Trauma Center",
                "beds_available": 15,
                "phone": "+1-555-0100"
            },
            {
                "_id": ObjectId(),
                "name": "Central Hospital",
                "latitude": 40.7580,
                "longitude": -73.9855,
                "type": "General Hospital",
                "beds_available": 20,
                "phone": "+1-555-0200"
            },
            {
                "_id": ObjectId(),
                "name": "Heart Institute",
                "latitude": 40.7614,
                "longitude": -73.9776,
                "type": "Cardiac Center",
                "beds_available": 10,
                "phone": "+1-555-0300"
            }
        ]
        await in_memory_db["hospitals"].insert_many(sample_hospitals)
        logger.info("In-memory hospital database pre-seeded successfully.")
    except Exception as err:
        logger.error(f"Failed to pre-seed in-memory hospitals: {err}")


async def disconnect_from_mongo():
    """Disconnect from MongoDB."""
    global db_client, db
    if db_client:
        db_client.close()
        logger.info("Disconnected from MongoDB")


async def create_indexes():
    """Create necessary indexes if using real MongoDB."""
    if db and hasattr(db, "incidents"):
        try:
            incidents = db["incidents"]
            await incidents.create_index("createdAt")
            await incidents.create_index("status")
            await incidents.create_index("severity")
            await incidents.create_index("latitude")
            await incidents.create_index("longitude")
            
            hospitals = db["hospitals"]
            await hospitals.create_index("latitude")
            await hospitals.create_index("longitude")
            logger.info("Indexes created successfully")
        except Exception as e:
            logger.error(f"Failed to create indexes: {e}")


def get_db():
    """Get database connection."""
    return db


# Alias get_database for get_db
get_database = get_db


def get_collection(collection_name: str):
    """Get a specific collection."""
    return db[collection_name]
