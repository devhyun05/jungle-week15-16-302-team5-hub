import { Link } from "react-router"
import JungleMarketLogo from "./JungleMarketLogo"

const Header = () => {
  return (
    <header className="border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" aria-label="JungleMarket 홈으로 이동">
          <JungleMarketLogo size="sm" />
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            to="/login"
            className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
          >
            로그인
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default Header
