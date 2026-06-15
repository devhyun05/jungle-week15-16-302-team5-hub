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
    "pastel": "https://m.media-amazon.com/images/I/71JIzxmEJFL._AC_SL1500_.jpg",
    "foam": "https://m.media-amazon.com/images/I/71AzoD64VTL._AC_SL1500_.jpg",
    "container": "https://m.media-amazon.com/images/I/71qVNMMTQfL._AC_SL1500_.jpg",
}


POSTS = [
    post(
        "beginner.malang@example.com",
        "슬라임 유튜브 보고 따라했는데 안 굳어요 ㅠㅠ",
        "failure",
        "클리어슬라임",
        IMAGES["clear"],
        ["실패해결", "초보자추천", "액티베이터", "클리어슬라임", "녹음"],
        [
            "유튜브에서 물풀+물+소다+렌즈세척액 넣으면 된대서 그대로 했는데요",
            "계속 물컹물컹하고 손에 다 묻어요 ㅠㅠ 엑티베이터 더 넣어도 별 차이가 없어요",
            "이거 포기해야 하나요... 아니면 뭐 더 넣으면 살아날까요?",
        ],
    ),
    post(
        "question.malang@example.com",
        "소다 넣으면 굳는다길래 넣었더니 이상하게 딱딱해졌어요...",
        "failure",
        "일반슬라임",
        IMAGES["container"],
        ["딱딱함", "실패해결", "베이킹소다", "액티베이터", "글리세린"],
        [
            "슬라임이 좀 질척해서 소다 넣으면 된다고 하길래 티스푼으로 반 정도 넣었거든요",
            "근데 갑자기 표면이 거칠고 안 늘어나고 고무처럼 됐어요...",
            "물 넣으면 다시 괜찮아질까요? 만질수록 더 이상해지는 느낌이에요 ㅜ",
        ],
    ),
    post(
        "texture.malang@example.com",
        "클라우드 슬라임 처음 만들어봤는데 원래 가루가 떨어지나요? ㅜㅜ",
        "failure",
        "클라우드슬라임",
        IMAGES["pastel"],
        ["클라우드슬라임", "눈가루", "실패해결", "질감", "가루날림"],
        [
            "눈가루 불려서 넣었는데 만질 때마다 하얀 가루가 우수수 떨어져요",
            "영상에서는 완전 폭신하게 늘어나던데 제 건 축축한데 또 가루는 떨어지는 이상한 상태...",
            "눈가루를 너무 많이 넣은 걸까요? 클라우드 원래 이런가요?",
        ],
    ),
    post(
        "recipe.malang@example.com",
        "완전 퐁신 말랑 슬라임 레시피 공유!!",
        "recipe",
        "버터슬라임",
        IMAGES["butter"],
        ["레시피", "버터슬라임", "아이클레이", "초보자추천", "부드러움"],
        [
            "아이클레이랑 물풀 1:2로 섞고 물은 아주 쪼금만 넣었어요",
            "엑티는 한 번에 넣지 말고 진짜 조금씩 넣어가며 뭉치면 됩니다",
            "손에 덜 붙을 때까지 치대니까 완전 느좋... 퐁신말랑 성공 ㅎㅎ",
        ],
    ),
    post(
        "review.malang@example.com",
        "띵이슬라임 치즈밥 구매했어요 ㅎㅎ 바삭 소리 대박",
        "review",
        "폼볼슬라임",
        IMAGES["foam"],
        ["후기", "폼볼", "소리", "구매후기", "추천"],
        [
            "치즈밥 이름 귀여워서 샀는데 소리 진짜 미쳤어요 ㅋㅋ",
            "폼볼이 꽉 차 있어서 꾹꾹 누르면 바삭바삭 소리 엄청 잘 납니다",
            "손에는 거의 안 묻고 향도 과하지 않아서 저는 강추 드립니당",
        ],
    ),
    post(
        "glitter.malang@example.com",
        "클리어 슬라임 기포 너무 많아서 망한 줄 알았는데",
        "failure",
        "클리어슬라임",
        IMAGES["clear"],
        ["클리어슬라임", "기포", "숙성", "투명도", "실패해결"],
        [
            "처음 만들고 보니까 완전 하얗게 뿌얘서 망한 줄 알았어요",
            "근데 뚜껑 닫고 하루 놔두니까 생각보다 많이 맑아졌습니다",
            "혹시 기포 때문에 실패한 줄 아는 분들 바로 버리지 말고 좀 기다려보세요!!",
        ],
    ),
    post(
        "failfix.malang@example.com",
        "엑티 한 방울씩 넣으라는데 성격 급해서 망함요",
        "failure",
        "일반슬라임",
        IMAGES["container"],
        ["액티베이터", "딱딱함", "실패해결", "초보자추천", "글리세린"],
        [
            "처음엔 너무 질어서 엑티를 콸콸 넣었더니 바로 떡져버렸어요",
            "겉은 미끄러운데 속은 딱딱하고 늘리면 뚝 끊깁니다 ㅠ",
            "이거 글리세린 넣으면 돌아오나요? 아니면 그냥 새로 만드는 게 빠른가요?",
        ],
    ),
    post(
        "recipe.malang@example.com",
        "젤리슬라임 탱글하게 만든 거 성공했어요!",
        "recipe",
        "젤리슬라임",
        IMAGES["clear"],
        ["젤리슬라임", "레시피", "탱글함", "액티베이터", "성공"],
        [
            "물풀 100g에 물 20g 넣고 완전 섞은 다음 엑티 조금씩 넣었어요",
            "처음에 손에 붙는다고 바로 더 넣지 말고 5분만 기다려보세요",
            "저도 기다렸다가 만지니까 갑자기 탱글하게 잡혀서 신기했음 ㅎㅎ",
        ],
    ),
    post(
        "scent.malang@example.com",
        "향료 많이 넣었다가 슬라임 녹인 사람 나야나...",
        "failure",
        "버터슬라임",
        IMAGES["butter"],
        ["향료", "녹음", "실패해결", "버터슬라임", "냄새"],
        [
            "복숭아 향 세게 나면 좋을 것 같아서 6방울 넣었거든요",
            "처음엔 향 좋아서 만족했는데 다음 날 완전 질척해졌어요...",
            "향료 넣은 슬라임은 엑티로 다시 잡아도 될까요? 냄새는 좋은데 질감이 망했어요",
        ],
    ),
    post(
        "storage.malang@example.com",
        "슬라임 뚜껑 대충 닫았다가 가장자리 말라버림 ㅠ",
        "failure",
        "일반슬라임",
        IMAGES["container"],
        ["보관", "보관용기", "딱딱함", "글리세린", "실패해결"],
        [
            "어제 만들고 피곤해서 뚜껑 대충 닫았는데 오늘 보니까 가장자리가 말랐어요",
            "가운데는 괜찮은데 테두리만 딱딱하고 갈라지는 느낌...",
            "이런 건 글리세린 바르면 다시 돌아오나요? 아까워서 못 버리겠어요",
        ],
    ),
    post(
        "shop.malang@example.com",
        "다이소 물풀로 만든 슬라임 후기! 연습용으론 괜춘",
        "review",
        "클리어슬라임",
        IMAGES["clear"],
        ["후기", "글루", "재료구매", "클리어슬라임", "초보자추천"],
        [
            "전용 글루 비싸서 다이소 물풀로 먼저 해봤는데 생각보다 잘 뭉쳐요",
            "근데 투명도는 막 엄청 예쁜 클리어 느낌까진 아니고 살짝 탁합니다",
            "처음 연습용으론 괜춘! 선물용이면 전용 글루 쓰는 게 나을 듯요",
        ],
    ),
    post(
        "beginner.malang@example.com",
        "첫 슬라임인데 손에 다 붙어요 살려주세요 ㅜㅜ",
        "failure",
        "일반슬라임",
        IMAGES["butter"],
        ["끈적임", "초보자추천", "실패해결", "액티베이터", "글루"],
        [
            "손에 안 붙을 때까지 치대라길래 계속 만졌는데 손에 더 붙는 느낌이에요",
            "엑티 더 넣으면 딱딱해질까 봐 무서워서 멈췄습니다",
            "이 정도면 조금 더 넣어도 되는 건가요? 기준을 모르겠어요 ㅠㅠ",
        ],
    ),
    post(
        "glitter.malang@example.com",
        "글리터 많이 넣으면 예쁠 줄 알았는데 탁해짐...",
        "failure",
        "클리어슬라임",
        IMAGES["pastel"],
        ["글리터", "클리어슬라임", "투명도", "실패해결", "사진팁"],
        [
            "반짝이 많이 넣으면 더 예쁠 줄 알고 왕창 넣었거든요",
            "근데 클리어가 갑자기 탁해지고 뭔가 지저분해 보여요...",
            "글리터는 진짜 조금만 넣는 게 맞나요? 이미 넣은 건 답 없겠죠 ㅎ",
        ],
    ),
    post(
        "texture.malang@example.com",
        "폼볼 왜 자꾸 탈출하나요 ㅋㅋㅋ",
        "failure",
        "폼볼슬라임",
        IMAGES["foam"],
        ["폼볼", "폼볼슬라임", "실패해결", "질감", "소리"],
        [
            "폼볼 넣으면 바삭 소리 난대서 넣었는데 만질 때마다 하나씩 튀어나와요",
            "책상에 폼볼 굴러다니는 중... 이거 베이스가 너무 묽은 걸까요?",
            "소리는 좋은데 손에 계속 붙고 알갱이 빠져서 난리입니다 ㅠ",
        ],
    ),
    post(
        "question.malang@example.com",
        "클리어 슬라임 숙성 며칠 해야 투명해져요?",
        "general",
        "클리어슬라임",
        IMAGES["clear"],
        ["클리어슬라임", "숙성", "기포", "투명도", "초보자추천"],
        [
            "오늘 만들었는데 아직 완전 뿌얘요",
            "다들 숙성하면 투명해진다고 하는데 보통 며칠 기다리나요?",
            "성격 급해서 자꾸 열어보고 싶은데 그러면 더 안 좋아질까요 ㅋㅋ",
        ],
    ),
    post(
        "recipe.malang@example.com",
        "치즈처럼 늘어나는 버터슬라임 만들었어요",
        "recipe",
        "버터슬라임",
        IMAGES["butter"],
        ["버터슬라임", "레시피", "아이클레이", "늘어남", "부드러움"],
        [
            "물풀 베이스를 살짝 말랑하게 만든 다음 아이클레이를 조금씩 섞었어요",
            "처음부터 클레이 많이 넣으면 뚝뚝 끊겨서 진짜 조금씩 넣는 게 포인트",
            "완성하고 늘려보니까 치즈처럼 쭉 늘어나서 기분 좋았음 ㅎㅎ",
        ],
    ),
    post(
        "review.malang@example.com",
        "복숭아향 슬라임 샀는데 향이 생각보다 세요",
        "review",
        "버터슬라임",
        IMAGES["butter"],
        ["향료", "후기", "냄새", "버터슬라임", "구매후기"],
        [
            "후기 좋아서 복숭아향 버터슬라임 샀는데 열자마자 향이 확 나요",
            "저는 좋은데 향 센 거 싫어하는 사람은 좀 부담일 수도?",
            "질감은 부드럽고 손에 안 묻어서 만족합니다. 향만 호불호 있을 듯해요",
        ],
    ),
    post(
        "failfix.malang@example.com",
        "물 많이 넣으면 양 늘어난다길래 넣었는데 녹았어요",
        "failure",
        "일반슬라임",
        IMAGES["container"],
        ["녹음", "실패해결", "물", "액티베이터", "초보자추천"],
        [
            "슬라임 양 늘리고 싶어서 물을 좀 많이 넣었는데요",
            "처음엔 괜찮은 줄 알았는데 점점 풀리더니 손에 다 묻어요...",
            "양 늘리려다가 망한 듯 ㅠㅠ 이런 경우 엑티만 더 넣으면 되나요?",
        ],
    ),
    post(
        "shop.malang@example.com",
        "액티베이터 렌즈세척액 vs 붕사 써본 느낌",
        "review",
        None,
        IMAGES["container"],
        ["액티베이터", "후기", "재료구매", "붕사", "렌즈세척액"],
        [
            "렌즈세척액은 천천히 굳어서 초보자가 하기 편한데 좀 오래 걸려요",
            "붕사는 반응 빨라서 좋은데 조금만 많이 넣어도 바로 딱딱해짐...",
            "저는 연습할 땐 렌즈세척액, 복구할 땐 붕사 희석액 쓸 것 같아요",
        ],
    ),
    post(
        "storage.malang@example.com",
        "보관용기 바꿨더니 슬라임 덜 마르는 듯",
        "review",
        None,
        IMAGES["container"],
        ["보관", "보관용기", "후기", "딱딱함", "추천"],
        [
            "그냥 반찬통에 넣다가 실리콘 패킹 있는 용기로 바꿨어요",
            "확실히 다음 날 가장자리 마르는 게 덜합니다",
            "슬라임 자주 만드는 분들은 용기 좋은 거 쓰는 게 은근 중요하네요",
        ],
    ),
    post(
        "scent.malang@example.com",
        "향료는 진짜 한두 방울만... 메모...",
        "general",
        None,
        IMAGES["butter"],
        ["향료", "보관", "실패해결", "냄새", "초보자추천"],
        [
            "향 약할까 봐 많이 넣으면 질감 바로 이상해지는 거 이제 알았습니다",
            "100g에 한두 방울도 충분히 향 나요 진짜",
            "저처럼 욕심내지 마세요... 향은 좋은데 슬라임이 녹으면 슬픕니다",
        ],
    ),
    post(
        "glitter.malang@example.com",
        "마블 슬라임 사진 찍기 전에 다 섞여버림 ㅠ",
        "failure",
        "일반슬라임",
        IMAGES["pastel"],
        ["마블", "색소", "사진팁", "실패해결", "글리터"],
        [
            "파랑 보라 살짝 넣고 마블 만들려고 했는데 사진 찍기도 전에 그냥 보라색 됐어요",
            "제가 너무 많이 만진 걸까요? 아니면 베이스가 묽어서 그런가요?",
            "예쁜 마블 사진 찍는 분들 진심 존경합니다...",
        ],
    ),
    post(
        "review.malang@example.com",
        "파츠 많은 슬라임 예쁜데 만질 땐 좀 아파요 ㅋㅋ",
        "review",
        "클리어슬라임",
        IMAGES["pastel"],
        ["파츠", "글리터", "후기", "클리어슬라임", "사진팁"],
        [
            "사진 보고 반해서 파츠 잔뜩 들어간 클리어 샀는데 비주얼은 진짜 예뻐요",
            "근데 큰 파츠가 손에 걸려서 오래 만지면 살짝 아픕니다 ㅋㅋ",
            "사진용으로는 최고, 계속 주물럭용으로는 작은 글리터가 더 나은 듯해요",
        ],
    ),
    post(
        "question.malang@example.com",
        "슬라임 실패한 거 기록할 때 뭐 적어두세요?",
        "general",
        None,
        IMAGES["container"],
        ["기록법", "실패해결", "레시피", "후기", "초보자추천"],
        [
            "맨날 실패하고 나서 내가 뭘 얼마나 넣었는지 기억이 안 나요 ㅠ",
            "다들 레시피 기록할 때 글루 몇 g 이런 거 다 적으시나요?",
            "다음엔 사진이랑 같이 남겨보려고 하는데 어떤 항목 적으면 좋을지 궁금해요",
        ],
    ),
    post(
        "beginner.malang@example.com",
        "엑티랑 물 차이를 이제 알았어요 ㅋㅋㅋ",
        "general",
        None,
        IMAGES["container"],
        ["초보자추천", "액티베이터", "물", "녹음", "일반"],
        [
            "저는 물 넣으면 슬라임이 굳는 줄 알았어요... 진짜 초보 티남",
            "물은 부드럽게 하는 거고 엑티가 굳히는 거더라고요",
            "혹시 저 같은 분 있으면 물 많이 넣지 마세요 녹습니다 ㅠ",
        ],
    ),
    post(
        "shop.malang@example.com",
        "슬라임 재료 처음 살 때 이거만 사도 되나요?",
        "general",
        None,
        IMAGES["container"],
        ["재료구매", "글루", "액티베이터", "보관용기", "초보자추천"],
        [
            "물풀, 렌즈세척액, 베이킹소다, 보관용기 이렇게만 사도 시작 가능할까요?",
            "파츠랑 글리터까지 사려니까 장바구니 금액이 갑자기 커져서요 ㅋㅋ",
            "초보는 일단 기본 재료만 사고 성공하면 꾸미는 거 사는 게 맞겠죠?",
        ],
    ),
    post(
        "texture.malang@example.com",
        "눈가루 넣은 슬라임 촉감은 좋은데 청소가...",
        "review",
        "클라우드슬라임",
        IMAGES["pastel"],
        ["클라우드슬라임", "눈가루", "후기", "질감", "가루날림"],
        [
            "클라우드 촉감은 진짜 폭신하고 좋은데 만들고 나면 책상이 난리나요",
            "눈가루 물 조절 잘못하면 가루 날리고 축축하고 둘 다 옵니다 ㅋㅋ",
            "그래도 촉감이 좋아서 또 만들 것 같긴 해요... 손이 많이 갈 뿐",
        ],
    ),
    post(
        "recipe.malang@example.com",
        "초보도 가능한 기본 슬라임 레시피 적어둘게요",
        "recipe",
        "일반슬라임",
        IMAGES["container"],
        ["레시피", "초보자추천", "글루", "액티베이터", "성공"],
        [
            "물풀 100g, 물 10g, 소다 아주 조금 넣고 먼저 섞어요",
            "그 다음 렌즈세척액을 조금씩 넣으면서 뭉칠 때까지만 섞으면 됩니다",
            "손에 너무 묻으면 5분 쉬었다가 다시 만져보세요. 바로 엑티 많이 넣으면 딱딱해져요",
        ],
    ),
    post(
        "review.malang@example.com",
        "버터슬라임 선물용으로 샀는데 반응 좋았어요",
        "review",
        "버터슬라임",
        IMAGES["butter"],
        ["버터슬라임", "후기", "구매후기", "선물", "추천"],
        [
            "조카 선물로 버터슬라임 샀는데 포장 열자마자 좋아하더라고요",
            "색도 파스텔이라 예쁘고 손에 많이 안 묻어서 부모님 반응도 괜찮았어요 ㅎㅎ",
            "향 약한 걸로 고르길 잘한 듯! 다음엔 폼볼 들어간 것도 사보려고요",
        ],
    ),
    post(
        "storage.malang@example.com",
        "만든 날짜 적어두니까 은근 편하네요",
        "general",
        None,
        IMAGES["container"],
        ["보관", "기록법", "보관용기", "후기", "초보자추천"],
        [
            "용기 뚜껑에 만든 날짜랑 재료 간단히 적어두기 시작했어요",
            "언제부터 냄새가 변했는지, 언제 딱딱해졌는지 보이니까 좋네요",
            "여러 개 만드는 분들은 라벨 붙이는 거 추천합니다. 생각보다 편함!",
        ],
    ),
]


