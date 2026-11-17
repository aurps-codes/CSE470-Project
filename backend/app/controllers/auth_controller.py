from app.models.user import User
from app.services import auth_service
def signup(data, background_tasks):
    auth_service.signup(data, background_tasks)
    return {"message": "OTP sent to your email."}

def login(data, background_tasks):
    auth_service.login(data, background_tasks)
    return {"message": "OTP sent to your email."}

def verify_otp(data):
    return auth_service.verify_otp(data)

def get_profile(user_document):
    return User.to_public(user_document)

def logout(token):
    auth_service.logout(token)
    return {"message": "Logged out."}
