import { useState } from "react";
import { HelpCircle, MessageCircle, Send, X } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "../ui/Button";
import { helpChatbotRules, getHelpChatbotReply, type HelpChatAction } from "./helpChatbotRules";

type ChatMessage = {
  id: number;
  sender: "bot" | "user";
  text: string;
  actions?: HelpChatAction[];
};

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    sender: "bot",
    text: "처음 쓰는 학생을 위한 사용 흐름 안내입니다.\n궁금한 흐름을 짧게 물어보거나 빠른 질문을 눌러보세요.",
  },
];

/**
 * 승인 완료된 STUDENT에게만 보여주는 MVP 도움말 챗봇이다.
 * 현재는 OpenAI를 호출하지 않고 rule-based 응답만 반환한다.
 * TODO: RAG/Agent 챗봇으로 확장할 때는 getHelpChatbotReply 경계를 API 호출로 교체한다.
 */
export function StudentHelpChatbot() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  const submitQuestion = (question: string) => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      return;
    }

    const reply = getHelpChatbotReply(trimmedQuestion);
    const nextId = Date.now();

    setMessages((prev) => [
      ...prev,
      {
        id: nextId,
        sender: "user",
        text: trimmedQuestion,
      },
      {
        id: nextId + 1,
        sender: "bot",
        text: reply.answer,
        actions: reply.actions,
      },
    ]);
    setInputText("");
  };

  const moveToAction = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-30 flex flex-col items-end gap-3">
      {isOpen && (
        <section className="w-[calc(100vw-2rem)] max-w-[380px] overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-xl">
          <header className="flex items-start justify-between gap-3 border-b border-slate-100 bg-emerald-50 px-4 py-3">
            <div>
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-emerald-700" />
                <h2 className="text-sm font-bold text-slate-900">JungleLog 도움말</h2>
              </div>
              <p className="mt-1 text-xs leading-5 text-emerald-800">처음 쓰는 학생을 위한 사용 흐름 안내입니다.</p>
            </div>
            <button
              type="button"
              className="rounded-md p-1 text-slate-500 transition-colors hover:bg-white hover:text-slate-800"
              aria-label="도움말 닫기"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="space-y-3 p-4">
            <div className="flex flex-wrap gap-2">
              {helpChatbotRules.map((rule) => (
                <button
                  key={rule.id}
                  type="button"
                  className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition-colors hover:border-emerald-200 hover:bg-emerald-100"
                  onClick={() => submitQuestion(rule.quickQuestion)}
                >
                  {rule.quickQuestion}
                </button>
              ))}
            </div>

            <div className="max-h-80 space-y-3 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50 p-3">
              {messages.map((message) => (
                <article key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[88%] rounded-lg px-3 py-2 text-sm leading-6 ${
                      message.sender === "user"
                        ? "bg-emerald-600 text-white"
                        : "border border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <p className="whitespace-pre-line">{message.text}</p>
                    {message.actions && message.actions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.actions.map((action) => (
                          <button
                            key={`${message.id}-${action.path}`}
                            type="button"
                            className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100"
                            onClick={() => moveToAction(action.path)}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>

            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                submitQuestion(inputText);
              }}
            >
              <input
                value={inputText}
                onChange={(event) => setInputText(event.target.value)}
                placeholder="예: 처음 뭐부터 하면 돼?"
                className="min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200"
              />
              <Button type="submit" size="icon" aria-label="도움말 질문 전송">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </section>
      )}

      <button
        type="button"
        className="flex h-12 items-center gap-2 rounded-full bg-emerald-600 px-4 text-sm font-bold text-white shadow-lg transition-colors hover:bg-emerald-700"
        aria-expanded={isOpen}
        aria-label="JungleLog 도움말 열기"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <MessageCircle className="h-5 w-5" />
        도움말
      </button>
    </div>
  );
}
