from __future__ import annotations

import base64
import colorsys
import json
import math
import os
import random
import struct
import zlib
from dataclasses import dataclass
from typing import Any
from urllib.error import HTTPError
from urllib.request import Request, urlopen


BASE_URL = os.environ.get("SEED_API_BASE_URL", "https://malang-lab-backend.vercel.app").rstrip("/")
PASSWORD = os.environ.get("SEED_USER_PASSWORD", "malang-demo-2026")
POST_PREFIX = "[RAG데모] "
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
    image_theme: str,
    tag_names: list[str],
    lines: list[str],
) -> dict[str, Any]:
    return {
        "author": author,
        "title": f"{POST_PREFIX}{title}",
        "post_type": post_type,
        "slime_type": slime_type,
        "image_theme": image_theme,
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


POSTS = [
    post(
        "recipe.malang@example.com",
        "클리어 슬라임 기포 줄이는 기본 레시피",
        "recipe",
        "클리어슬라임",
        "clear-blue-basic",
        ["클리어슬라임", "레시피", "초보자추천", "기포", "숙성"],
        [
            "클리어 글루 100g에 물 15g을 먼저 섞고 액티베이터는 1ml씩 나눠 넣었어요.",
            "처음부터 빠르게 젓지 말고 벽면을 긁듯이 천천히 섞으면 큰 기포가 덜 생깁니다.",
            "완성 직후에는 뿌옇지만 밀폐 용기에 2일 정도 숙성하면 투명도가 올라왔어요.",
        ],
    ),
    post(
        "recipe.malang@example.com",
        "버터슬라임 부드럽게 늘어나는 비율",
        "recipe",
        "버터슬라임",
        "butter-yellow-soft",
        ["버터슬라임", "아이클레이", "레시피", "부드러움", "초보자추천"],
        [
            "기본 슬라임 80g에 아이클레이 25g을 섞으니 찢김 없이 잘 늘어났습니다.",
            "클레이를 많이 넣으면 촉감은 부드럽지만 탄성이 줄어서 처음에는 3:1 비율이 안전했어요.",
            "향료는 마지막에 넣어야 질감이 갑자기 무너지지 않았습니다.",
        ],
    ),
    post(
        "texture.malang@example.com",
        "클라우드슬라임 눈가루 넣는 타이밍",
        "recipe",
        "클라우드슬라임",
        "cloud-pink-snow",
        ["클라우드슬라임", "눈가루", "레시피", "질감", "숙성"],
        [
            "눈가루는 물을 충분히 먹인 뒤 물기를 살짝 짜고 넣어야 질감이 고르게 나왔어요.",
            "베이스가 너무 묽을 때 눈가루를 넣으면 축축하고 뭉치는 느낌이 강했습니다.",
            "베이스를 약간 단단하게 만든 뒤 눈가루를 조금씩 접듯이 섞는 쪽이 실패가 적었습니다.",
        ],
    ),
    post(
        "texture.malang@example.com",
        "폼볼 슬라임 바삭한 소리 살리는 방법",
        "recipe",
        "폼볼슬라임",
        "foam-orange-crunch",
        ["폼볼슬라임", "폼볼", "소리", "레시피", "질감"],
        [
            "폼볼은 작은 알갱이와 큰 알갱이를 2:1로 섞으니 바삭한 소리가 더 잘 났습니다.",
            "베이스가 너무 묽으면 폼볼이 빠져나와서 약간 단단한 상태에서 섞는 게 좋았습니다.",
            "완성 후 하루 숙성하니 폼볼이 베이스에 안정적으로 붙었습니다.",
        ],
    ),
    post(
        "glitter.malang@example.com",
        "글리터 클리어 슬라임 투명도 유지하기",
        "recipe",
        "클리어슬라임",
        "glitter-aqua-clear",
        ["글리터", "클리어슬라임", "투명도", "레시피", "숙성"],
        [
            "글리터는 아주 고운 입자를 적게 넣었을 때 투명도가 가장 잘 유지됐습니다.",
            "색소와 글리터를 같이 많이 넣으면 탁해져서 한 번에 한 재료만 테스트했습니다.",
            "완성 후 기포가 빠질 때까지 2일 정도 두니 반짝임이 더 또렷해졌습니다.",
        ],
    ),
    post(
        "glitter.malang@example.com",
        "마블 색소가 번지지 않게 섞는 법",
        "recipe",
        "일반슬라임",
        "marble-rainbow",
        ["색소", "마블", "레시피", "사진팁", "일반"],
        [
            "색소를 완전히 섞지 않고 세 번 정도만 접어주면 마블 무늬가 남았습니다.",
            "베이스가 묽으면 색이 빠르게 퍼져서 촬영 전에 조금 단단하게 맞췄습니다.",
            "흰색 베이스에 파랑과 보라를 소량 넣으니 사진에서 무늬가 선명했습니다.",
        ],
    ),
    post(
        "scent.malang@example.com",
        "향료 넣어도 질감 유지되는 소량 기준",
        "recipe",
        "버터슬라임",
        "scent-peach-drop",
        ["향료", "레시피", "보관", "버터슬라임", "질감"],
        [
            "버터슬라임 100g 기준 향료는 한두 방울만 넣어도 충분했습니다.",
            "향료를 먼저 넣으면 베이스가 풀리는 느낌이 있어 마지막에 섞었습니다.",
            "향이 강해도 액티베이터를 바로 추가하지 말고 10분 정도 쉬게 두는 편이 안정적이었습니다.",
        ],
    ),
    post(
        "recipe.malang@example.com",
        "젤리슬라임 탱글한 탄성 만드는 순서",
        "recipe",
        "젤리슬라임",
        "jelly-green-bounce",
        ["젤리슬라임", "탱글함", "액티베이터", "레시피", "초보자추천"],
        [
            "글루와 물을 먼저 충분히 섞은 뒤 액티베이터를 아주 천천히 넣었습니다.",
            "탱글한 질감은 완성 직후보다 20분 정도 쉬게 둔 뒤 더 잘 살아났습니다.",
            "너무 단단해지면 물보다 글리세린 한 방울이 탄성 복구에 더 좋았습니다.",
        ],
    ),
    post(
        "beginner.malang@example.com",
        "초보자용 글루 100g 기준 실패 적은 레시피",
        "recipe",
        "일반슬라임",
        "beginner-sky-kit",
        ["초보자추천", "글루", "액티베이터", "레시피", "일반"],
        [
            "글루 100g, 물 10g, 액티베이터 소량으로 시작하니 실패가 적었습니다.",
            "처음부터 장식을 넣지 않고 베이스만 완성한 뒤 질감을 확인했습니다.",
            "손에 살짝 묻지만 덩어리로 잡히는 시점에서 멈추면 이후에 더 안정적으로 굳었습니다.",
        ],
    ),
    post(
        "storage.malang@example.com",
        "건조해진 슬라임을 글리세린으로 살리는 법",
        "recipe",
        "일반슬라임",
        "glycerin-lavender",
        ["글리세린", "보관", "레시피", "딱딱함", "온도"],
        [
            "겉이 마른 슬라임은 글리세린 한 방울을 바르고 밀폐 용기에 30분 넣어두었습니다.",
            "한 번에 많이 넣으면 표면만 미끄러워져서 소량씩 나눠 넣는 게 중요했습니다.",
            "겨울처럼 건조한 날에는 사용 후 바로 뚜껑을 닫는 습관이 가장 효과적이었습니다.",
        ],
    ),
    post(
        "failfix.malang@example.com",
        "소다를 넣어도 슬라임이 계속 녹는 문제",
        "failure",
        "클리어슬라임",
        "melt-mint-clear",
        ["실패해결", "녹음", "액티베이터", "클리어슬라임", "초보자추천"],
        [
            "클리어 슬라임이 하루 지나니 물처럼 풀리고 손에 계속 묻었습니다.",
            "베이킹소다를 더 넣어봤지만 굳지 않고 오히려 표면만 거칠어졌어요.",
            "처음 레시피에서 물을 많이 넣었고 액티베이터 농도도 약했던 것 같습니다.",
        ],
    ),
    post(
        "beginner.malang@example.com",
        "첫 슬라임이 손에 너무 달라붙어요",
        "failure",
        "일반슬라임",
        "sticky-green-hand",
        ["초보자추천", "끈적임", "실패해결", "액티베이터", "글루"],
        [
            "처음 만든 슬라임인데 손에 붙어서 떼어낼 때 실처럼 늘어납니다.",
            "액티베이터를 한 번에 많이 넣으면 딱딱해질까 봐 거의 넣지 못했습니다.",
            "초보자가 확인해야 할 기준이 있으면 알려주세요.",
        ],
    ),
    post(
        "failfix.malang@example.com",
        "버터슬라임이 툭툭 끊기고 안 늘어나요",
        "failure",
        "버터슬라임",
        "stretch-coral-break",
        ["버터슬라임", "찢김", "실패해결", "글리세린", "아이클레이"],
        [
            "버터슬라임을 만들었는데 늘리면 길게 늘어나지 않고 중간에서 끊겨요.",
            "액티베이터를 많이 넣은 뒤 클레이를 섞어서 그런 것 같습니다.",
            "로션을 넣어봤지만 표면만 미끄럽고 속은 여전히 뚝뚝 끊깁니다.",
        ],
    ),
    post(
        "question.malang@example.com",
        "액티베이터를 많이 넣어서 딱딱해졌어요",
        "failure",
        "일반슬라임",
        "hard-blue-fix",
        ["딱딱함", "실패해결", "액티베이터", "글리세린", "초보자추천"],
        [
            "액티베이터를 조금씩 넣어야 하는데 한 번에 많이 들어갔습니다.",
            "처음에는 잘 뭉쳤지만 10분 뒤부터 고무처럼 단단해졌어요.",
            "물이나 로션 중 무엇을 먼저 넣어야 하는지 헷갈립니다.",
        ],
    ),
    post(
        "glitter.malang@example.com",
        "색소가 손과 책상에 묻는 이염 문제",
        "failure",
        "일반슬라임",
        "color-stain-pink",
        ["색소", "이염", "실패해결", "보관", "사진팁"],
        [
            "선명한 색을 내려고 색소를 많이 넣었더니 손에 물들었습니다.",
            "슬라임 자체는 괜찮은데 용기에도 색이 조금 남았어요.",
            "색을 유지하면서 이염을 줄이는 방법이 궁금합니다.",
        ],
    ),
    post(
        "scent.malang@example.com",
        "향료 넣은 뒤 냄새가 너무 강하고 묽어졌어요",
        "failure",
        "버터슬라임",
        "scent-strong-orange",
        ["향료", "냄새", "녹음", "실패해결", "버터슬라임"],
        [
            "복숭아 향료를 많이 넣었더니 향이 너무 강하고 질감도 묽어졌습니다.",
            "액티베이터를 넣으면 향료와 섞여 더 이상해질까 봐 멈췄어요.",
            "향은 줄이고 질감은 살리는 방법이 있을까요?",
        ],
    ),
    post(
        "texture.malang@example.com",
        "폼볼이 계속 빠져나오는 슬라임",
        "failure",
        "폼볼슬라임",
        "foam-fallout-yellow",
        ["폼볼", "실패해결", "질감", "끈적임", "폼볼슬라임"],
        [
            "폼볼을 섞으면 처음에는 예쁜데 만질수록 알갱이가 계속 떨어집니다.",
            "베이스가 묽은 편이라 폼볼을 잡아주지 못하는 것 같아요.",
            "소리를 살리면서 빠짐을 줄이는 기준을 알고 싶습니다.",
        ],
    ),
    post(
        "question.malang@example.com",
        "클리어 슬라임이 계속 뿌옇게 보여요",
        "failure",
        "클리어슬라임",
        "cloudy-clear-blue",
        ["클리어슬라임", "투명도", "기포", "실패해결", "숙성"],
        [
            "만든 지 하루가 지났는데도 클리어 슬라임이 우윳빛처럼 뿌옇습니다.",
            "많이 저어서 기포가 들어간 건지 재료 문제인지 모르겠어요.",
            "며칠 더 숙성하면 투명해지는지 확인 기준이 궁금합니다.",
        ],
    ),
    post(
        "review.malang@example.com",
        "다이소 물풀로 만든 클리어 슬라임 후기",
        "review",
        "클리어슬라임",
        "glue-clear-review",
        ["후기", "글루", "클리어슬라임", "재료구매", "투명도"],
        [
            "다이소 물풀은 가격이 좋아서 연습용으로 쓰기 괜찮았습니다.",
            "투명도는 전용 클리어 글루보다 조금 낮았고 숙성 시간이 더 필요했어요.",
            "초보자 테스트용으로는 추천하지만 선물용에는 전용 글루가 더 나았습니다.",
        ],
    ),
    post(
        "shop.malang@example.com",
        "액티베이터 종류별 사용감 비교",
        "review",
        None,
        "activator-purple-review",
        ["액티베이터", "재료구매", "후기", "실패해결", "초보자추천"],
        [
            "렌즈 세척액 기반 액티베이터는 초보자가 조절하기 쉬웠지만 완성까지 시간이 걸렸습니다.",
            "붕사 희석액은 반응이 빠르지만 한 번에 많이 넣으면 바로 딱딱해졌어요.",
            "녹은 슬라임 복구에는 농도가 있는 액티베이터를 아주 소량 쓰는 쪽이 효과적이었습니다.",
        ],
    ),
    post(
        "review.malang@example.com",
        "향료 넣은 슬라임 일주일 보관 후기",
        "review",
        "버터슬라임",
        "scent-peach-storage",
        ["향료", "보관", "후기", "버터슬라임", "냄새"],
        [
            "향료를 많이 넣으면 처음 향은 좋지만 다음 날 표면이 조금 축축해졌습니다.",
            "버터슬라임에는 오일감 있는 향료를 아주 적게 넣는 편이 질감 유지에 좋았어요.",
            "밀폐 용기에 넣고 직사광선을 피했더니 일주일 정도는 촉감이 유지됐습니다.",
        ],
    ),
    post(
        "shop.malang@example.com",
        "전용 글루와 일반 물풀 비교 후기",
        "review",
        "일반슬라임",
        "glue-compare-lime",
        ["글루", "후기", "재료구매", "레시피", "초보자추천"],
        [
            "전용 글루는 반응이 일정해서 레시피를 반복하기 쉬웠습니다.",
            "일반 물풀은 제품마다 점도가 달라서 액티베이터 양을 다시 맞춰야 했어요.",
            "처음 연습은 일반 물풀로 해도 되지만 결과 비교에는 전용 글루가 편했습니다.",
        ],
    ),
    post(
        "texture.malang@example.com",
        "아이클레이 브랜드별 버터 질감 비교",
        "review",
        "버터슬라임",
        "clay-compare-cream",
        ["아이클레이", "버터슬라임", "후기", "질감", "재료구매"],
        [
            "부드러운 클레이는 섞기 쉽지만 많이 넣으면 탄성이 줄었습니다.",
            "건조한 클레이는 처음부터 갈라지는 느낌이 있어서 글리세린이 조금 필요했어요.",
            "버터 질감을 목표로 하면 클레이 양보다 베이스 단단함이 더 중요했습니다.",
        ],
    ),
    post(
        "storage.malang@example.com",
        "보관용기별 슬라임 마름 정도 후기",
        "review",
        None,
        "container-mint-review",
        ["보관용기", "보관", "후기", "온도", "딱딱함"],
        [
            "뚜껑이 느슨한 용기는 하루 만에 가장자리가 마르기 시작했습니다.",
            "실리콘 패킹이 있는 용기는 냄새와 수분 유지가 가장 안정적이었어요.",
            "작은 용기에 빈 공간을 줄여 담으면 표면 마름이 덜했습니다.",
        ],
    ),
    post(
        "glitter.malang@example.com",
        "반짝이 파츠 넣은 글리터 슬라임 후기",
        "review",
        "클리어슬라임",
        "glitter-parts-review",
        ["글리터", "후기", "사진팁", "클리어슬라임", "재료구매"],
        [
            "큰 파츠는 예쁘지만 만질 때 손에 걸리는 느낌이 있었습니다.",
            "작은 글리터는 촉감 변화가 적고 사진에서 은은하게 보여서 만족도가 높았어요.",
            "파츠가 무거우면 아래로 가라앉아서 촬영 전 한 번 천천히 접어주는 게 좋았습니다.",
        ],
    ),
    post(
        "beginner.malang@example.com",
        "초보자가 헷갈리는 물과 액티베이터 차이",
        "general",
        None,
        "water-activator-sky",
        ["초보자추천", "액티베이터", "일반", "레시피", "녹음"],
        [
            "물을 넣으면 양이 늘고 부드러워지지만 슬라임을 굳히지는 못했습니다.",
            "액티베이터는 글루를 슬라임 질감으로 바꾸는 역할이라 물과 목적이 다릅니다.",
            "초보자는 물을 적게 시작하고 질감을 보면서 추가하는 편이 좋았습니다.",
        ],
    ),
    post(
        "shop.malang@example.com",
        "재료 구매 전 확인할 체크리스트",
        "general",
        None,
        "shopping-lime-check",
        ["재료구매", "글루", "액티베이터", "초보자추천", "안전"],
        [
            "글루는 PVA 계열인지, 액티베이터와 반응 사례가 있는지 먼저 확인했습니다.",
            "클레이는 너무 건조한 제품이면 버터슬라임이 갈라질 수 있습니다.",
            "처음 구매라면 글루, 액티베이터, 보관 용기부터 사고 장식 재료는 나중에 추가해도 충분했습니다.",
        ],
    ),
    post(
        "glitter.malang@example.com",
        "슬라임 사진이 예쁘게 나오는 배경과 조명",
        "general",
        None,
        "photo-soft-light",
        ["사진팁", "글리터", "마블", "투명도", "일반"],
        [
            "클리어 슬라임은 흰 배경보다 살짝 푸른 배경에서 투명도가 잘 보였습니다.",
            "직사광선보다 창가의 부드러운 빛이 기포와 반짝임을 자연스럽게 보여줬어요.",
            "마블 무늬는 손으로 많이 만지기 전에 먼저 찍어야 색이 번지지 않았습니다.",
        ],
    ),
    post(
        "storage.malang@example.com",
        "아이와 함께 만들 때 안전하게 보관하는 법",
        "general",
        None,
        "safety-storage-green",
        ["안전", "보관", "보관용기", "초보자추천", "재료구매"],
        [
            "액티베이터와 향료는 이름표를 붙여 슬라임 완성품과 따로 보관했습니다.",
            "만든 날짜를 적어두면 냄새나 질감 변화를 확인하기 쉬웠습니다.",
            "어린이가 만진 뒤에는 손을 씻고, 사용하지 않을 때는 바로 밀폐 용기에 넣었습니다.",
        ],
    ),
    post(
        "question.malang@example.com",
        "RAG 검색이 잘 되게 슬라임 기록 남기는 법",
        "general",
        None,
        "notes-rag-violet",
        ["기록법", "실패해결", "레시피", "후기", "초보자추천"],
        [
            "나중에 검색하려면 재료명, 비율, 액티베이터 양, 실패 증상을 같이 적는 게 좋았습니다.",
            "예를 들어 녹음, 끈적임, 딱딱함 같은 증상 태그가 있으면 비슷한 글을 찾기 쉬웠어요.",
            "사진도 같이 남기면 AI가 게시글 맥락을 설명할 때 훨씬 자연스럽게 이어졌습니다.",
        ],
    ),
]


COMMENT_TEMPLATES = [
    (
        "failfix.malang@example.com",
        "{slime} 기준이면 액티베이터를 한 번에 넣지 말고 아주 소량씩 나눠 보는 게 안전해 보여요.",
    ),
    (
        "recipe.malang@example.com",
        "{title} 내용은 다음에 레시피 비율 비교할 때 기준으로 삼기 좋겠습니다.",
    ),
    (
        "texture.malang@example.com",
        "질감 쪽에서는 {tag}뿐 아니라 숙성 시간과 베이스 단단함도 같이 보면 더 정확할 것 같아요.",
    ),
    (
        "beginner.malang@example.com",
        "초보자 입장에서는 {slime} 설명이 단계별로 나뉘어 있어서 따라가기 쉬웠어요.",
    ),
    (
        "shop.malang@example.com",
        "재료 구매 기록에 {tag} 상태를 같이 적어두면 나중에 원인 찾기가 훨씬 편하더라고요.",
    ),
    (
        "review.malang@example.com",
        "후기 관점에서는 만든 직후와 다음 날의 {slime} 변화를 같이 남기면 더 도움이 될 것 같아요.",
    ),
    (
        "storage.malang@example.com",
        "보관 조건도 영향이 커서 온도, 용기, 뚜껑 밀폐 정도를 같이 기록해두면 좋겠습니다.",
    ),
    (
        "glitter.malang@example.com",
        "사진으로 남길 때는 {tag} 부분이 잘 보이게 밝은 배경에서 한 장 찍어두면 비교가 쉬워요.",
    ),
    (
        "scent.malang@example.com",
        "향료나 색소가 들어간 경우에는 질감 변화가 늦게 올 수 있어서 하루 뒤 확인도 추천해요.",
    ),
    (
        "question.malang@example.com",
        "이 글은 나중에 '{tag}'로 검색했을 때 바로 찾기 좋을 것 같아서 태그 조합이 마음에 들어요.",
    ),
]


PINNED_THEMES = {
    "clear-blue-basic": ((232, 252, 255), (84, 194, 255), (24, 138, 226)),
    "butter-yellow-soft": ((255, 248, 219), (255, 213, 104), (255, 159, 71)),
    "cloud-pink-snow": ((255, 241, 248), (246, 170, 218), (174, 128, 232)),
    "melt-mint-clear": ((236, 255, 246), (114, 221, 188), (52, 157, 145)),
    "sticky-green-hand": ((245, 255, 233), (157, 218, 91), (63, 148, 75)),
    "stretch-coral-break": ((255, 239, 232), (255, 151, 126), (214, 88, 99)),
    "activator-purple-review": ((247, 242, 255), (188, 158, 244), (121, 93, 211)),
    "scent-peach-storage": ((255, 244, 232), (255, 181, 137), (230, 112, 122)),
}


def hsv_color(hue: float, saturation: float, value: float) -> tuple[int, int, int]:
    red, green, blue = colorsys.hsv_to_rgb(hue, saturation, value)
    return (round(red * 255), round(green * 255), round(blue * 255))


def palette_for_theme(theme_name: str) -> tuple[tuple[int, int, int], tuple[int, int, int], tuple[int, int, int]]:
    if theme_name in PINNED_THEMES:
        return PINNED_THEMES[theme_name]

    rng = random.Random(f"palette:{theme_name}")
    hue = rng.random()
    return (
        hsv_color(hue, 0.10, 1.00),
        hsv_color((hue + 0.04) % 1, 0.45, 0.95),
        hsv_color((hue + 0.08) % 1, 0.68, 0.72),
    )


def blend(base: tuple[int, int, int], overlay: tuple[int, int, int], alpha: float) -> tuple[int, int, int]:
    return tuple(
        max(0, min(255, round(base[index] * (1 - alpha) + overlay[index] * alpha)))
        for index in range(3)
    )


def png_data_url(theme_name: str, width: int = 480, height: int = 270) -> str:
    light, mid, dark = palette_for_theme(theme_name)
    rng = random.Random(f"image:{theme_name}")
    blobs = [
        (
            rng.uniform(width * 0.12, width * 0.88),
            rng.uniform(height * 0.18, height * 0.82),
            rng.uniform(width * 0.12, width * 0.24),
            rng.uniform(0.26, 0.52),
        )
        for _ in range(9)
    ]
    highlights = [
        (
            rng.uniform(width * 0.08, width * 0.92),
            rng.uniform(height * 0.12, height * 0.78),
            rng.uniform(width * 0.024, width * 0.055),
        )
        for _ in range(12)
    ]

    rows: list[bytes] = []
    for y in range(height):
        row = bytearray()
        for x in range(width):
            nx = x / max(1, width - 1)
            ny = y / max(1, height - 1)
            wave = (math.sin(nx * 9.5 + ny * 5.0) + 1) / 2
            color = blend(light, mid, 0.24 + 0.34 * nx + 0.12 * wave)
            color = blend(color, dark, 0.10 * ny)

            for cx, cy, radius, alpha in blobs:
                distance = math.hypot((x - cx) / radius, (y - cy) / (radius * 0.68))
                if distance < 1:
                    softness = (1 - distance) ** 1.6
                    color = blend(color, mid, alpha * softness)
                if 1 <= distance < 1.04:
                    color = blend(color, dark, 0.18 * (1.04 - distance) / 0.04)

            for cx, cy, radius in highlights:
                distance = math.hypot(x - cx, y - cy)
                if distance < radius:
                    color = blend(color, (255, 255, 255), 0.72 * (1 - distance / radius))

            row.extend(color)
        rows.append(b"\x00" + bytes(row))

    def chunk(chunk_type: bytes, data: bytes) -> bytes:
        return (
            struct.pack(">I", len(data))
            + chunk_type
            + data
            + struct.pack(">I", zlib.crc32(chunk_type + data) & 0xFFFFFFFF)
        )

    raw = b"".join(rows)
    png = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(raw, level=9))
        + chunk(b"IEND", b"")
    )
    return "data:image/png;base64," + base64.b64encode(png).decode("ascii")


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
            {
                "email": user.email,
                "password": PASSWORD,
                "nickname": user.nickname,
            },
        )
        if signup_status == 201:
            print(f"created user: {user.email}")
        elif signup_status == 400:
            print(f"user exists: {user.email}")
        else:
            raise RuntimeError(f"signup failed for {user.email}: {signup_status} {signup_body}")

        login_status, login_body = request_json(
            "POST",
            "/auth/login",
            {
                "email": user.email,
                "password": PASSWORD,
            },
        )
        if login_status != 200 or login_body is None:
            raise RuntimeError(f"login failed for {user.email}: {login_status} {login_body}")
        tokens[user.email] = login_body["access_token"]

    return tokens


