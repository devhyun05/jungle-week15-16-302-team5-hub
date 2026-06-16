type ConfirmDialogProps = {
  isOpen: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

const ConfirmDialog = ({
  isOpen,
  title,
  description,
  confirmLabel = "확인",
  cancelLabel = "취소",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  if (!isOpen) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/45 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.28)]">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-500">
          <svg
            className="h-5 w-5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v5m0 4h.01M10.3 4.3 2.6 18a1.5 1.5 0 0 0 1.3 2.2h16.2a1.5 1.5 0 0 0 1.3-2.2L13.7 4.3a2 2 0 0 0-3.4 0Z"
            />
          </svg>
        </div>

        <h2
          id="confirm-dialog-title"
          className="mt-4 text-lg font-semibold text-gray-950"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className="rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isLoading ? "처리 중" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
