from fastapi import APIRouter

router = APIRouter()


@router.post("/signup")
def signup():
    """TODO: 회원가입 API를 구현한다."""
    return {"message": "signup endpoint skeleton"}


@router.post("/login")
def login():
    """TODO: 로그인 후 JWT access token을 발급한다."""
    return {"message": "login endpoint skeleton"}


@router.get("/me")
def me():
    """TODO: 현재 로그인한 사용자 정보를 반환한다."""
    return {"message": "me endpoint skeleton"}
