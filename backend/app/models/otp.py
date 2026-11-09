from datetime import datetime, timezone


class OTP:
    def __init__(self, email, purpose, otp_hash, expires_at):
        self.email = email
        self.purpose = purpose        # "signup" or "login"
        self.otp_hash = otp_hash      # we never store the real OTP
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