COMMENTS_BY_TITLE = {
    "슬라임 유튜브 보고 따라했는데 안 굳어요 ㅠㅠ": [
        ("failfix.malang@example.com", "물 많이 들어갔으면 엑티를 조금씩 더 넣어야 해요. 한 번에 많이 넣으면 바로 떡져요 ㅠ"),
        ("recipe.malang@example.com", "렌즈세척액 제품마다 반응 차이 커요! 일단 0.5ml씩 넣고 5분 기다려보세요."),
        ("review.malang@example.com", "저도 첫날 똑같이 망했는데 조금 쉬게 두니까 덜 묻었어요. 바로 포기하지 마세요!"),
    ],
    "소다 넣으면 굳는다길래 넣었더니 이상하게 딱딱해졌어요...": [
        ("failfix.malang@example.com", "소다는 많이 넣으면 표면만 이상해질 때 있어요. 글리세린 한 방울씩 넣고 쉬게 둬보세요."),
        ("texture.malang@example.com", "속까지 고무처럼 됐으면 바로 물 붓지 말고 조금씩 풀어야 해요. 물 많이 넣으면 또 녹아요."),
        ("storage.malang@example.com", "밀폐용기에 넣고 20분 정도 둔 다음 다시 만져보는 것도 도움 됐어요."),
    ],
    "클라우드 슬라임 처음 만들어봤는데 원래 가루가 떨어지나요? ㅜㅜ": [
        ("recipe.malang@example.com", "눈가루 물기를 덜 짰거나 베이스가 묽으면 가루가 떨어져요. 베이스를 좀 더 잡고 섞어보세요."),
        ("failfix.malang@example.com", "이미 넣은 상태면 눈가루 추가하지 말고 잠깐 말리듯이 두는 게 나을 것 같아요."),
        ("review.malang@example.com", "클라우드는 원래 조금 번거롭긴 한데 우수수 떨어지면 물 조절 문제일 가능성이 커요 ㅠ"),
    ],
    "완전 퐁신 말랑 슬라임 레시피 공유!!": [
        ("beginner.malang@example.com", "1:2 비율 완전 따라 하기 좋네요 ㅎㅎ 물 조금만 넣는 게 포인트인가 봐요."),
        ("texture.malang@example.com", "클레이 한 번에 많이 안 넣는 거 중요해요. 그래야 퐁신한데 안 끊기더라고요."),
        ("scent.malang@example.com", "여기에 향료 한 방울만 넣으면 진짜 느좋일 듯요... 많이 넣으면 녹으니까 한 방울만!"),
    ],
    "띵이슬라임 치즈밥 구매했어요 ㅎㅎ 바삭 소리 대박": [
        ("texture.malang@example.com", "폼볼 꽉 찬 타입이면 소리 진짜 좋죠 ㅋㅋ 빠짐은 괜찮나요?"),
        ("shop.malang@example.com", "치즈밥 궁금했는데 후기 감사합니다. 손에 안 묻는 거면 장바구니 넣어야겠어요."),
        ("glitter.malang@example.com", "이런 바삭 소리 슬라임은 영상 찍으면 만족감 장난 아니더라고요 ㅎㅎ"),
    ],
    "클리어 슬라임 기포 너무 많아서 망한 줄 알았는데": [
        ("beginner.malang@example.com", "헐 저였으면 바로 실패인 줄 알았을 듯요. 숙성 기다려봐야겠네요."),
        ("storage.malang@example.com", "뚜껑 잘 닫고 기다리는 게 진짜 중요해요. 자꾸 열면 먼지도 들어가더라고요."),
        ("review.malang@example.com", "클리어는 기다리는 시간이 반인 듯... 맑아지면 뿌듯해요 ㅋㅋ"),
    ],
    "엑티 한 방울씩 넣으라는데 성격 급해서 망함요": [
        ("recipe.malang@example.com", "저도 예전에 콸콸 넣었다가 고무 만들었어요 ㅠ 글리세린 조금씩 넣어보세요."),
        ("texture.malang@example.com", "겉만 미끄럽고 속 딱딱하면 로션보다 글리세린이 낫더라고요. 진짜 소량씩이요."),
        ("question.malang@example.com", "새로 만드는 게 빠른 경우도 있지만 일단 한 방울씩 복구해보면 감 잡히긴 해요."),
    ],
    "젤리슬라임 탱글하게 만든 거 성공했어요!": [
        ("beginner.malang@example.com", "5분 기다리는 거 몰랐어요. 저는 바로 만져서 손에 다 묻었나 봐요 ㅋㅋ"),
        ("failfix.malang@example.com", "손에 붙는다고 바로 엑티 더 넣으면 딱딱해지는 거 완전 맞아요."),
        ("review.malang@example.com", "탱글한 젤리 느낌 좋아하는데 이 비율로 한 번 해볼게요!"),
    ],
    "향료 많이 넣었다가 슬라임 녹인 사람 나야나...": [
        ("question.malang@example.com", "6방울이면 진짜 많이 들어갔네요 ㅠ 향료는 한두 방울도 충분하더라고요."),
        ("failfix.malang@example.com", "엑티를 바로 많이 넣지 말고 아주 조금씩 넣어보세요. 버터면 클레이 소량도 도움 돼요."),
        ("storage.malang@example.com", "향은 하루 지나면 좀 빠지니까 오늘 질감이랑 내일 질감 비교해보세요."),
    ],
    "슬라임 뚜껑 대충 닫았다가 가장자리 말라버림 ㅠ": [
        ("failfix.malang@example.com", "가장자리만 마른 거면 글리세린 살짝 바르고 밀폐해두면 꽤 돌아와요."),
        ("beginner.malang@example.com", "저도 뚜껑 대충 닫고 딱딱해졌어요 ㅠ 용기 진짜 중요하더라고요."),
        ("texture.malang@example.com", "마른 부분을 억지로 뜯지 말고 천천히 섞어야 덩어리 덜 남아요."),
    ],
    "다이소 물풀로 만든 슬라임 후기! 연습용으론 괜춘": [
        ("review.malang@example.com", "연습용 괜춘이라는 말 딱 맞아요. 투명도 욕심내면 전용 글루가 낫고요."),
        ("beginner.malang@example.com", "처음부터 비싼 글루 사기 부담됐는데 다이소로 연습해봐야겠어요."),
        ("recipe.malang@example.com", "물풀마다 점도 달라서 엑티 양은 조금씩 다시 맞추면 좋아요."),
    ],
    "첫 슬라임인데 손에 다 붙어요 살려주세요 ㅜㅜ": [
        ("failfix.malang@example.com", "덩어리는 잡혔는데 실처럼 붙으면 엑티 아주 조금 더 넣어도 괜찮아요."),
        ("recipe.malang@example.com", "넣고 바로 판단하지 말고 조금 섞은 뒤 3~5분 기다려보세요. 갑자기 잡히기도 해요."),
        ("review.malang@example.com", "첫 슬라임이면 그 상태 진짜 당황스럽죠 ㅋㅋ 너무 많이 넣지만 않으면 살릴 수 있어요."),
    ],
    "글리터 많이 넣으면 예쁠 줄 알았는데 탁해짐...": [
        ("failfix.malang@example.com", "클리어에는 글리터 진짜 조금만 넣어야 해요. 많이 넣으면 바로 탁해져요 ㅠ"),
        ("recipe.malang@example.com", "이미 넣은 건 빼기 어렵고, 다음엔 색소 없이 고운 글리터만 소량 추천해요."),
        ("question.malang@example.com", "저도 반짝이면 다 예쁠 줄 알았는데 투명도랑은 또 다른 문제더라고요..."),
    ],
    "폼볼 왜 자꾸 탈출하나요 ㅋㅋㅋ": [
        ("failfix.malang@example.com", "베이스가 묽으면 폼볼이 계속 빠져요. 먼저 손에 덜 묻는 정도까지 잡아보세요."),
        ("failfix.malang@example.com", "폼볼 더 넣기 전에 엑티 소량으로 베이스부터 안정시키는 게 좋을 것 같아요."),
        ("glitter.malang@example.com", "책상에 폼볼 굴러다니는 거 너무 공감 ㅋㅋ 하루 숙성하면 좀 덜 빠졌어요."),
    ],
    "클리어 슬라임 숙성 며칠 해야 투명해져요?": [
        ("storage.malang@example.com", "보통 이틀 정도는 기다리는 편이에요. 중간에 자꾸 열면 먼지 들어가요 ㅋㅋ"),
        ("glitter.malang@example.com", "잔기포 많으면 하루로는 부족할 때 있어요. 2~3일 두면 훨씬 맑아져요."),
        ("beginner.malang@example.com", "저도 성격 급해서 열어봤는데 그냥 기다리는 게 답이었어요..."),
    ],
    "치즈처럼 늘어나는 버터슬라임 만들었어요": [
        ("texture.malang@example.com", "클레이 조금씩 넣는 거 완전 중요해요. 많이 넣으면 바로 뚝뚝 끊기더라고요."),
        ("scent.malang@example.com", "여기에 향료 넣으면 진짜 치즈 디저트 느낌 날 듯요 ㅎㅎ 한 방울만 추천!"),
        ("review.malang@example.com", "치즈처럼 늘어난다는 표현 보니까 질감 딱 상상돼요. 레시피 저장합니다."),
    ],
    "복숭아향 슬라임 샀는데 향이 생각보다 세요": [
        ("scent.malang@example.com", "복숭아향은 제품마다 진짜 세더라고요. 향 약한 거 좋아하면 호불호 있을 듯요."),
        ("storage.malang@example.com", "향 센 슬라임은 뚜껑 열어두면 질감 변할 수 있어서 짧게 환기만 하는 게 좋아요."),
        ("shop.malang@example.com", "손에 안 묻는다는 후기 좋네요. 향만 괜찮으면 선물용으로도 괜찮겠어요."),
    ],
    "물 많이 넣으면 양 늘어난다길래 넣었는데 녹았어요": [
        ("recipe.malang@example.com", "물 많이 넣으면 엑티로 다시 잡아야 하는데 시간이 좀 걸려요. 소량씩 넣어보세요."),
        ("storage.malang@example.com", "양 늘리려다 녹는 경우 많아요 ㅠ 바로 버리지 말고 조금씩 굳혀보세요."),
        ("beginner.malang@example.com", "저도 물 넣으면 좋은 줄 알았는데 아니었군요... 조심해야겠어요."),
    ],
    "액티베이터 렌즈세척액 vs 붕사 써본 느낌": [
        ("beginner.malang@example.com", "초보라 렌즈세척액부터 써봐야겠어요. 빨리 굳으면 더 무서울 것 같아요 ㅋㅋ"),
        ("failfix.malang@example.com", "복구할 땐 붕사 희석액이 빠르긴 한데 진짜 조심해야 해요. 바로 딱딱해짐."),
        ("review.malang@example.com", "재료 살 때 이 비교 도움 되네요. 둘 다 사두고 상황별로 써야겠어요."),
    ],
    "보관용기 바꿨더니 슬라임 덜 마르는 듯": [
        ("beginner.malang@example.com", "패킹 있는 용기 쓰면 확실히 달라요. 특히 클리어는 먼지도 덜 들어가서 좋아요."),
        ("scent.malang@example.com", "향 있는 슬라임도 용기 바꾸면 향 유지가 좀 낫더라고요."),
        ("question.malang@example.com", "반찬통 아무거나 쓰고 있었는데 용기 바꿔봐야겠네요 ㅎㅎ"),
    ],
    "향료는 진짜 한두 방울만... 메모...": [
        ("review.malang@example.com", "맞아요 진짜 메모해야 함... 향 욕심내면 질감 바로 갑니다 ㅠ"),
        ("failfix.malang@example.com", "향료 때문에 녹은 경우는 엑티보다 클레이 조금 섞는 게 더 안정적일 때도 있어요."),
        ("review.malang@example.com", "향이 약할까 봐 많이 넣는 마음은 이해되는데 슬라임은 질감이 먼저더라고요."),
    ],
    "마블 슬라임 사진 찍기 전에 다 섞여버림 ㅠ": [
        ("recipe.malang@example.com", "색소 넣고 두세 번만 접은 다음 바로 찍어야 해요. 만지면 바로 섞여요 ㅋㅋ"),
        ("texture.malang@example.com", "베이스가 묽으면 더 빨리 퍼져요. 살짝 단단한 상태에서 색소 넣어보세요."),
        ("review.malang@example.com", "마블은 진짜 촬영 타이밍 싸움인 듯요. 예쁜 순간이 너무 짧음 ㅠ"),
    ],
    "파츠 많은 슬라임 예쁜데 만질 땐 좀 아파요 ㅋㅋ": [
        ("glitter.malang@example.com", "큰 파츠 예쁜데 손에 걸리는 거 인정이요 ㅋㅋ 사진용으로는 최고죠."),
        ("texture.malang@example.com", "계속 만질 용도면 작은 글리터나 폼볼이 훨씬 편하더라고요."),
        ("shop.malang@example.com", "구매할 때 상세 사진만 보고 샀다가 촉감 생각 못 하는 경우 많아요. 후기 도움 됩니다."),
    ],
    "슬라임 실패한 거 기록할 때 뭐 적어두세요?": [
        ("recipe.malang@example.com", "글루 g, 물 g, 엑티 몇 ml 넣었는지만 적어도 다음에 훨씬 편해요."),
        ("failfix.malang@example.com", "실패 증상도 같이 적어두세요. 녹음/끈적임/딱딱함 이런 식으로요."),
        ("storage.malang@example.com", "사진이랑 만든 날짜도 추천해요. 며칠 뒤 질감 변할 때 원인 찾기 좋아요."),
    ],
    "엑티랑 물 차이를 이제 알았어요 ㅋㅋㅋ": [
        ("question.malang@example.com", "저도 처음엔 물 넣으면 뭔가 해결되는 줄 알았어요 ㅋㅋ 초보 다 비슷한가 봐요."),
        ("recipe.malang@example.com", "물은 부드럽게, 엑티는 굳게! 이거만 알아도 실패 확 줄어요."),
        ("failfix.malang@example.com", "물 많이 넣고 녹았다는 글 진짜 많아요. 이 글 초보분들한테 좋네요."),
    ],
    "슬라임 재료 처음 살 때 이거만 사도 되나요?": [
        ("review.malang@example.com", "처음엔 그 정도면 충분해요. 파츠는 베이스 성공하고 사도 안 늦습니다 ㅎㅎ"),
        ("recipe.malang@example.com", "기본 베이스만 먼저 성공해보는 게 좋아요. 꾸미는 재료 넣으면 원인 찾기 어려워요."),
        ("storage.malang@example.com", "보관용기는 꼭 같이 사세요! 만들고 담을 데 없으면 바로 마릅니다."),
    ],
    "눈가루 넣은 슬라임 촉감은 좋은데 청소가...": [
        ("failfix.malang@example.com", "클라우드는 촉감 좋은 대신 진짜 손이 많이 가요 ㅋㅋ 물 조절이 반이에요."),
        ("beginner.malang@example.com", "책상 난리난다는 말 보고 마음의 준비하고 만들어야겠네요..."),
        ("review.malang@example.com", "그래도 폭신한 촉감 때문에 또 만든다는 거 너무 이해돼요."),
    ],
    "초보도 가능한 기본 슬라임 레시피 적어둘게요": [
        ("beginner.malang@example.com", "이렇게 간단히 적어주니까 따라 하기 좋아요. 엑티 많이 넣지 않는 게 핵심이군요."),
        ("failfix.malang@example.com", "5분 쉬었다가 만져보라는 말 중요해요. 바로 더 넣다가 망하는 경우 많습니다."),
        ("question.malang@example.com", "물풀 100g 기준이라 저장해둘게요! 다음에 이대로 해봐야겠어요."),
    ],
    "버터슬라임 선물용으로 샀는데 반응 좋았어요": [
        ("shop.malang@example.com", "선물용은 손에 안 묻는 게 진짜 중요하죠. 부모님 반응 괜찮았다니 좋네요."),
        ("scent.malang@example.com", "향 약한 걸로 고른 거 센스 있어요. 아이들 선물은 향 강하면 호불호 크더라고요."),
        ("beginner.malang@example.com", "폼볼 들어간 것도 선물 반응 좋을 것 같아요. 소리 나는 거 좋아하더라고요 ㅎㅎ"),
    ],
    "만든 날짜 적어두니까 은근 편하네요": [
        ("question.malang@example.com", "라벨 붙이면 진짜 편해요. 오래된 거랑 새 거 헷갈리지 않아서 좋습니다."),
        ("failfix.malang@example.com", "실패 원인 찾을 때 날짜랑 재료 기록이 생각보다 도움 많이 돼요."),
        ("beginner.malang@example.com", "저도 여러 개 만들면 뭐가 뭔지 모르겠더라고요 ㅋㅋ 라벨 사야겠어요."),
    ],
}


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


