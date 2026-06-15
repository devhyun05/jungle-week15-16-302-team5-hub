from __future__ import annotations

import json
import os
from dataclasses import dataclass
from typing import Any
from urllib.error import HTTPError
from urllib.request import Request, urlopen


BASE_URL = os.environ.get("SEED_API_BASE_URL", "https://malang-lab-backend.vercel.app").rstrip("/")
PASSWORD = os.environ.get("SEED_USER_PASSWORD", "malang-demo-2026")
BAD_TITLE_PREFIX = "[RAG데모]"
TARGET_COMMENTS_PER_POST = 3


@dataclass(frozen=True)
class DemoUser:
    email: str
    nickname: str


def post(
    author: str,
    title: str,
    post_type: str,
    slime_type: str | None,
    image_url: str,
    tag_names: list[str],
    lines: list[str],
) -> dict[str, Any]:
    return {
        "author": author,
        "title": title,
        "post_type": post_type,
        "slime_type": slime_type,
        "image_url": image_url,
        "tag_names": tag_names,
        "content": "\n".join(lines),
    }


USERS = [
    DemoUser("recipe.malang@example.com", "레시피말랑"),
    DemoUser("failfix.malang@example.com", "실패해결러"),
    DemoUser("review.malang@example.com", "후기요정"),
    DemoUser("beginner.malang@example.com", "초보말랑"),
    DemoUser("texture.malang@example.com", "질감연구원"),
    DemoUser("shop.malang@example.com", "재료탐험가"),
    DemoUser("storage.malang@example.com", "보관박사"),
    DemoUser("glitter.malang@example.com", "반짝말랑"),
    DemoUser("scent.malang@example.com", "향기실험가"),
    DemoUser("question.malang@example.com", "궁금말랑"),
]


IMAGES = {
    "clear": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSL0WsQKXDjQfxWsnrdob8uwG78yMEvF7ND2Q&s",
    "butter": "https://m.media-amazon.com/images/I/71Br7p6So3L._AC_SL1500_.jpg",
    "butter_pack": "https://m.media-amazon.com/images/I/71Br7p6So3L._AC_SL1500_.jpg",
    "pastel_pack": "https://m.media-amazon.com/images/I/71JIzxmEJFL._AC_SL1500_.jpg",
    "foam": "https://m.media-amazon.com/images/I/71AzoD64VTL._AC_SL1500_.jpg",
    "kit": "https://m.media-amazon.com/images/I/71Br7p6So3L._AC_SL1500_.jpg",
    "charms": "https://m.media-amazon.com/images/I/71JIzxmEJFL._AC_SL1500_.jpg",
    "containers": "https://m.media-amazon.com/images/I/71qVNMMTQfL._AC_SL1500_.jpg",
}


