const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, "");

export function resolveApiAssetUrl(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${API_BASE_URL}${url}`;
  }

  return url;
}

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
  const fallbackMessage = "데이터를 처리하지 못했습니다. 잠시 후 다시 시도해주세요.";

  try {
    const data = (await response.json()) as { detail?: unknown };

    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data.detail)) {
      return data.detail
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }

          if (item && typeof item === "object" && "msg" in item) {
            return String((item as { msg: unknown }).msg);
          }

          return fallbackMessage;
        })
        .join(" ");
    }

    return fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}
