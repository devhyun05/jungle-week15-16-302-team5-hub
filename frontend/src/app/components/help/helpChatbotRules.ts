export type HelpChatAction = {
  label: string;
  path: string;
};

export type HelpChatRule = {
  id: string;
  quickQuestion: string;
  keywords: string[];
  answer: string;
  actions: HelpChatAction[];
};

export const unsupportedHelpAnswer =
  "이 기능은 나중에 RAG/Agent 챗봇으로 확장할 예정입니다.\n지금은 JungleLog 사용 흐름만 안내할 수 있어요.\n포트폴리오 관리, GitHub 등록, 기록 연결, AI 도우미, 코치 리뷰에 대해 물어봐 주세요.";

export const defaultHelpAnswer =
  "지금은 JungleLog 사용 흐름만 안내할 수 있어요.\n포트폴리오 관리, GitHub 등록, 기록 연결, AI 도우미, 코치 리뷰에 대해 물어봐 주세요.";

export const helpChatbotRules: HelpChatRule[] = [
  {
    id: "start",
    quickQuestion: "처음 뭐부터 하면 돼?",
    keywords: ["처음", "시작", "뭐부터", "순서", "처음에"],
    answer:
      "지금은 이 순서로 하면 됩니다.\n1. GitHub 프로젝트를 등록하세요.\n2. 학습 기록을 작성하고 프로젝트에 연결하세요.\n3. AI 도우미에서 포트폴리오 글을 만든 뒤 코치 리뷰를 요청하세요.",
    actions: [
      { label: "포트폴리오 관리로 이동", path: "/portfolio" },
      { label: "글 작성하기", path: "/posts/new" },
    ],
  },
  {
    id: "github",
    quickQuestion: "GitHub 프로젝트는 어떻게 등록해?",
    keywords: ["github", "깃허브", "프로젝트 등록", "repo", "레포", "repository"],
    answer:
      "포트폴리오 관리에서 GitHub repo URL을 입력하면 됩니다.\nbranch URL도 넣을 수 있고, JungleLog가 README와 커밋 메시지를 가져옵니다.\n등록 후에는 이 프로젝트에 학습 기록을 연결하세요.",
    actions: [{ label: "포트폴리오 관리로 이동", path: "/portfolio" }],
  },
  {
    id: "records",
    quickQuestion: "학습 기록은 어떻게 연결해?",
    keywords: ["기록", "연결", "학습", "트러블슈팅", "회고"],
    answer:
      "먼저 학습 로그나 트러블슈팅 글을 작성하세요.\n그다음 포트폴리오 관리에서 프로젝트를 선택하고 기록 연결하기를 누르면 됩니다.\n연결된 기록은 AI 도우미와 코치 리뷰의 근거가 됩니다.",
    actions: [
      { label: "글 작성하기", path: "/posts/new" },
      { label: "내 기록 보기", path: "/my-records" },
    ],
  },
  {
    id: "ai",
    quickQuestion: "AI 도우미는 언제 써?",
    keywords: ["ai", "도우미", "포트폴리오 글", "면접", "질문", "생성"],
    answer:
      "GitHub 프로젝트와 학습 기록을 연결한 뒤 AI 도우미를 쓰면 좋습니다.\nAI는 README, 커밋 메시지, 연결 기록, 코치 피드백을 참고합니다.\n포트폴리오 글이나 면접 예상 질문을 만든 뒤 프로젝트에 저장하세요.",
    actions: [
      { label: "AI 도우미로 이동", path: "/ai-assistant" },
      { label: "포트폴리오 관리로 이동", path: "/portfolio" },
    ],
  },
  {
    id: "coach",
    quickQuestion: "코치 리뷰는 어떻게 요청해?",
    keywords: ["코치", "리뷰", "피드백", "검토", "요청"],
    answer:
      "코치 리뷰 요청 화면에서 게시글이나 포트폴리오 프로젝트를 선택하세요.\n리뷰 받을 코치를 고르고 메시지를 적어 보내면 됩니다.\n코치가 상태와 피드백을 보내면 요청 목록과 알림에서 확인할 수 있습니다.",
    actions: [{ label: "코치 리뷰 요청", path: "/coach-review" }],
  },
  {
    id: "publish",
    quickQuestion: "포트폴리오 게시글 공개/비공개 차이는 뭐야?",
    keywords: ["공개", "비공개", "발행", "게시글", "포트폴리오 게시글"],
    answer:
      "공개로 발행하면 전체 게시글에서 다른 사람도 볼 수 있습니다.\n비공개로 발행하면 내 기록에서는 보이지만 전체 게시글에는 보이지 않습니다.\n처음 정리 중이면 비공개, 코치 피드백 후 공개를 추천합니다.",
    actions: [
      { label: "포트폴리오 관리로 이동", path: "/portfolio" },
      { label: "내 기록 보기", path: "/my-records" },
    ],
  },
];

const unsupportedKeywords = ["검색", "추천", "코드 분석", "상담", "기술 면접", "답변 작성", "개인 맞춤", "rag", "agent"];

export function getHelpChatbotReply(question: string): Pick<HelpChatRule, "answer" | "actions"> {
  const normalizedQuestion = question.trim().toLowerCase();

  if (!normalizedQuestion) {
    return {
      answer: defaultHelpAnswer,
      actions: [],
    };
  }

  const matchedRule = helpChatbotRules.find((rule) =>
    rule.keywords.some((keyword) => normalizedQuestion.includes(keyword.toLowerCase())),
  );

  if (matchedRule) {
    return {
      answer: matchedRule.answer,
      actions: matchedRule.actions,
    };
  }

  const isUnsupportedQuestion = unsupportedKeywords.some((keyword) => normalizedQuestion.includes(keyword.toLowerCase()));

  return {
    answer: isUnsupportedQuestion ? unsupportedHelpAnswer : defaultHelpAnswer,
    actions: [],
  };
}