POSTS = [
    post(
        "recipe.malang@example.com",
        "클리어 슬라임 기포 덜 생기게 만드는 법",
        "recipe",
        "클리어슬라임",
        IMAGES["clear"],
        ["클리어슬라임", "레시피", "초보자추천", "기포", "숙성"],
        [
            "클리어 글루 100g에 물 15g만 넣고 먼저 천천히 섞어줬어요.",
            "액티베이터는 1ml씩 넣으면서 접듯이 섞었고, 빠르게 젓지 않는 게 제일 중요했습니다.",
            "사진처럼 처음엔 기포가 조금 보여도 밀폐해서 이틀 두니까 훨씬 맑아졌어요.",
        ],
    ),
    post(
        "recipe.malang@example.com",
        "버터슬라임 찢어지지 않게 만든 비율 공유해요",
        "recipe",
        "버터슬라임",
        IMAGES["butter"],
        ["버터슬라임", "아이클레이", "레시피", "부드러움", "초보자추천"],
        [
            "기본 슬라임 80g에 아이클레이 25g 정도 넣었을 때 제일 부드럽게 늘어났어요.",
            "클레이를 더 넣으면 촉감은 좋지만 늘릴 때 끊겨서 처음엔 3:1 정도가 안전했습니다.",
            "향료는 마지막에 한 방울만 넣었고, 섞은 뒤 10분 정도 쉬게 두니까 손에 덜 묻었습니다.",
        ],
    ),
    post(
        "texture.malang@example.com",
        "클라우드 슬라임 눈가루 언제 넣어야 하나요?",
        "failure",
        "클라우드슬라임",
        IMAGES["pastel_pack"],
        ["클라우드슬라임", "눈가루", "실패해결", "질감", "초보자추천"],
        [
            "눈가루를 불린 다음 바로 넣었는데 전체가 축축하고 뭉쳐요.",
            "베이스가 아직 묽은 상태였는데 그때 넣어서 그런지 손으로 잡으면 뚝뚝 떨어집니다.",
            "사진 같은 폭신한 느낌을 원했는데 순서를 다시 잡아야 할까요?",
        ],
    ),
    post(
        "texture.malang@example.com",
        "폼볼 슬라임 바삭한 소리 잘 나는 조합",
        "recipe",
        "폼볼슬라임",
        IMAGES["foam"],
        ["폼볼슬라임", "폼볼", "소리", "레시피", "질감"],
        [
            "작은 폼볼이랑 큰 폼볼을 2:1로 섞으니까 소리가 훨씬 바삭하게 났어요.",
            "베이스는 살짝 단단하게 잡아야 알갱이가 빠지지 않았고, 하루 지나면 더 안정됐습니다.",
            "영상 찍을 때는 손에 묻지 않을 정도까지만 액티베이터를 맞추는 게 좋았어요.",
        ],
    ),
    post(
        "glitter.malang@example.com",
        "글리터 넣어도 투명한 클리어 슬라임 만들기",
        "recipe",
        "클리어슬라임",
        IMAGES["charms"],
        ["글리터", "클리어슬라임", "투명도", "레시피", "숙성"],
        [
            "글리터를 많이 넣으면 예쁜데 금방 탁해져서 아주 조금만 넣었습니다.",
            "색소는 빼고 고운 글리터만 넣었더니 사진처럼 반짝임은 살고 투명도는 유지됐어요.",
            "완성하고 바로 만지기보다 이틀 정도 숙성시키니까 기포가 빠져서 더 예뻤습니다.",
        ],
    ),
    post(
        "glitter.malang@example.com",
        "마블 색소가 너무 빨리 섞여버려요",
        "failure",
        "일반슬라임",
        IMAGES["pastel_pack"],
        ["색소", "마블", "실패해결", "사진팁", "일반"],
        [
            "파랑이랑 보라를 살짝만 넣는다고 했는데 만지다 보니 그냥 한 가지 색이 됐어요.",
            "베이스가 묽으면 마블이 더 빨리 풀리는 건지 궁금합니다.",
            "사진 찍을 때까지만이라도 무늬가 남게 하려면 어떤 상태에서 색소를 넣어야 하나요?",
        ],
    ),
    post(
        "scent.malang@example.com",
        "향료 넣을 때 질감 안 무너지는 양",
        "recipe",
        "버터슬라임",
        IMAGES["butter_pack"],
        ["향료", "레시피", "보관", "버터슬라임", "질감"],
        [
            "버터슬라임 100g 기준으로 향료는 한두 방울만 넣어도 충분했습니다.",
            "처음에 많이 넣었다가 표면이 축축해져서 실패했고, 이번엔 마지막에 조금만 넣었어요.",
            "밀폐 용기에 넣어두니까 다음 날에도 향은 남고 질감은 크게 안 변했습니다.",
        ],
    ),
    post(
        "recipe.malang@example.com",
        "젤리슬라임 탱글하게 잡히는 순서",
        "recipe",
        "젤리슬라임",
        IMAGES["clear"],
        ["젤리슬라임", "탱글함", "액티베이터", "레시피", "초보자추천"],
        [
            "글루와 물을 완전히 섞은 뒤 액티베이터를 아주 조금씩 넣었습니다.",
            "처음 잡힐 때 바로 만지면 손에 묻어서, 5분 정도 기다렸다가 천천히 주물렀어요.",
            "탱글한 느낌은 완성 직후보다 20분 뒤에 더 잘 살아났습니다.",
        ],
    ),
    post(
        "beginner.malang@example.com",
        "처음 만들 때 제일 실패 적었던 기본 비율",
        "recipe",
        "일반슬라임",
        IMAGES["kit"],
        ["초보자추천", "글루", "액티베이터", "레시피", "일반"],
        [
            "글루 100g, 물 10g, 액티베이터 조금으로 시작하니까 초보자인 저도 성공했어요.",
            "처음부터 장식을 넣지 않고 베이스만 먼저 만든 게 도움이 됐습니다.",
            "손에 살짝 묻지만 덩어리로 잡히는 시점에서 멈추고 조금 쉬게 두면 질감이 안정됐어요.",
        ],
    ),
    post(
        "storage.malang@example.com",
        "딱딱해진 슬라임 글리세린으로 살려봤어요",
        "review",
        "일반슬라임",
        IMAGES["containers"],
        ["글리세린", "보관", "후기", "딱딱함", "온도"],
        [
            "겉이 마른 슬라임에 글리세린 한 방울 바르고 밀폐 용기에 30분 넣어뒀습니다.",
            "한 번에 많이 넣으면 표면만 미끄러워져서 정말 조금씩 넣는 게 좋았어요.",
            "겨울엔 꺼내놓는 시간이 길면 금방 말라서 쓰고 바로 닫는 게 제일 효과 있었습니다.",
        ],
    ),
    post(
        "failfix.malang@example.com",
        "소다를 넣어도 슬라임이 계속 녹아요",
        "failure",
        "클리어슬라임",
        IMAGES["clear"],
        ["실패해결", "녹음", "액티베이터", "클리어슬라임", "초보자추천"],
        [
            "클리어 슬라임을 만들었는데 하루 지나니까 물처럼 풀리고 손에 계속 묻어요.",
            "베이킹소다를 조금 더 넣어봤는데 굳는 느낌은 없고 표면만 거칠어졌습니다.",
            "처음에 물을 너무 많이 넣은 것 같은데 다시 살릴 수 있을까요?",
        ],
    ),
    post(
        "beginner.malang@example.com",
        "첫 슬라임이 손에 너무 달라붙어요",
        "failure",
        "일반슬라임",
        IMAGES["kit"],
        ["초보자추천", "끈적임", "실패해결", "액티베이터", "글루"],
        [
            "처음 만든 슬라임인데 손에 붙어서 떼어낼 때 실처럼 늘어납니다.",
            "액티베이터를 많이 넣으면 딱딱해질까 봐 거의 못 넣었어요.",
            "사진처럼 덩어리는 잡히는데 손에서 깔끔하게 안 떨어질 때 기준을 알고 싶습니다.",
        ],
    ),
    post(
        "failfix.malang@example.com",
        "버터슬라임이 툭툭 끊기고 안 늘어나요",
        "failure",
        "버터슬라임",
        IMAGES["butter"],
        ["버터슬라임", "찢김", "실패해결", "글리세린", "아이클레이"],
        [
            "버터슬라임을 만들었는데 늘리면 길게 안 늘어나고 중간에서 끊겨요.",
            "액티베이터를 많이 넣은 뒤 클레이를 섞어서 그런 것 같습니다.",
            "로션을 넣어봤지만 표면만 미끄럽고 속은 여전히 뚝뚝 끊깁니다.",
        ],
    ),
    post(
        "question.malang@example.com",
        "액티베이터 많이 들어간 슬라임 복구 가능할까요?",
        "failure",
        "일반슬라임",
        IMAGES["containers"],
        ["딱딱함", "실패해결", "액티베이터", "글리세린", "초보자추천"],
        [
            "액티베이터가 한 번에 많이 들어가서 고무처럼 딱딱해졌어요.",
            "물만 넣으면 겉만 미끄럽고 속은 그대로라서 더 망칠까 봐 멈췄습니다.",
            "글리세린이나 로션 중에 뭘 먼저 넣는 게 나을까요?",
        ],
    ),
    post(
        "glitter.malang@example.com",
        "색소가 손에 묻는 건 어떻게 줄이나요?",
        "failure",
        "일반슬라임",
        IMAGES["pastel_pack"],
        ["색소", "이염", "실패해결", "보관", "사진팁"],
        [
            "색을 진하게 내고 싶어서 색소를 많이 넣었더니 손이 살짝 물들었습니다.",
            "슬라임 자체는 괜찮은데 용기에도 색이 남아서 걱정돼요.",
            "선명한 색은 유지하면서 이염을 줄이는 방법이 있을까요?",
        ],
    ),
    post(
        "scent.malang@example.com",
        "향료 넣은 뒤 질감이 묽어졌어요",
        "failure",
        "버터슬라임",
        IMAGES["butter_pack"],
        ["향료", "냄새", "녹음", "실패해결", "버터슬라임"],
        [
            "복숭아 향료를 많이 넣었더니 향은 좋은데 슬라임이 묽어졌습니다.",
            "액티베이터를 넣으면 향료랑 섞여서 더 이상해질까 봐 아직 안 넣었어요.",
            "향은 조금 줄어도 괜찮으니 질감을 다시 잡는 방법이 궁금합니다.",
        ],
    ),
    post(
        "texture.malang@example.com",
        "폼볼이 계속 빠져나오는 이유가 뭘까요?",
        "failure",
        "폼볼슬라임",
        IMAGES["foam"],
        ["폼볼", "실패해결", "질감", "끈적임", "폼볼슬라임"],
        [
            "폼볼을 섞으면 처음에는 예쁜데 만질수록 알갱이가 계속 떨어집니다.",
            "베이스가 묽은 편이라 폼볼을 잡아주지 못하는 것 같아요.",
            "소리는 살리면서 빠짐을 줄이는 기준이 있을까요?",
        ],
    ),
    post(
        "question.malang@example.com",
        "클리어 슬라임이 계속 뿌옇게 보여요",
        "failure",
        "클리어슬라임",
        IMAGES["clear"],
        ["클리어슬라임", "투명도", "기포", "실패해결", "숙성"],
        [
            "만든 지 하루가 지났는데도 클리어 슬라임이 우윳빛처럼 뿌옇습니다.",
            "많이 저어서 기포가 들어간 건지 재료 문제인지 모르겠어요.",
            "며칠 더 숙성하면 사진처럼 맑아질 수 있는지 궁금합니다.",
        ],
    ),
    post(
        "review.malang@example.com",
        "다이소 물풀로 클리어 슬라임 만들어본 후기",
        "review",
        "클리어슬라임",
        IMAGES["clear"],
        ["후기", "글루", "클리어슬라임", "재료구매", "투명도"],
        [
            "다이소 물풀은 가격이 좋아서 연습용으로 쓰기 괜찮았습니다.",
            "투명도는 전용 클리어 글루보다 낮았고 숙성 시간이 더 필요했어요.",
            "처음 연습할 때는 추천하지만 선물용으로 만들 땐 전용 글루가 더 나았습니다.",
        ],
    ),
    post(
        "shop.malang@example.com",
        "액티베이터 종류별로 써본 느낌",
        "review",
        None,
        IMAGES["kit"],
        ["액티베이터", "재료구매", "후기", "실패해결", "초보자추천"],
        [
            "렌즈 세척액 기반은 천천히 굳어서 초보자가 조절하기 쉬웠습니다.",
            "붕사 희석액은 반응이 빨라서 편하지만 한 번에 많이 넣으면 바로 딱딱해졌어요.",
            "녹은 슬라임 복구에는 농도 있는 액티베이터를 아주 소량 쓰는 쪽이 효과적이었습니다.",
        ],
    ),
    post(
        "review.malang@example.com",
        "향료 넣은 슬라임 일주일 보관 후기",
        "review",
        "버터슬라임",
        IMAGES["butter_pack"],
        ["향료", "보관", "후기", "버터슬라임", "냄새"],
        [
            "향료를 많이 넣으면 처음 향은 좋은데 다음 날 표면이 조금 축축해졌습니다.",
            "오일감 있는 향료는 정말 적게 넣어야 질감 유지가 쉬웠어요.",
            "밀폐 용기에 넣고 직사광선을 피했더니 일주일 정도는 촉감이 유지됐습니다.",
        ],
    ),
    post(
        "shop.malang@example.com",
        "전용 글루랑 일반 물풀 차이 느낀 점",
        "review",
        "일반슬라임",
        IMAGES["kit"],
        ["글루", "후기", "재료구매", "레시피", "초보자추천"],
        [
            "전용 글루는 반응이 일정해서 같은 레시피를 반복하기 쉬웠습니다.",
            "일반 물풀은 제품마다 점도가 달라서 액티베이터 양을 다시 맞춰야 했어요.",
            "연습은 일반 물풀로 해도 되지만 결과 비교에는 전용 글루가 훨씬 편했습니다.",
        ],
    ),
    post(
        "texture.malang@example.com",
        "아이클레이 브랜드별 버터 질감 비교",
        "review",
        "버터슬라임",
        IMAGES["butter"],
        ["아이클레이", "버터슬라임", "후기", "질감", "재료구매"],
        [
            "부드러운 클레이는 섞기 쉽지만 많이 넣으면 탄성이 줄었습니다.",
            "건조한 클레이는 처음부터 갈라지는 느낌이 있어서 글리세린이 조금 필요했어요.",
            "버터 질감을 목표로 하면 클레이 양보다 베이스 단단함이 더 중요했습니다.",
        ],
    ),
    post(
        "storage.malang@example.com",
        "보관용기 바꿨더니 마르는 속도가 달라졌어요",
        "review",
        None,
        IMAGES["containers"],
        ["보관용기", "보관", "후기", "온도", "딱딱함"],
        [
            "뚜껑이 느슨한 용기는 하루 만에 가장자리가 마르기 시작했습니다.",
            "실리콘 패킹 있는 용기는 냄새랑 수분 유지가 가장 안정적이었어요.",
            "용기에 빈 공간이 너무 많지 않게 담는 것도 꽤 도움이 됐습니다.",
        ],
    ),
    post(
        "glitter.malang@example.com",
        "반짝이 파츠 넣은 클리어 슬라임 후기",
        "review",
        "클리어슬라임",
        IMAGES["charms"],
        ["글리터", "후기", "사진팁", "클리어슬라임", "재료구매"],
        [
            "큰 파츠는 예쁘지만 만질 때 손에 걸리는 느낌이 있었습니다.",
            "작은 글리터는 촉감 변화가 적고 사진에서 은은하게 보여서 만족도가 높았어요.",
            "파츠가 무거우면 아래로 가라앉아서 촬영 전에 한 번 천천히 접어주는 게 좋았습니다.",
        ],
    ),
    post(
        "beginner.malang@example.com",
        "물과 액티베이터 차이를 이제야 알았어요",
        "general",
        None,
        IMAGES["kit"],
        ["초보자추천", "액티베이터", "일반", "레시피", "녹음"],
        [
            "물을 넣으면 양이 늘고 부드러워지지만 슬라임을 굳히지는 못하더라고요.",
            "액티베이터는 글루를 슬라임 질감으로 바꾸는 역할이라 물이랑 목적이 달랐습니다.",
            "처음 만드는 분들은 물을 적게 시작하고 질감을 보면서 추가하는 걸 추천해요.",
        ],
    ),
    post(
        "shop.malang@example.com",
        "슬라임 재료 살 때 먼저 확인하는 것들",
        "general",
        None,
        IMAGES["kit"],
        ["재료구매", "글루", "액티베이터", "초보자추천", "안전"],
        [
            "글루는 PVA 계열인지, 액티베이터와 반응 사례가 있는지 먼저 확인합니다.",
            "클레이는 너무 건조한 제품이면 버터슬라임이 갈라질 수 있어요.",
            "처음엔 글루, 액티베이터, 보관 용기부터 사고 장식 재료는 나중에 추가해도 충분했습니다.",
        ],
    ),
    post(
        "glitter.malang@example.com",
        "슬라임 사진 예쁘게 찍는 배경 추천",
        "general",
        None,
        IMAGES["charms"],
        ["사진팁", "글리터", "마블", "투명도", "일반"],
        [
            "클리어 슬라임은 흰 배경보다 살짝 푸른 배경에서 투명도가 잘 보였습니다.",
            "직사광선보다 창가의 부드러운 빛이 기포랑 반짝임을 자연스럽게 보여줬어요.",
            "마블 무늬는 많이 만지기 전에 먼저 찍어야 색이 번지지 않았습니다.",
        ],
    ),
    post(
        "storage.malang@example.com",
        "아이랑 만들 때 재료 보관 이렇게 하고 있어요",
        "general",
        None,
        IMAGES["containers"],
        ["안전", "보관", "보관용기", "초보자추천", "재료구매"],
        [
            "액티베이터와 향료는 이름표를 붙여 슬라임 완성품과 따로 보관했습니다.",
            "만든 날짜를 적어두면 냄새나 질감 변화를 확인하기 쉬웠어요.",
            "아이랑 만들 때는 만진 뒤 손 씻기와 밀폐 보관을 꼭 같이 알려주고 있습니다.",
        ],
    ),
    post(
        "question.malang@example.com",
        "실패 기록 남길 때 어떤 걸 적어두면 좋을까요?",
        "general",
        None,
        IMAGES["containers"],
        ["기록법", "실패해결", "레시피", "후기", "초보자추천"],
        [
            "다음에 비슷한 실패를 찾기 쉽게 재료명, 비율, 액티베이터 양을 같이 적고 있어요.",
            "녹음, 끈적임, 딱딱함 같은 증상도 태그로 남기면 검색할 때 편했습니다.",
            "사진도 같이 올리면 댓글에서 상태를 설명하기가 훨씬 쉬웠어요.",
        ],
    ),
]


