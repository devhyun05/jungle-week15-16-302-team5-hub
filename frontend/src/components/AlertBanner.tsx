export type AlertType = "success" | "error" | "info"

type AlertBannerProps = {
  type: AlertType
  title: string
  message?: string
  onClose: () => void
}

const alertStyle = {
  success: {
    bar: "bg-[#00C471]",
    label: "text-[#008F54]",
  },
  error: {
    bar: "bg-red-500",
    label: "text-red-600",
  },
  info: {
    bar: "bg-gray-700",
    label: "text-gray-700",
  },
} as const

const alertLabel = {
  success: "완료",
  error: "오류",
  info: "안내",
} as const

const AlertBanner = ({ type, title, message, onClose }: AlertBannerProps) => {
  const style = alertStyle[type]

  return (
    <div
      className="fixed right-6 top-6 z-50 w-[min(calc(100vw-3rem),26rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.16)]"
      role="status"
      aria-live="polite"
    >
      <div className={`h-1.5 ${style.bar}`} />
      <div className="flex items-start gap-4 px-5 py-4">
        <div>
          <p className={`text-xs font-semibold ${style.label}`}>
            {alertLabel[type]}
          </p>
          <p className="mt-1 text-sm font-semibold text-gray-950">{title}</p>
          {message && (
            <p className="mt-1 text-sm leading-5 text-gray-500">{message}</p>
          )}
        </div>

        <button
          type="button"
          className="ml-auto rounded-md px-2 py-1 text-sm font-semibold text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          onClick={onClose}
          aria-label="알림 닫기"
        >
          닫기
        </button>
      </div>
    </div>
  )
}

export default AlertBanner
