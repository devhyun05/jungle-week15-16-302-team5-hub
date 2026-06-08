import type { DiagnosisResult } from "../types";

interface AiDiagnosisPanelProps {
  diagnosis?: DiagnosisResult;
}

export default function AiDiagnosisPanel({ diagnosis }: AiDiagnosisPanelProps) {
  const steps = diagnosis?.solutionSteps || [
    "활성제는 1/4씩 나누어 천천히 추가하세요.",
    "섞은 뒤 10분 정도 기다려 점도 변화를 확인하세요.",
    "습도가 높으면 밀폐 보관 시간을 늘려주세요.",
  ];

  return (
    <section className="ai-panel compact">
      <div className="feature-card-header">
        <div>
          <span className="eyebrow">AI Agent</span>
          <h2>{diagnosis?.summary || "진단 완료 · 점도 조절 필요"}</h2>
        </div>
        <span className="badge badge-mint">RAG + MCP</span>
      </div>
      <div className="panel-section">
        <span className="badge badge-coral">예상 원인</span>
        <p className="muted">
          {diagnosis?.cause || "활성제 비율이 권장량을 초과했거나, 현재 습도 영향으로 질감이 평소보다 묽어졌을 수 있습니다."}
        </p>
      </div>
      <div className="panel-section">
        <span className="badge badge-mint">해결 단계</span>
        <ul className="panel-list">
          {steps.map((step, index) => (
            <li key={step}>
              <span className="number-dot">{index + 1}</span>
              {step}
            </li>
          ))}
        </ul>
      </div>
      <div className="panel-section">
        <span className="badge badge-lavender">MCP 습도</span>
        <p className="muted">{diagnosis?.weather || "서울 기준 습도 68%, 실온 보관 시 점도 회복을 먼저 확인하세요."}</p>
      </div>
    </section>
  );
}
