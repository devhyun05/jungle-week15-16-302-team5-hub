from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""


# TODO: migrations 도입 시 모든 model을 import하여 metadata에 등록한다.
