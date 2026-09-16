import argparse

import app.models
from app.db import Base, engine


def initialize_database(reset: bool = False):
    if reset:
        print("Dropping existing application tables...")
        Base.metadata.drop_all(bind=engine)

    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)

    print("Database initialization complete.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--reset",
        action="store_true",
        help="Drop existing application tables before recreating them.",
    )

    args = parser.parse_args()

    initialize_database(
        reset=args.reset
    )
