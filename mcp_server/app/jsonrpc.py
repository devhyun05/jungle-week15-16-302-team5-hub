"""JSON-RPC helpers.

TODO:
- JSON-RPC 2.0 요청의 method, params, id를 검증한다.
- 성공 응답과 에러 응답 형식을 통일한다.
- 지원하지 않는 method일 때 명확한 에러를 반환한다.

현재 MVP에서 지원하는 method:
- search_products: 슬라임 재료 상품 검색 mock tool
"""
