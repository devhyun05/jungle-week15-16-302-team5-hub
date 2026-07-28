import type { Tone } from "../types";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const pageStack = "grid gap-6";
export const pageHeader = "grid max-w-[760px] gap-2";
export const sectionTitleRow = "flex items-end justify-between gap-4 max-md:flex-col max-md:items-stretch";

export const surfaceCard = "rounded-md border border-line bg-white p-5 shadow-subtle";
export const panelCard = "rounded-md border border-line bg-white shadow-subtle";

export const button =
  "inline-flex min-h-11 items-center justify-center rounded-md border border-mint bg-mint px-4 text-base font-bold text-white transition hover:border-mint-dark hover:bg-mint-dark disabled:cursor-not-allowed disabled:opacity-60 max-md:w-full";

export const ghostButton =
  "inline-flex min-h-11 items-center justify-center rounded-md border border-line bg-white px-4 text-base font-bold text-ink transition hover:border-mint hover:bg-mint-soft hover:text-mint-dark disabled:cursor-not-allowed disabled:opacity-60 max-md:w-full";

export const field =
  "min-h-12 w-full rounded-md border border-line bg-white px-4 text-[17px] text-ink outline-none transition placeholder:text-muted/70 focus:border-mint focus:shadow-[0_0_0_3px_rgba(17,184,154,0.14)]";

export const textarea = cn(field, "min-h-40 resize-y py-3.5 leading-relaxed");

export const meta = "text-[15px] leading-relaxed text-muted";
export const muted = "text-[17px] leading-relaxed text-muted";
export const cardCopy = "text-[17px] leading-relaxed text-[#475467]";
export const lead = "text-xl leading-relaxed text-[#475467]";

export const h1 = "text-[34px] font-bold leading-tight text-ink md:text-[44px]";
export const heroH1 = "text-[38px] font-bold leading-tight text-ink md:text-[52px]";
export const articleH1 = "text-[32px] font-bold leading-tight text-ink md:text-[42px]";
export const h2 = "text-[27px] font-bold leading-tight text-ink";
export const h3 = "text-[21px] font-bold leading-snug text-ink";

export const badgeBase =
  "inline-flex min-h-8 items-center rounded-md px-3 text-sm font-bold leading-none";

export const badgeTone: Record<Tone, string> = {
  mint: "bg-mint-soft text-mint-dark",
  lavender: "bg-mint-soft text-mint-dark",
  coral: "bg-mint-soft text-mint-dark",
};

export const iconBase =
  "inline-flex h-10 w-10 flex-none items-center justify-center rounded-md text-base font-bold";

export const iconTone: Record<Tone, string> = {
  mint: "bg-mint-soft text-mint-dark",
  lavender: "bg-mint-soft text-mint-dark",
  coral: "bg-mint-soft text-mint-dark",
};

export const featureLink = "font-extrabold text-mint-dark";

export const featureLinkTone: Record<Tone, string> = {
  mint: "text-mint-dark",
  lavender: "text-mint-dark",
  coral: "text-coral",
};

export const tagRow = "flex flex-wrap gap-2";
export const formGroup = "grid gap-2";
export const formLabel = "text-base font-bold text-ink";
