type JungleMarketLogoProps = {
  size?: "sm" | "md"
}

const JungleMarketLogo = ({ size = "md" }: JungleMarketLogoProps) => {
  const isSmall = size === "sm"

  return (
    <div className="flex items-center gap-3">
      <div
        className={
          isSmall
            ? "flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ECFDF5]"
            : "flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ECFDF5]"
        }
      >
        <svg
          className={isSmall ? "h-8 w-8" : "h-9 w-9"}
          viewBox="0 0 48 48"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M13 17h26l-3 14H17L13 17Z"
            fill="#00C471"
            stroke="#00A862"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.4"
          />
          <path
            d="M10 12h4l3 19h20"
            stroke="#1F2937"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.4"
          />
          <path
            d="M21 11c-3.8-4-8.2-2.8-9.6 1.4 4.1 1.8 7.1 1.1 9.6-1.4Z"
            fill="#8BF5B7"
            stroke="#00A862"
            strokeLinejoin="round"
            strokeWidth="1.6"
          />
          <path
            d="M23 11c1-5.2 5.7-7.1 9.8-4.7-1.7 4.7-5.1 6.5-9.8 4.7Z"
            fill="#8BF5B7"
            stroke="#00A862"
            strokeLinejoin="round"
            strokeWidth="1.6"
          />
          <path
            d="M21.5 17c1.1-3 2.1-5 4.1-7.2"
            stroke="#00A862"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
          <path
            d="M18 22h18M19.5 27h15"
            stroke="#ECFDF5"
            strokeLinecap="round"
            strokeWidth="2"
          />
          <circle cx="20" cy="36" r="3.6" fill="#FF7A00" />
          <circle cx="35" cy="36" r="3.6" fill="#FF7A00" />
          <circle cx="20" cy="36" r="1.5" fill="white" />
          <circle cx="35" cy="36" r="1.5" fill="white" />
        </svg>
      </div>

      <div className="leading-none">
        <p
          className={
            isSmall
              ? "text-lg font-black tracking-tight text-gray-900"
              : "text-2xl font-black tracking-tight text-gray-900"
          }
        >
          Jungle<span className="text-[#00C471]">Market</span>
        </p>
        {!isSmall && (
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-400">
            Krafton Jungle
          </p>
        )}
      </div>
    </div>
  )
}

export default JungleMarketLogo
