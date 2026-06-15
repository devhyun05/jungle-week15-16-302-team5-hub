from pathlib import Path
import sys

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.db.session import engine
from app.db.migrations import ensure_post_image_url_column


def main() -> None:
    ensure_post_image_url_column(engine)
    print("posts.image_url is ready")


if __name__ == "__main__":
    main()
