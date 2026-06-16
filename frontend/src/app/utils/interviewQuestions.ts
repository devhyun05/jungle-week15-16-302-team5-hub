export type InterviewQuestionGroup = {
  question: string;
  points: string[];
};

const tailQuestionPattern = /\uAF2C\uB9AC\s*\uC9C8\uBB38/;
const questionLabelPattern = /^\uC9C8\uBB38[:\uFF1A]\s*/;
const answerPointPattern = /^\uB2F5\uBCC0\s*\uD3EC\uC778\uD2B8[:\uFF1A]?\s*(.*)$/i;

export function cleanInterviewQuestionsText(text: string | null | undefined) {
  if (!text) {
    return "";
  }

  return text
    .split(/\r?\n/)
    .filter((line) => !tailQuestionPattern.test(line))
    .join("\n")
    .trim();
}

function stripInlineMarkdown(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

function normalizeQuestionLine(line: string) {
  return stripInlineMarkdown(line)
    .replace(/^#{1,6}\s*/, "")
    .replace(/^[-*]\s*/, "")
    .replace(/^\d+\.\s*/, "")
    .replace(questionLabelPattern, "")
    .trim();
}

function normalizePointLine(line: string) {
  return stripInlineMarkdown(line)
    .replace(/^#{1,6}\s*/, "")
    .replace(/^[-*]\s*/, "")
    .replace(/^\d+\.\s*/, "")
    .trim();
}

function extractAnswerPoint(line: string) {
  const normalizedLine = normalizePointLine(line);
  const answerPoint = answerPointPattern.exec(normalizedLine);
  const point = /^POINT[:\uFF1A]?\s*(.*)$/i.exec(normalizedLine);

  return answerPoint?.[1]?.trim() ?? point?.[1]?.trim() ?? null;
}

export function parseInterviewQuestionGroups(text: string | null | undefined): InterviewQuestionGroup[] {
  const groups: InterviewQuestionGroup[] = [];
  let currentGroup: InterviewQuestionGroup | null = null;
  let isPointSection = false;

  for (const rawLine of cleanInterviewQuestionsText(text).split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line) {
      continue;
    }

    const pointFromLabel = extractAnswerPoint(line);

    if (pointFromLabel !== null) {
      isPointSection = true;

      if (pointFromLabel && currentGroup) {
        currentGroup.points.push(pointFromLabel);
      }

      continue;
    }

    const question = normalizeQuestionLine(line);
    const isQuestion = question.endsWith("?") && !answerPointPattern.test(question) && !/^POINT/i.test(question);

    if (isQuestion) {
      currentGroup = {
        question,
        points: [],
      };
      groups.push(currentGroup);
      isPointSection = false;
      continue;
    }

    if (!currentGroup) {
      continue;
    }

    const point = normalizePointLine(line);

    if (point && (isPointSection || /^[-*]/.test(line))) {
      currentGroup.points.push(point);
    }
  }

  return groups;
}

export function getInterviewQuestionPreview(text: string | null | undefined, limit = 3) {
  return parseInterviewQuestionGroups(text)
    .map((group) => group.question)
    .slice(0, limit);
}