def should_delete_seed_post(post_item: dict[str, Any], desired_titles: set[str], seed_emails: set[str]) -> bool:
    if post_item["title"].startswith(BAD_TITLE_PREFIX):
        return True
    return post_item["author"]["email"] in seed_emails and post_item["title"] not in desired_titles


def cleanup_old_seed_posts(tokens: dict[str, str]) -> int:
    deleted_count = 0
    desired_titles = {post_data["title"] for post_data in POSTS}
    seed_emails = {user.email for user in USERS}

    for post_item in fetch_posts():
        if not should_delete_seed_post(post_item, desired_titles, seed_emails):
            continue

        email = post_item["author"]["email"]
        status, body = request_json("DELETE", f"/posts/{post_item['id']}", token=tokens[email])
        if status != 204:
            raise RuntimeError(f"post delete failed: {post_item['id']} {status} {body}")
        deleted_count += 1
        print(f"deleted old seed post: {post_item['title']}")

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


def desired_comments_for(post_data: dict[str, Any]) -> list[tuple[str, str]]:
    comments = COMMENTS_BY_TITLE[post_data["title"]]
    if len(comments) != TARGET_COMMENTS_PER_POST:
        raise RuntimeError(f"expected {TARGET_COMMENTS_PER_POST} comments for {post_data['title']}")
    if any(email == post_data["author"] for email, _content in comments):
        raise RuntimeError(f"post author cannot comment on own seeded post: {post_data['title']}")
    return comments


