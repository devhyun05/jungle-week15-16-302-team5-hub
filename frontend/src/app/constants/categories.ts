import { BookOpen, Briefcase, MessageSquare, Wrench, type LucideIcon } from "lucide-react";

export type CategorySlug =
  | "learning-log"
  | "troubleshooting"
  | "retrospective"
  | "interview"
  | "portfolio";

export type Category = {
  slug: CategorySlug;
  label: string;
  count: number;
  icon: LucideIcon;
  color: string;
};

export const categories: Category[] = [
  { slug: "learning-log", label: "학습 로그", count: 0, icon: BookOpen, color: "text-blue-500" },
  { slug: "troubleshooting", label: "트러블슈팅", count: 0, icon: Wrench, color: "text-orange-500" },
  { slug: "retrospective", label: "프로젝트 회고", count: 0, icon: MessageSquare, color: "text-purple-500" },
  { slug: "interview", label: "면접 질문", count: 0, icon: MessageSquare, color: "text-pink-500" },
  { slug: "portfolio", label: "포트폴리오 관리", count: 0, icon: Briefcase, color: "text-emerald-500" },
];
