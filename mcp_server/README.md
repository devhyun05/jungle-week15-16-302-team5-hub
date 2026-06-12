# MCP Server

말랑 연구소의 외부 도구 서버이다. FastAPI 본 서버와 분리해서 JSON-RPC 요청을 받고, 슬라임 재료 상품 검색 mock tool을 실행한다.

## 제공 도구

- `search_products(query)`: 사용자 요청에서 필요한 슬라임 재료를 추론하고, 재료별 상품 검색 키워드, 예상 가격대, 쇼핑 검색 링크를 반환한다.

현재는 mock 응답이며, 추후 네이버쇼핑 API, 쿠팡 API, 가격 비교 API 등으로 교체할 수 있다.

## JSON-RPC 요청 예시

```json
{
  "jsonrpc": "2.0",
  "method": "search_products",
  "params": {
    "query": "딸기향 투명 슬라임 만들 재료랑 구매처 알려줘"
  },
  "id": 1
}
```

## 응답 데이터

- `query`: 원본 요청
- `inferred_materials`: 추론된 재료 목록
- `items`: 재료명, 검색 키워드, 예상 가격대, 검색 링크
