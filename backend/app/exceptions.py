class AppError(Exception):
    """Raised by services when something goes wrong (wrong OTP, duplicate email, ...)."""

    def __init__(self, message, status_code=400):
        self.message = message
        self.status_code = status_code