COMMENT_TEMPLATES = [
    ("failfix.malang@example.com", "{slime}이면 액티베이터를 한 번에 넣지 말고 정말 조금씩 나눠 넣는 게 안전해 보여요."),
    ("recipe.malang@example.com", "이 글 보고 같은 비율로 한 번 따라 해보려고요. {tag} 부분이 특히 도움 됐어요."),
    ("texture.malang@example.com", "질감만 보면 베이스 단단함이랑 숙성 시간을 같이 보면 원인 찾기가 더 쉬울 것 같습니다."),
    ("beginner.malang@example.com", "초보자 입장에서 사진이랑 설명이 같이 있어서 상태 비교하기 좋네요."),
    ("shop.malang@example.com", "재료가 바뀌면 결과도 꽤 달라져서 사용한 글루랑 액티베이터 이름도 같이 적어두면 좋겠어요."),
    ("review.malang@example.com", "다음 날 질감 변화도 댓글로 남겨주시면 나중에 참고하기 좋을 것 같아요."),
    ("storage.malang@example.com", "보관용기랑 실내 온도도 영향이 커서 사용 후 바로 닫아두는 걸 추천합니다."),
    ("glitter.malang@example.com", "사진으로 보니까 {tag} 상태가 잘 보여요. 같은 조건으로 비교 사진 남기면 더 좋겠네요."),
    ("scent.malang@example.com", "향료나 색소가 들어간 경우에는 반응이 늦게 올 때도 있어서 하루 뒤 상태도 확인해보세요."),
    ("question.malang@example.com", "저도 비슷하게 겪었는데 태그 덕분에 검색해서 다시 찾아보기 좋을 것 같아요."),
]


