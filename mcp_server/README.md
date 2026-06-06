# MCP Server

말랑 연구소의 외부 도구 서버이다. FastAPI 본 서버와 분리해서 JSON-RPC 요청을 받고, 날씨/습도 API를 호출한다.

## 구현할 도구

- `get_current_weather(location)`: 현재 온도와 습도를 가져온다.
- `get_slime_environment_tip(humidity, temperature)`: 습도/온도에 맞는 슬라임 팁을 반환한다.

## JSON-RPC 요청 예시

```json
{
  "jsonrpc": "2.0",
  "method": "get_current_weather",
  "params": {
    "location": "Seoul"
  },
  "id": 1
}
```
