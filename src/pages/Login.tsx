import { Link } from "react-router"
import AuthLayout from "../components/AuthLayout"

function Login() {
  return (
    <AuthLayout
      title="Jungle Market에 오신 것을 환영합니다"
      description="크래프톤 정글 Slack 계정으로 로그인하고 내부 중고거래 게시판을 이용하세요."
    >
      <div className="space-y-4">
        <Link to="/">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#4A154B] px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-950/20 transition hover:-translate-y-0.5 hover:bg-[#611f69]"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 122.8 122.8"
              aria-hidden="true"
            >
              <path
                fill="#36C5F0"
                d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9Z"
              />
              <path
                fill="#36C5F0"
                d="M32.3 77.6c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6Z"
              />
              <path
                fill="#2EB67D"
                d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2Z"
              />
              <path
                fill="#2EB67D"
                d="M45.2 32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3Z"
              />
              <path
                fill="#ECB22E"
                d="M96.9 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H96.9V45.2Z"
              />
              <path
                fill="#ECB22E"
                d="M90.5 45.2c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3Z"
              />
              <path
                fill="#E01E5A"
                d="M77.6 96.9c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V96.9h12.9Z"
              />
              <path
                fill="#E01E5A"
                d="M77.6 90.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6Z"
              />
            </svg>
            Slack으로 계속하기
          </button>
        </Link>

        <p className="pt-2 text-center text-xs leading-5 text-gray-400">
          정글 Slack 워크스페이스에 가입된 계정만 사용할 수 있습니다.
        </p>
      </div>
    </AuthLayout>
  )
}

export default Login
