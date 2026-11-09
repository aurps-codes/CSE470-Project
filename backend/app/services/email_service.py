import smtplib
from email.message import EmailMessage

from app import config


def send_otp_email(to_email, otp_code, purpose):
    # Development mode: no SMTP details, so print the OTP in the terminal
    if config.SMTP_USER == "" or config.SMTP_PASSWORD == "":
        print(f"[DEV] OTP for {to_email} ({purpose}): {otp_code}")
        return

    message = EmailMessage()
    message["Subject"] = "Your TutorNest verification code"
    message["From"] = config.SMTP_USER
    message["To"] = to_email
    message.set_content(
        f"Your TutorNest OTP is {otp_code}.\n"
        f"It is valid for {config.OTP_MINUTES} minutes. Do not share it with anyone."
    )

    try:
        with smtplib.SMTP_SSL(config.SMTP_HOST, config.SMTP_PORT) as server:
            server.login(config.SMTP_USER, config.SMTP_PASSWORD)
            server.send_message(message)
    except Exception as error:
        # This runs in the background, so the user can't see this error
        print("Could not send email:", error)