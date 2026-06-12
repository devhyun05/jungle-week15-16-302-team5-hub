import { Link } from "react-router-dom";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../api/auth";
import { button, field, formGroup, formLabel, h1, meta, muted } from "../styles/ui";

const segmentedItem = "inline-flex min-h-[42px] items-center justify-center rounded-lg font-extrabold text-muted";
const segmentedActive = "bg-white text-ink shadow-subtle";

export default function SignupPage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!agree) {
      setMessage("이용약관 동의가 필요합니다.");
      return;
    }
    setIsSubmitting(true);
    try {
      await signup({ nickname, email, password });
      navigate("/login");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "회원가입에 실패했습니다.");
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
          <Link className={segmentedItem} to="/login">로그인</Link>
          <span className={`${segmentedItem} ${segmentedActive}`}>회원가입</span>
        </div>
        <label className={formGroup}>
          <span className={formLabel}>닉네임</span>
          <input className={field} placeholder="연구원 이름을 정해주세요" value={nickname} onChange={(event) => setNickname(event.target.value)} required />
        </label>
        <label className={formGroup}>
          <span className={formLabel}>이메일</span>
          <input className={field} type="email" placeholder="이메일 주소 입력" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label className={formGroup}>
          <span className={formLabel}>비밀번호</span>
          <input className={field} type="password" placeholder="8자 이상" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} />
        </label>
        <label className={meta}>
          <input type="checkbox" checked={agree} onChange={(event) => setAgree(event.target.checked)} /> 이용약관과 개인정보 처리방침에 동의합니다.
        </label>
        {message && <p className="rounded-lg border border-coral/20 bg-coral/10 p-3 text-base font-bold text-coral">{message}</p>}
        <button className={button} type="submit" disabled={isSubmitting}>{isSubmitting ? "가입 중..." : "말랑 연구소 가입하기"}</button>
      </form>
    </section>
  );
}
