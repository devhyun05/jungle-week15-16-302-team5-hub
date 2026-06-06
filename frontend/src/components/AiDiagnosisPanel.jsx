export default function AiDiagnosisPanel({ diagnosis }) {
  // TODO: RAG 유사 사례, MCP 습도 정보, Agent 해결 순서를 구조적으로 표시한다.
  return (
    <section className="ai-panel">
      <h2>AI 진단 결과</h2>
      <p>{diagnosis?.summary || "AI 진단 요청 후 결과가 표시됩니다."}</p>
    </section>
  );
}
