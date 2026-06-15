const nonTechnicalStackLabels = new Set(["markdown", "readme", "github"]);

export function getDisplayTechStack(techStack: string[]) {
  return techStack.filter((stack) => {
    const normalizedStack = stack.trim().toLowerCase();

    return normalizedStack.length > 0 && !nonTechnicalStackLabels.has(normalizedStack);
  });
}
