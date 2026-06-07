import { Link } from "react-router"
import logo from "../assets/krafton-jungle-logo.png"

const Header = () => {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-bold text-gray-900">
          <img src={logo} alt="크래프톤 정글 로고" className="h-12 w-auto" />
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            to="/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Login
          </Link>

          <Link
            to="/login"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Signup
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default Header
