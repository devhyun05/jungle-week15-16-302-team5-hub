export const API_BASE_URL = "http://localhost:8000";


export async function getErrorMessage(response: Response): Promise<string> {
  // FastAPI는 보통 `{ "detail": "..." }` 형태로 오류를 내려준다.
  // JSON 파싱에 실패하면 기본 메시지를 반환해서 화면이 깨지지 않게 한다.
  try {
    const data = (await response.json()) as { detail?: string };
    return data.detail ?? "요청을 처리하지 못했습니다.";
  } catch {
    return "요청을 처리하지 못했습니다.";
  }
}
