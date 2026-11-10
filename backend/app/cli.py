"""Management commands.

Usage:
    uv run python -m app.cli create-admin owner@example.com "Owner Name"
"""

import argparse
import getpass
import sys

from sqlalchemy import select

from app.database import SessionLocal
from app.models import User
from app.security import hash_password

MIN_PASSWORD_LENGTH = 8


def create_admin(email: str, full_name: str) -> None:
    email = email.strip().lower()
    password = getpass.getpass("Password: ")
    if len(password) < MIN_PASSWORD_LENGTH:
        sys.exit(f"Password must be at least {MIN_PASSWORD_LENGTH} characters")
    if password != getpass.getpass("Repeat password: "):
        sys.exit("Passwords do not match")

    with SessionLocal() as db:
        user = db.scalar(select(User).where(User.email == email))
        if user is None:
            db.add(User(email=email, full_name=full_name, hashed_password=hash_password(password)))
            print(f"Admin {email} created")
        else:
            user.full_name = full_name
            user.hashed_password = hash_password(password)
            user.is_active = True
            print(f"Admin {email} already existed: password updated")
        db.commit()


def main() -> None:
    parser = argparse.ArgumentParser(prog="app.cli")
    commands = parser.add_subparsers(dest="command", required=True)
    admin = commands.add_parser("create-admin", help="Create an admin or reset its password")
    admin.add_argument("email")
    admin.add_argument("full_name")

    args = parser.parse_args()
    if args.command == "create-admin":
        create_admin(args.email, args.full_name)


if __name__ == "__main__":
    main()
