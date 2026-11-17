"""Create the first admin account (admins cannot sign up from the website).

Run from the backend folder:
    pipenv run python -m scripts.create_admin "Admin Name" admin@example.com MyPassword123
"""
import sys

from app.models import user as user_model
from app.models.database import create_indexes
from app.models.user import User
from app.services.auth_service import _hash_password


def main():
    if len(sys.argv) != 4:
        print('Usage: python -m scripts.create_admin "Full Name" email password')
        return

    full_name, email, password = sys.argv[1], sys.argv[2].strip().lower(), sys.argv[3]

    if len(password) < 8:
        print("Password must be at least 8 characters.")
        return

    create_indexes()
    if user_model.find_by_email(email) is not None:
        print("A user with this email already exists.")
        return

    admin = User(full_name, email, _hash_password(password), "admin")
    admin.is_verified = True   # no OTP needed to activate the account
    user_model.insert_user(admin)
    print(f"Admin created: {email}")


main()
