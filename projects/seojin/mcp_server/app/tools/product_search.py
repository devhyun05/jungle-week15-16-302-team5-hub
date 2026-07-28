"""Product search MCP tool.

This is a mock tool with the same shape as a future shopping API adapter.
"""

MATERIALS = {
    "클리어 PVA 글루": ("클리어 글루 투명 슬라임 베이스", "5,000원 ~ 9,000원"),
    "슬라임 액티베이터": ("슬라임 액티베이터 붕사수", "3,000원 ~ 7,000원"),
    "딸기향 향료": ("슬라임 딸기향 향료", "4,000원 ~ 8,000원"),
    "글리터": ("슬라임 글리터 파츠", "2,000원 ~ 6,000원"),
    "클레이": ("버터슬라임 클레이", "3,000원 ~ 7,000원"),
}


def infer_materials(query: str) -> list[str]:
    materials = ["클리어 PVA 글루", "슬라임 액티베이터"]
    if "딸기" in query or "향" in query:
        materials.append("딸기향 향료")
    if "투명" in query or "반짝" in query or "글리터" in query:
        materials.append("글리터")
    if "버터" in query:
        materials.append("클레이")
    return list(dict.fromkeys(materials))


def search_products(query: str) -> dict:
    inferred = infer_materials(query)
    items = []
    for material in inferred:
        keyword, price = MATERIALS[material]
        items.append(
            {
                "material": material,
                "search_keyword": keyword,
                "estimated_price": price,
                "source": "mock-mcp-product-search",
                "link": f"https://search.shopping.naver.com/search/all?query={keyword.replace(' ', '+')}",
            }
        )
    return {"query": query, "inferred_materials": inferred, "items": items}
