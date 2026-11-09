from datetime import datetime, timezone


class Session:
    def __init__(self, user_id, token, expires_at):
        self.user_id = user_id
        self.token = token
        self.expires_at = expires_at
        self.created_at = datetime.now(timezone.utc)

    def to_document(self):
        return {
            "user_id": self.user_id,
            "token": self.token,
            "expires_at": self.expires_at,
            "created_at": self.created_at,
        }