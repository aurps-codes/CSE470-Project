from app.repositories.database import sessions_collection


def insert_session(session):
    sessions_collection.insert_one(session.to_document())


def find_by_token(token):
    return sessions_collection.find_one({"token": token})


def delete_by_token(token):
    sessions_collection.delete_one({"token": token})