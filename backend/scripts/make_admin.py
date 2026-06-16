import argparse
import sys
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from app.db.session import SessionLocal  # noqa: E402
from app.models.user import User  # noqa: E402


def make_admin(email: str) -> int:
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()

        if user is None:
            print(f"No user found for email: {email}", file=sys.stderr)
            return 1

        if user.role == "admin":
            print(f"{email} is already an admin.")
            return 0

        user.role = "admin"
        db.commit()
        print(f"Updated {email} role to admin.")
        return 0
    finally:
        db.close()


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Promote an existing GlowBoard user to admin.",
    )
    parser.add_argument("email", help="Email address of an existing user")
    args = parser.parse_args()

    return make_admin(args.email)


if __name__ == "__main__":
    raise SystemExit(main())