def fetch_posts_by_title() -> dict[str, dict[str, Any]]:
    posts_response = get_json("/posts?size=50")
    return {item["title"]: item for item in posts_response["items"]}


def ensure_posts(tokens: dict[str, str]) -> dict[str, dict[str, Any]]:
    posts_by_title = fetch_posts_by_title()

    for post_data in POSTS:
        if post_data["title"] in posts_by_title:
            existing_post = posts_by_title[post_data["title"]]
            if not existing_post.get("image_url"):
                status, body = request_json(
                    "PATCH",
                    f"/posts/{existing_post['id']}",
                    {"image_url": png_data_url(post_data["image_theme"])},
                    token=tokens[post_data["author"]],
                )
                if status != 200 or body is None:
                    raise RuntimeError(f"post image update failed: {post_data['title']} {status} {body}")
                posts_by_title[body["title"]] = body
                print(f"updated post image: {body['title']}")
            print(f"post exists: {post_data['title']}")
            continue

        author = post_data["author"]
        payload = {
            key: value
            for key, value in post_data.items()
            if key not in {"author", "image_theme"}
        }
        payload["image_url"] = png_data_url(post_data["image_theme"])
        status, body = request_json("POST", "/posts", payload, token=tokens[author])
        if status != 201 or body is None:
            raise RuntimeError(f"post create failed: {post_data['title']} {status} {body}")

        posts_by_title[body["title"]] = body
        print(f"created post: {body['title']}")

    return posts_by_title


