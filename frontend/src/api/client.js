const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function apiRequest(path, options = {}) {
  // TODO: localStorage의 access token을 Authorization header에 자동으로 붙인다.
  // TODO: 공통 에러 응답을 처리하고 화면에서 사용할 메시지로 변환한다.
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error("API 요청 처리 로직을 구현해야 합니다.");
  }

  return response.json();
}
