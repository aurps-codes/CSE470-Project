from app.repositories.database import users_collection


def find_by_email(email):
    return users_collection.find_one({"email": email})


def find_by_id(user_id):
    return users_collection.find_one({"_id": user_id})


def insert_user(user):
    result = users_collection.insert_one(user.to_document())
    return result.inserted_id


def mark_verified(email):
    users_collection.update_one({"email": email}, {"$set": {"is_verified": True}})


def delete_by_email(email):
    users_collection.delete_one({"email": email})