def render_comment(template: str, post_data: dict[str, Any]) -> str:
    slime = post_data.get("slime_type") or "이 주제"
    tag = post_data["tag_names"][0]
    title = post_data["title"].removeprefix(POST_PREFIX)
    return template.format(slime=slime, tag=tag, title=title)


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
            raise RuntimeError(f"not enough available comments for post {post_item['id']}")

    return created_count


def demo_post_items(posts_by_title: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        posts_by_title[post_data["title"]]
        for post_data in POSTS
        if post_data["title"] in posts_by_title
    ]


def count_comments(posts: list[dict[str, Any]]) -> int:
    return sum(len(get_json(f"/posts/{post_item['id']}/comments")["items"]) for post_item in posts)


def main() -> None:
    print(f"seeding via API: {BASE_URL}")
    tokens = ensure_users()
    posts_by_title = ensure_posts(tokens)
    created_comments = ensure_comments(tokens, posts_by_title)
    posts_response = get_json("/posts?size=50")
    demo_posts = demo_post_items(posts_by_title)
    unique_tags = sorted({tag for post_data in POSTS for tag in post_data["tag_names"]})

    print(
        json.dumps(
            {
                "users_checked": len(USERS),
                "demo_posts_total": len(demo_posts),
                "demo_posts_with_images": sum(1 for post_item in demo_posts if post_item.get("image_url")),
                "demo_comments_total": count_comments(demo_posts),
                "comments_created_this_run": created_comments,
                "unique_demo_tags": len(unique_tags),
                "api_total_posts": posts_response["total"],
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
