import { BookOpen, Briefcase, MessageSquare, Wrench, type LucideIcon } from "lucide-react";

export type UserRole = "STUDENT" | "COACH";

// 게시글 카테고리는 화면 필터와 URL query string에서 같은 slug를 사용합니다.
export type CategorySlug =
  | "learning-log"
  | "troubleshooting"
  | "retrospective"
  | "interview"
  | "portfolio";

export type ReviewStatus = "대기 중" | "검토 중" | "피드백 완료" | "수정 요청" | "최종 확인";
export type PortfolioStatus = "작성중" | "보완 필요" | "정리 완료";
export type CoachFeedbackStatus = "요청 전" | "요청함" | "검토 중" | "피드백 완료" | "수정 요청";
export type TargetType = "post" | "portfolio";

// 카테고리 탭과 대시보드 카드가 함께 사용하는 표시 정보입니다.
export type Category = {
  slug: CategorySlug;
  label: string;
  count: number;
  icon: LucideIcon;
  color: string;
};

// 게시글 목록, 상세, 내 기록 화면이 공통으로 사용하는 mock 게시글 구조입니다.
export type MockPost = {
  id: number;
  title: string;
  category: string;
  categorySlug: CategorySlug;
  tags: string[];
  author: string;
  date: string;
  createdAt: string;
  comments: number;
  views: number;
  isPublic: boolean;
  summary: string;
  contentSections: {
    heading: string;
    body: string;
    code?: string;
  }[];
  relatedCommit?: string;
};

// GitHub repo와 JungleLog 기록을 연결해서 포트폴리오로 관리하는 프로젝트 구조입니다.
export type PortfolioProject = {
  id: string;
  title: string;
  category: string;
  categorySlug: CategorySlug;
  repo: string;
  githubUrl: string;
  stack: string[];
  readmeSummary: string;
  recentCommitSummary: string[];
  linkedRecordCount: number;
  linkedPostIds: number[];
  portfolioStatus: PortfolioStatus;
  coachFeedbackStatus: CoachFeedbackStatus;
  githubConnected: boolean;
  aiDraftSaved: boolean;
  savedPortfolioDraft: string;
  summary: string;
  lastCommitAt: string;
};

// 학생이 코치에게 보낸 리뷰 요청과 코치 인박스가 함께 사용하는 구조입니다.
export type ReviewRequest = {
  id: string;
  requesterId: string;
  requesterName: string;
  coachIds: string[];
  coachNames: string[];
  targetType: TargetType;
  targetId: string;
  targetTitle: string;
  category: string;
  categorySlug: CategorySlug;
  message: string;
  status: ReviewStatus;
  createdAt: string;
  feedback: string;
};

export const categories: Category[] = [
  { slug: "learning-log", label: "학습 로그", count: 42, icon: BookOpen, color: "text-blue-500" },
  { slug: "troubleshooting", label: "트러블슈팅", count: 18, icon: Wrench, color: "text-orange-500" },
  { slug: "retrospective", label: "프로젝트 회고", count: 5, icon: MessageSquare, color: "text-purple-500" },
  { slug: "interview", label: "면접 질문", count: 12, icon: MessageSquare, color: "text-pink-500" },
  { slug: "portfolio", label: "포트폴리오 관리", count: 3, icon: Briefcase, color: "text-emerald-500" },
];

export const students = [
  { id: "student-1", name: "김정글", track: "Backend" },
  { id: "student-2", name: "이학습", track: "Frontend" },
  { id: "student-3", name: "박코어", track: "OS / CS" },
  { id: "student-4", name: "최프론트", track: "Frontend" },
];

export const coaches = [
  { id: "coach-1", name: "이코치", field: "Backend" },
  { id: "coach-2", name: "정멘토", field: "Portfolio" },
  { id: "coach-3", name: "한리뷰", field: "Frontend" },
];