def request_json(
    method: str,
    path: str,
    payload: dict[str, Any] | None = None,
    token: str | None = None,
) -> tuple[int, dict[str, Any] | None]:
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    request = Request(
        f"{BASE_URL}{path}",
        data=data,
        method=method,
        headers={
            "Content-Type": "application/json",
            **({"Authorization": f"Bearer {token}"} if token else {}),
        },
    )

    try:
        with urlopen(request, timeout=30) as response:
            body = response.read().decode("utf-8")
            return response.status, json.loads(body) if body else None
    except HTTPError as error:
        body = error.read().decode("utf-8")
        try:
            parsed_body = json.loads(body) if body else None
        except json.JSONDecodeError:
            parsed_body = {"detail": body}
        return error.code, parsed_body


def get_json(path: str) -> dict[str, Any]:
    request = Request(f"{BASE_URL}{path}", method="GET")
    with urlopen(request, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def ensure_users() -> dict[str, str]:
    tokens: dict[str, str] = {}

    for user in USERS:
        signup_status, signup_body = request_json(
            "POST",
            "/auth/signup",
            {"email": user.email, "password": PASSWORD, "nickname": user.nickname},
        )
        if signup_status == 201:
            print(f"created user: {user.email}")

        login_status, login_body = request_json(
            "POST",
            "/auth/login",
            {"email": user.email, "password": PASSWORD},
        )
        if login_status != 200 or login_body is None:
            raise RuntimeError(
                f"signup/login failed for {user.email}: "
                f"signup={signup_status} {signup_body}, login={login_status} {login_body}"
            )
        if signup_status != 201:
            print(f"user exists: {user.email}")
        tokens[user.email] = login_body["access_token"]

    return tokens


def fetch_posts() -> list[dict[str, Any]]:
    return get_json("/posts?size=50")["items"]


def cleanup_bad_seed_posts(tokens: dict[str, str]) -> int:
    deleted_count = 0
    for post_item in fetch_posts():
        if not post_item["title"].startswith(BAD_TITLE_PREFIX):
            continue

        email = post_item["author"]["email"]
        status, body = request_json("DELETE", f"/posts/{post_item['id']}", token=tokens[email])
        if status != 204:
            raise RuntimeError(f"post delete failed: {post_item['id']} {status} {body}")
        deleted_count += 1
        print(f"deleted bad seed post: {post_item['title']}")

    return deleted_count


def fetch_posts_by_title() -> dict[str, dict[str, Any]]:
    return {item["title"]: item for item in fetch_posts()}


def ensure_posts(tokens: dict[str, str]) -> dict[str, dict[str, Any]]:
    posts_by_title = fetch_posts_by_title()

    for post_data in POSTS:
        author = post_data["author"]
        payload = {key: value for key, value in post_data.items() if key != "author"}

        if post_data["title"] in posts_by_title:
            existing_post = posts_by_title[post_data["title"]]
            status, body = request_json("PATCH", f"/posts/{existing_post['id']}", payload, token=tokens[author])
            if status != 200 or body is None:
                raise RuntimeError(f"post update failed: {post_data['title']} {status} {body}")
            posts_by_title[body["title"]] = body
            print(f"updated post: {body['title']}")
            continue

        status, body = request_json("POST", "/posts", payload, token=tokens[author])
        if status != 201 or body is None:
            raise RuntimeError(f"post create failed: {post_data['title']} {status} {body}")
        posts_by_title[body["title"]] = body
        print(f"created post: {body['title']}")

    return posts_by_title


def render_comment(template: str, post_data: dict[str, Any]) -> str:
    return template.format(
        slime=post_data.get("slime_type") or "이 주제",
        tag=post_data["tag_names"][0],
    )


def ensure_comments(tokens: dict[str, str], posts_by_title: dict[str, dict[str, Any]]) -> int:
    created_count = 0

    for index, post_data in enumerate(POSTS):
        post_item = posts_by_title[post_data["title"]]
        comments_response = get_json(f"/posts/{post_item['id']}/comments")
        existing_contents = {item["content"] for item in comments_response["items"]}

        offset = 0
        while len(existing_contents) < TARGET_COMMENTS_PER_POST and offset < len(COMMENT_TEMPLATES) * 2:
            email, template = COMMENT_TEMPLATES[(index + offset) % len(COMMENT_TEMPLATES)]
            offset += 1
            if email == post_data["author"]:
                continue

            content = render_comment(template, post_data)
            if content in existing_contents:
                continue

            status, body = request_json(
                "POST",
                f"/posts/{post_item['id']}/comments",
                {"content": content},
                token=tokens[email],
            )
            if status != 201 or body is None:
                raise RuntimeError(f"comment create failed for post {post_item['id']}: {status} {body}")

            existing_contents.add(content)
            created_count += 1

        if len(existing_contents) < TARGET_COMMENTS_PER_POST:
            raise RuntimeError(f"not enough comments for post {post_item['id']}")

    return created_count


def seeded_post_items(posts_by_title: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    return [posts_by_title[post_data["title"]] for post_data in POSTS if post_data["title"] in posts_by_title]


def count_comments(posts: list[dict[str, Any]]) -> int:
    return sum(len(get_json(f"/posts/{post_item['id']}/comments")["items"]) for post_item in posts)


def main() -> None:
    print(f"seeding via API: {BASE_URL}")
    tokens = ensure_users()
    deleted_bad_posts = cleanup_bad_seed_posts(tokens)
    posts_by_title = ensure_posts(tokens)
    created_comments = ensure_comments(tokens, posts_by_title)
    seeded_posts = seeded_post_items(posts_by_title)
    unique_tags = sorted({tag for post_data in POSTS for tag in post_data["tag_names"]})
    posts_response = get_json("/posts?size=50")

    print(
        json.dumps(
            {
                "users_checked": len(USERS),
                "deleted_bad_posts": deleted_bad_posts,
                "seed_posts_total": len(seeded_posts),
                "seed_posts_with_images": sum(1 for post_item in seeded_posts if post_item.get("image_url")),
                "seed_comments_total": count_comments(seeded_posts),
                "comments_created_this_run": created_comments,
                "unique_seed_tags": len(unique_tags),
                "api_total_posts": posts_response["total"],
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
