import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import AuthLayout from "../components/AuthLayout"

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api"

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const authError = new URLSearchParams(location.search).get("authError")
  const [errorMessage, setErrorMessage] = useState(authError ?? "")
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    if (!authError) {
      return
    }

    navigate("/login", { replace: true })
  }, [authError, navigate])

  const handleGoogleLogin = () => {
    setErrorMessage("")
    setIsRedirecting(true)
    window.location.href = `${API_BASE_URL}/auth/google/login`
  }

  return (
    <AuthLayout
      title="Jungle Market에 오신 것을 환영합니다"
      description="허용된 이메일의 Google 계정으로 로그인하고 내부 중고거래 게시판을 이용하세요."
    >
      <div className="space-y-5">
        {errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-500">
            {errorMessage}
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isRedirecting}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-sm font-bold text-[#4285F4]">
            G
          </span>
          {isRedirecting ? "Google로 이동 중" : "Google로 계속하기"}
        </button>

        <p className="pt-2 text-center text-xs leading-5 text-gray-400">
          로그인 가능한 Google 이메일은 allowlist에 등록되어 있어야 합니다.
          Slack은 거래 알림 전송에만 사용됩니다.
        </p>
      </div>
    </AuthLayout>
  )
}

export default Login
