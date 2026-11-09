from pymongo import MongoClient, ASCENDING
from app import config

# tz_aware=True makes MongoDB return timezone-aware datetimes,
# so we can safely compare them with datetime.now(timezone.utc)
client = MongoClient(config.MONGODB_URI, tz_aware=True)
db = client[config.DATABASE_NAME]

users_collection = db["users"]
otps_collection = db["otps"]
sessions_collection = db["sessions"]


def create_indexes():
    users_collection.create_index("email", unique=True)

    otps_collection.create_index(
        [("email", ASCENDING), ("purpose", ASCENDING)], unique=True
    )
    # TTL index: MongoDB deletes the document after expires_at passes
    otps_collection.create_index("expires_at", expireAfterSeconds=0)

    sessions_collection.create_index("token", unique=True)
    sessions_collection.create_index("expires_at", expireAfterSeconds=0)