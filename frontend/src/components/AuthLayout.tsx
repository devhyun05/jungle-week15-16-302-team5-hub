import type { ReactNode } from "react"
import JungleMarketLogo from "./JungleMarketLogo"

type AuthLayoutProps = {
  title: string
  description: string
  children: ReactNode
}

const AuthLayout = ({ title, description, children }: AuthLayoutProps) => {
  return (
    <main className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 pb-20 pt-6">
      <section className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-10 shadow-xl shadow-gray-200/70">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-7">
            <JungleMarketLogo />
          </div>

          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-gray-500">{description}</p>
        </div>

        {children}
      </section>
    </main>
  )
}

export default AuthLayout
