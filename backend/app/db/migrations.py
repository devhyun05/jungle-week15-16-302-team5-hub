from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine


def ensure_post_image_url_column(engine: Engine) -> None:
    inspector = inspect(engine)
    column_names = {
        column["name"]
        for column in inspector.get_columns("posts")
    }

    if "image_url" in column_names:
        return

    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE posts ADD COLUMN image_url TEXT"))