export const posts: MockPost[] = [
  {
    id: 1,
    title: "FastAPI JWT 인증 구현 기록",
    category: "학습 로그",
    categorySlug: "learning-log",
    tags: ["FastAPI", "Python", "Security"],
    author: "김정글",
    date: "2시간 전",
    createdAt: "2026.06.05 10:30",
    comments: 3,
    views: 42,
    isPublic: true,
    summary: "FastAPI에서 JWT 기반 로그인 흐름을 구현하며 배운 인증 구조와 예외 처리 포인트를 정리했습니다.",
    contentSections: [
      {
        heading: "구현 목표",
        body: "로그인 성공 시 access token을 발급하고, 보호된 API에서 토큰을 검증하는 흐름을 구현했습니다.",
      },
      {
        heading: "핵심 코드",
        body: "토큰 생성에는 사용자 id와 만료 시간을 담고, API 요청마다 Authorization 헤더를 파싱하도록 구성했습니다.",
        code: "def create_access_token(subject: str):\n    expire = datetime.utcnow() + timedelta(minutes=30)\n    return jwt.encode({'sub': subject, 'exp': expire}, SECRET_KEY, algorithm='HS256')",
      },
      {
        heading: "배운 점",
        body: "인증은 단순히 로그인 화면을 만드는 것이 아니라 토큰 만료, 재발급, 권한 분기까지 함께 설계해야 한다는 점을 배웠습니다.",
      },
    ],
    relatedCommit: "feat: implement FastAPI JWT authentication flow",
  },
  {
    id: 2,
    title: "PostgreSQL 연결 오류 트러블슈팅",
    category: "트러블슈팅",
    categorySlug: "troubleshooting",
    tags: ["DB", "PostgreSQL", "Error"],
    author: "이코드",
    date: "어제",
    createdAt: "2026.06.04 14:30",
    comments: 5,
    views: 68,
    isPublic: true,
    summary: "배포 환경에서 PostgreSQL connection timeout이 발생한 원인을 환경 변수, 포트, 네트워크 접근 순서로 추적했습니다.",
    contentSections: [
      {
        heading: "문제 상황",
        body: "로컬에서는 연결되던 FastAPI 서버가 배포 환경에서 PostgreSQL에 연결하지 못하고 connection timeout을 반복했습니다.",
        code: "psycopg.OperationalError: connection timeout\nIs the server running and accepting TCP/IP connections?",
      },
      {
        heading: "해결 과정",
        body: "DATABASE_URL 형식, 포트, 네트워크 접근 권한을 순서대로 점검했습니다. 이후 연결 포트를 PgBouncer 포트로 변경하면서 배포 환경에서도 정상 연결되는 것을 확인했습니다.",
      },
      {
        heading: "배운 점",
        body: "DB 연결 오류는 코드 문제뿐 아니라 네트워크, 포트, 환경 변수 설정이 함께 영향을 줄 수 있으므로 체크리스트로 관리해야 합니다.",
      },
    ],
    relatedCommit: "fix: update database connection settings",
  },
  {
    id: 3,
    title: "AI 게시판 프로젝트 개인 회고",
    category: "프로젝트 회고",
    categorySlug: "retrospective",
    tags: ["회고", "개인프로젝트"],
    author: "박개발",
    date: "3일 전",
    createdAt: "2026.06.03 21:10",
    comments: 12,
    views: 130,
    isPublic: true,
    summary: "React 화면 설계부터 AI 기능 기획까지 혼자 구현하며 느낀 의사결정과 학습 포인트를 정리했습니다.",
    contentSections: [
      {
        heading: "잘한 점",
        body: "처음부터 완성형 백엔드를 만들기보다 React mock 화면을 먼저 잡으면서 서비스 흐름을 이해하려고 했습니다.",
      },
      {
        heading: "어려웠던 점",
        body: "RAG, MCP, Agent의 차이가 처음에는 추상적으로 느껴졌지만, 게시판 기능에 붙일 수 있는 실제 시나리오로 바꾸면서 이해가 쉬워졌습니다.",
      },
      {
        heading: "다음 개선",
        body: "백엔드 연결 전까지는 mock data를 기준으로 화면 흐름을 안정화하고, 이후 API 명세를 맞춰 점진적으로 교체할 계획입니다.",
      },
    ],
    relatedCommit: "feat: scaffold JungleLog React mock screens",
  },
  {
    id: 4,
    title: "면접 질문: RAG와 MCP의 차이",
    category: "면접 질문",
    categorySlug: "interview",
    tags: ["AI", "면접"],
    author: "최프론트",
    date: "4일 전",
    createdAt: "2026.06.02 18:20",
    comments: 2,
    views: 51,
    isPublic: true,
    summary: "RAG와 MCP를 면접에서 설명할 수 있도록 역할, 입력 데이터, 외부 시스템 연동 관점으로 비교했습니다.",
    contentSections: [
      {
        heading: "질문",
        body: "RAG와 MCP는 둘 다 LLM에 외부 정보를 연결하는 것처럼 보이는데, 어떤 차이가 있나요?",
      },
      {
        heading: "답변 초안",
        body: "RAG는 문서나 지식 베이스에서 관련 정보를 검색해 LLM 답변의 근거로 넣는 방식입니다. MCP는 LLM이 외부 도구나 시스템을 표준 프로토콜로 호출할 수 있게 해주는 연결 규격에 가깝습니다.",
      },
      {
        heading: "내 프로젝트 적용",
        body: "JungleLog에서는 게시글/회고 검색에는 RAG를, GitHub 정보 조회나 외부 API 호출에는 MCP를 적용할 수 있습니다.",
      },
    ],
    relatedCommit: "docs: add AI feature architecture notes",
  },
  {
    id: 5,
    title: "포트폴리오 초안 정리",
    category: "포트폴리오 관리",
    categorySlug: "portfolio",
    tags: ["포트폴리오", "초안"],
    author: "김정글",
    date: "5일 전",
    createdAt: "2026.06.01 11:00",
    comments: 0,
    views: 12,
    isPublic: false,
    summary: "JungleLog 프로젝트를 포트폴리오에 넣기 위해 문제 정의, 기술 선택, 구현 범위, 한계점을 초안으로 정리했습니다.",
    contentSections: [
      {
        heading: "프로젝트 한 줄 소개",
        body: "정글 수강생의 학습 기록, 트러블슈팅, 회고, 포트폴리오 자료를 한곳에서 관리하는 AI 게시판입니다.",
      },
      {
        heading: "강조할 점",
        body: "단순 게시판이 아니라 RAG, MCP, Agent 기능을 게시판 워크플로우에 연결하는 것을 목표로 합니다.",
      },
      {
        heading: "보완할 점",
        body: "백엔드 API 연결 후 실제 데이터 저장, 인증, 권한 처리를 구현해야 완성도 있는 서비스로 설명할 수 있습니다.",
      },
    ],
    relatedCommit: "docs: draft portfolio summary",
  },
];

