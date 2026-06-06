import { apiRequest } from "./client";

export function fetchTags() {
  // TODO: 슬라임 종류, 실패 증상, 질감, 난이도 태그를 조회한다.
  return apiRequest("/tags");
}

export function fetchPopularTags() {
  // TODO: 목록 화면에서 인기 태그 필터를 보여줄 때 사용한다.
  return apiRequest("/tags/popular");
}
