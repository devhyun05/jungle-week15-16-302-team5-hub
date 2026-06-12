import { Link } from "react-router-dom";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { storeSession } from "../api/client";
import { button, field, formGroup, formLabel, h1, meta, muted } from "../styles/ui";
import type { TokenResponse } from "../types";

const segmentedItem = "inline-flex min-h-[42px] items-center justify-center rounded-lg font-extrabold text-muted";
const segmentedActive = "bg-white text-ink shadow-subtle";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);
    try {
      const response = await login<TokenResponse>({ email, password });
      storeSession(response.access_token, response.user);
      navigate("/posts");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "로그인에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="grid justify-items-center gap-6 pt-10">
      <div className="grid justify-items-center gap-2.5 text-center">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-mint text-sm font-black text-white shadow-subtle">
          말
        </span>
        <div>
          <h1 className={h1}>말랑 연구소</h1>
          <p className={muted}>슬라임 메이커들의 연구실</p>
        </div>
      </div>
      <form className="grid w-full max-w-[440px] gap-[22px] rounded-lg border border-line bg-white p-6 shadow-subtle" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-page p-1">
          <span className={`${segmentedItem} ${segmentedActive}`}>로그인</span>
          <Link className={segmentedItem} to="/signup">회원가입</Link>
        </div>
        <label className={formGroup}>
          <span className={formLabel}>이메일</span>
          <input className={field} type="email" placeholder="이메일 주소 입력" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label className={formGroup}>
          <span className={formLabel}>비밀번호</span>
          <input className={field} type="password" placeholder="비밀번호 입력" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        {message && <p className="rounded-lg border border-coral/20 bg-coral/10 p-3 text-base font-bold text-coral">{message}</p>}
        <label className={meta}>
          <input type="checkbox" /> 로그인 상태 유지
        </label>
        <button className={button} type="submit" disabled={isSubmitting}>{isSubmitting ? "로그인 중..." : "로그인"}</button>
      </form>
    </section>
  );
}