def ensure_comments(tokens: dict[str, str], posts_by_title: dict[str, dict[str, Any]]) -> tuple[int, int]:
    created_count = 0
    deleted_count = 0

    for post_data in POSTS:
        post_item = posts_by_title[post_data["title"]]
        desired_comments = desired_comments_for(post_data)
        desired_contents = {content for _email, content in desired_comments}
        comments_response = get_json(f"/posts/{post_item['id']}/comments")

        for item in comments_response["items"]:
            if item["content"] in desired_contents:
                continue
            email = item["author"]["email"]
            if email not in tokens:
                continue

            status, body = request_json("DELETE", f"/comments/{item['id']}", token=tokens[email])
            if status != 204:
                raise RuntimeError(f"comment delete failed for comment {item['id']}: {status} {body}")
            deleted_count += 1

        comments_response = get_json(f"/posts/{post_item['id']}/comments")
        existing_contents = {item["content"] for item in comments_response["items"]}

        for email, content in desired_comments:
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

        if sum(1 for content in desired_contents if content in existing_contents) != TARGET_COMMENTS_PER_POST:
            raise RuntimeError(f"not enough comments for post {post_item['id']}")

    return created_count, deleted_count


def seeded_post_items(posts_by_title: dict[str, dict[str, Any]]) -> list[dict[str, Any]]:
    return [posts_by_title[post_data["title"]] for post_data in POSTS if post_data["title"] in posts_by_title]


def count_comments(posts: list[dict[str, Any]]) -> int:
    return sum(len(get_json(f"/posts/{post_item['id']}/comments")["items"]) for post_item in posts)


def main() -> None:
    print(f"seeding via API: {BASE_URL}")
    tokens = ensure_users()
    deleted_old_posts = cleanup_old_seed_posts(tokens)
    posts_by_title = ensure_posts(tokens)
    created_comments, deleted_comments = ensure_comments(tokens, posts_by_title)
    seeded_posts = seeded_post_items(posts_by_title)
    unique_tags = sorted({tag for post_data in POSTS for tag in post_data["tag_names"]})
    posts_response = get_json("/posts?size=50")

    print(
        json.dumps(
            {
                "users_checked": len(USERS),
                "deleted_old_posts": deleted_old_posts,
                "seed_posts_total": len(seeded_posts),
                "seed_posts_with_images": sum(1 for post_item in seeded_posts if post_item.get("image_url")),
                "seed_comments_total": count_comments(seeded_posts),
                "comments_created_this_run": created_comments,
                "comments_deleted_this_run": deleted_comments,
                "unique_seed_tags": len(unique_tags),
                "api_total_posts": posts_response["total"],
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
