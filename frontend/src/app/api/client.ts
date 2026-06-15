const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, "");

/**
 * FastAPI 에러 응답을 화면에 보여줄 수 있는 짧은 메시지로 바꾼다.
 *
 * Args:
 *   response: fetch API가 반환한 HTTP 응답 객체.
 *
 * Returns:
 *   백엔드의 detail 메시지 또는 기본 에러 메시지.
 */
export async function getErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { detail?: string };
    return data.detail ?? "요청을 처리하지 못했습니다.";
  } catch {
    return "요청을 처리하지 못했습니다.";
  }
}
