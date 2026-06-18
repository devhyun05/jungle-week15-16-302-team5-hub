import { parseInterviewQuestionGroups } from "../../utils/interviewQuestions";

export function InterviewQuestionsBlock({ text }: { text: string }) {
  const groups = parseInterviewQuestionGroups(text);

  if (groups.length === 0) {
    return <p className="text-sm leading-7 text-slate-500">{"\uC544\uC9C1 \uC800\uC7A5\uB41C \uBA74\uC811 \uC608\uC0C1 \uC9C8\uBB38\uC774 \uC5C6\uC2B5\uB2C8\uB2E4."}</p>;
  }

  return (
    <div className="space-y-4">
      {groups.map((group, index) => (
        <section key={`${group.question}-${index}`} className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-base font-bold leading-7 text-slate-950">{group.question}</h3>
          <div className="mt-4 rounded-lg bg-emerald-50/70 p-4">
            <p className="text-xs font-bold tracking-wide text-emerald-700">POINT</p>
            {group.points.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {group.points.map((point) => (
                  <li key={point} className="flex gap-2 text-sm leading-6 text-slate-700">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm leading-6 text-slate-600">{"\uC544\uC9C1 \uC815\uB9AC\uB41C \uB2F5\uBCC0 \uD3EC\uC778\uD2B8\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4."}</p>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
