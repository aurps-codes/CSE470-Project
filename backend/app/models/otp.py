from datetime import datetime, timezone

from app.models.database import otps_collection


class OTP:
    def __init__(self, email, purpose, otp_hash, expires_at):
        self.email = email
        self.purpose = purpose        # "signup" or "login"
        self.otp_hash = otp_hash      
        self.expires_at = expires_at
        self.attempts = 0
        self.created_at = datetime.now(timezone.utc)

    def to_document(self):
        return {
            "email": self.email,
            "purpose": self.purpose,
            "otp_hash": self.otp_hash,
            "expires_at": self.expires_at,
            "attempts": self.attempts,
            "created_at": self.created_at,
        }


# Database operations for OTP

def save_otp(otp):
    # Replaces any older OTP for the same email + purpose
    otps_collection.replace_one(
        {"email": otp.email, "purpose": otp.purpose},
        otp.to_document(),
        upsert=True,
    )


def find_otp(email, purpose):
    return otps_collection.find_one({"email": email, "purpose": purpose})


def increase_attempts(email, purpose):
    otps_collection.update_one(
        {"email": email, "purpose": purpose}, {"$inc": {"attempts": 1}}
    )


def delete_otp(email, purpose):
    otps_collection.delete_one({"email": email, "purpose": purpose})