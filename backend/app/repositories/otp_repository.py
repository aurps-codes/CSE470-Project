from app.repositories.database import otps_collection


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