export const portfolioProjects: PortfolioProject[] = [
  {
    id: "portfolio-1",
    title: "JungleLog AI 게시판",
    category: "포트폴리오 관리",
    categorySlug: "portfolio",
    repo: "leejunhee8235/ai-board-lab",
    githubUrl: "https://github.com/leejunhee8235/ai-board-lab",
    stack: ["React", "TypeScript", "FastAPI", "PostgreSQL", "OpenAI API"],
    readmeSummary: "학습 기록, 포트폴리오, 코치 피드백을 연결하는 AI 게시판 서비스입니다.",
    recentCommitSummary: [
      "Figma 기반 React mock UI 안정화",
      "역할별 사이드바와 코치 리뷰 mock 흐름 구현",
      "게시글 카테고리 필터와 상세 데이터 연결",
    ],
    linkedRecordCount: 3,
    linkedPostIds: [1, 2, 5],
    portfolioStatus: "작성중",
    coachFeedbackStatus: "검토 중",
    githubConnected: true,
    aiDraftSaved: true,
    savedPortfolioDraft:
      "JungleLog는 정글 수강생의 학습 기록과 포트폴리오 관리를 연결하는 AI 게시판입니다. React 기반 화면과 FastAPI 백엔드 구조를 나누어 설계했고, RAG로 과거 기록을 검색하고 MCP로 GitHub 정보를 가져오는 흐름을 목표로 합니다.",
    summary: "React, FastAPI, PostgreSQL, OpenAI API를 활용한 AI 게시판 프로젝트",
    lastCommitAt: "3시간 전",
  },
  {
    id: "portfolio-2",
    title: "Pintos OS 프로젝트",
    category: "프로젝트 회고",
    categorySlug: "retrospective",
    repo: "krafton-jungle/pintos-junhee",
    githubUrl: "https://github.com/krafton-jungle/pintos-junhee",
    stack: ["C", "Operating System", "Thread", "Scheduler"],
    readmeSummary: "운영체제 핵심 개념을 직접 구현하며 스레드, 스케줄링, 동기화 문제를 학습한 프로젝트입니다.",
    recentCommitSummary: [
      "priority scheduling 테스트 케이스 정리",
      "donation 로직 디버깅 기록 추가",
      "프로젝트 회고 초안 작성",
    ],
    linkedRecordCount: 1,
    linkedPostIds: [3],
    portfolioStatus: "보완 필요",
    coachFeedbackStatus: "수정 요청",
    githubConnected: true,
    aiDraftSaved: true,
    savedPortfolioDraft:
      "Pintos 프로젝트에서는 스레드 스케줄링과 priority donation을 구현하며 운영체제의 동시성 문제를 직접 경험했습니다. 디버깅 과정에서 테스트 케이스를 작은 단위로 쪼개 원인을 추적하는 방식을 익혔습니다.",
    summary: "운영체제 프로젝트에서 맡은 역할과 문제 해결 과정을 정리한 포트폴리오 후보",
    lastCommitAt: "2일 전",
  },
  {
    id: "portfolio-3",
    title: "정글 면접 질문 아카이브",
    category: "면접 질문",
    categorySlug: "interview",
    repo: "leejunhee8235/jungle-interview-notes",
    githubUrl: "https://github.com/leejunhee8235/jungle-interview-notes",
    stack: ["React", "Markdown", "Search"],
    readmeSummary: "정글 과정에서 정리한 CS와 AI 면접 질문을 주제별로 모아 검색할 수 있는 아카이브입니다.",
    recentCommitSummary: [
      "RAG와 MCP 비교 질문 추가",
      "React 상태 관리 질문 정리",
      "태그 기반 검색 UI 초안 구현",
    ],
    linkedRecordCount: 1,
    linkedPostIds: [4],
    portfolioStatus: "정리 완료",
    coachFeedbackStatus: "피드백 완료",
    githubConnected: true,
    aiDraftSaved: true,
    savedPortfolioDraft:
      "정글 면접 질문 아카이브는 학습 중 정리한 질문과 답변을 주제별로 관리하는 개인 지식 베이스입니다. 반복 학습과 면접 준비를 위해 질문, 핵심 답변, 관련 프로젝트 경험을 연결했습니다.",
    summary: "면접 질문과 답변 초안을 정리해 반복 학습할 수 있는 개인 지식 베이스",
    lastCommitAt: "5일 전",
  },
];

