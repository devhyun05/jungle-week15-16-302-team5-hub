import type { Tone } from "../types";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const pageStack = "grid gap-8";
export const pageHeader = "grid max-w-[780px] gap-3";
export const sectionTitleRow = "flex items-end justify-between gap-4 max-md:flex-col max-md:items-stretch";

export const surfaceCard = "rounded-lg border border-line bg-white p-5 shadow-subtle";
export const panelCard = "rounded-lg border border-line bg-white shadow-subtle";

export const button =
  "inline-flex min-h-[42px] items-center justify-center rounded-lg border border-mint bg-mint px-4 text-base font-bold text-white transition hover:border-mint-dark hover:bg-mint-dark hover:shadow-subtle max-md:w-full";

export const ghostButton =
  "inline-flex min-h-[42px] items-center justify-center rounded-lg border border-line bg-white px-4 text-base font-bold text-ink transition hover:border-mint hover:bg-mint-soft hover:text-mint-dark max-md:w-full";

export const field =
  "min-h-[50px] w-full rounded-lg border border-line bg-white px-4 text-[17px] text-ink outline-none transition placeholder:text-muted/70 focus:border-mint focus:shadow-[0_0_0_4px_rgba(15,118,110,0.16)]";

export const textarea = cn(field, "min-h-44 resize-y py-3.5");

export const meta = "text-base leading-relaxed text-muted";
export const muted = "text-[17px] leading-[1.65] text-muted";
export const cardCopy = "text-[17px] leading-[1.65] text-[#3f4b5b]";
export const lead = "text-[19px] leading-[1.7] text-[#3f4b5b]";

export const h1 = "text-[34px] font-bold leading-[1.12] text-ink md:text-[48px]";
export const heroH1 = "text-[40px] font-bold leading-[1.12] text-ink md:text-[58px]";
export const articleH1 = "text-[30px] font-bold leading-[1.12] text-ink md:text-[38px]";
export const h2 = "text-[28px] font-bold leading-tight text-ink";
export const h3 = "text-[21px] font-bold leading-snug text-ink";

export const badgeBase =
  "inline-flex min-h-8 items-center rounded-full px-3.5 text-sm font-extrabold leading-none";

export const badgeTone: Record<Tone, string> = {
  mint: "bg-mint-soft text-mint-dark",
  lavender: "bg-lavender-soft text-lavender",
  coral: "bg-amber-100 text-coral",
};

export const iconBase =
  "inline-flex h-11 w-11 flex-none items-center justify-center rounded-full text-base font-bold";

export const iconTone: Record<Tone, string> = {
  mint: "bg-mint-soft text-mint-dark",
  lavender: "bg-lavender-soft text-lavender",
  coral: "bg-amber-100 text-coral",
};

export const featureLink = "font-extrabold text-mint-dark";

export const featureLinkTone: Record<Tone, string> = {
  mint: "text-mint-dark",
  lavender: "text-lavender",
  coral: "text-coral",
};

export const tagRow = "flex flex-wrap gap-2";
export const formGroup = "grid gap-2.5";
export const formLabel = "text-base font-extrabold text-ink";
