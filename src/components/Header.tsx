import { useState } from "react"
import { Link } from "react-router"
import JungleMarketLogo from "./JungleMarketLogo"
import { useMockAuth } from "../lib/mockAuth"

const Header = () => {
  const { user, isLoggedIn, logoutMockUser } = useMockAuth()
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

  const handleLogout = () => {
    logoutMockUser()
    setIsProfileMenuOpen(false)
  }

  return (
    <header className="relative z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" aria-label="JungleMarket 홈으로 이동">
          <JungleMarketLogo size="sm" />
        </Link>

        <nav className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <Link
                to="/post-create"
                className="rounded-full border-2 border-gray-900 bg-white px-5 py-2 text-sm font-bold text-gray-900 transition hover:bg-gray-900 hover:text-white"
              >
                새 글 작성
              </Link>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen((isOpen) => !isOpen)}
                  className="flex items-center gap-3"
                  aria-expanded={isProfileMenuOpen}
                  aria-label="프로필 메뉴 열기"
                >
                  <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[#D1FAE5] text-base font-bold text-[#00A862] ring-2 ring-[#ECFDF5]">
                    {user?.name.slice(0, 1)}
                  </span>
                  <svg
                    className={`h-4 w-4 text-gray-400 transition ${
                      isProfileMenuOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="m6 9 6 6 6-6"
                    />
                  </svg>
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-14 z-50 w-56 rounded-sm border border-gray-100 bg-white py-3 shadow-xl shadow-gray-200/80">
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="block px-6 py-3 text-base font-medium text-gray-800 hover:bg-gray-50"
                    >
                      마이페이지
                    </Link>
                    <Link
                      to="/profile-edit"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="block px-6 py-3 text-base font-medium text-gray-800 hover:bg-gray-50"
                    >
                      설정
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full px-6 py-3 text-left text-base font-medium text-gray-800 hover:bg-gray-50"
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-[#00C471] hover:bg-[#ECFDF5] hover:text-[#00A862]"
            >
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header