export const reviewRequests: ReviewRequest[] = [
  {
    id: "review-1",
    requesterId: "student-1",
    requesterName: "김정글",
    coachIds: ["coach-1", "coach-2"],
    coachNames: ["이코치", "정멘토"],
    targetType: "post",
    targetId: "2",
    targetTitle: "PostgreSQL 연결 오류 트러블슈팅",
    category: "트러블슈팅",
    categorySlug: "troubleshooting",
    message: "원인 분석 흐름이 포트폴리오에 들어가도 괜찮은지 봐주세요.",
    status: "검토 중",
    createdAt: "2026.06.05",
    feedback: "해결 과정은 좋습니다. 실패한 시도와 최종 해결의 차이를 표로 정리해보세요.",
  },
  {
    id: "review-2",
    requesterId: "student-1",
    requesterName: "김정글",
    coachIds: ["coach-2"],
    coachNames: ["정멘토"],
    targetType: "portfolio",
    targetId: "portfolio-1",
    targetTitle: "JungleLog AI 게시판",
    category: "포트폴리오 관리",
    categorySlug: "portfolio",
    message: "프로젝트 설명이 너무 길지 않은지 확인받고 싶습니다.",
    status: "대기 중",
    createdAt: "2026.06.04",
    feedback: "",
  },
  {
    id: "review-3",
    requesterId: "student-2",
    requesterName: "이학습",
    coachIds: ["coach-3"],
    coachNames: ["한리뷰"],
    targetType: "post",
    targetId: "1",
    targetTitle: "FastAPI JWT 인증 구현 기록",
    category: "학습 로그",
    categorySlug: "learning-log",
    message: "인증 흐름 설명이 정확한지 봐주세요.",
    status: "수정 요청",
    createdAt: "2026.06.03",
    feedback: "토큰 재발급 흐름과 만료 처리 케이스를 추가하면 좋겠습니다.",
  },
];

export const notifications = [
  { id: "noti-1", message: "코치 피드백이 도착했습니다.", time: "방금 전" },
  { id: "noti-2", message: "포트폴리오 리뷰 요청이 승인되었습니다.", time: "1시간 전" },
  { id: "noti-3", message: "AI 초안 생성이 완료되었습니다.", time: "어제" },
];
