import { useEffect, useRef, useState } from "react"
import type { ChangeEvent, FormEventHandler } from "react"
import { assistPostWriting } from "../api/ai"
import type { PostWritingAction, RagSource } from "../api/ai"
import type { Post } from "../types/post"

type PostFormProps = {
  mode: "create" | "edit"
  formId?: string
  initialValues?: Post
  onSubmit?: FormEventHandler<HTMLFormElement>
}

const PostForm = ({
  mode,
  formId = `post-${mode}-form`,
  initialValues,
  onSubmit,
}: PostFormProps) => {
  const formRef = useRef<HTMLFormElement | null>(null)
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [imageFileName, setImageFileName] = useState("")
  const [isAssisting, setIsAssisting] = useState(false)
  const [assistantMessage, setAssistantMessage] = useState("")
  const [assistantTags, setAssistantTags] = useState<string[]>([])
  const [assistantSources, setAssistantSources] = useState<RagSource[]>([])

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl)
      }
    }
  }, [imagePreviewUrl])

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const imageFile = event.target.files?.[0]

    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl)
    }

    if (!imageFile) {
      setImagePreviewUrl(null)
      setImageFileName("")
      return
    }

    setImagePreviewUrl(URL.createObjectURL(imageFile))
    setImageFileName(imageFile.name)
  }

  const handleImageRemove = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl)
    }

    if (imageInputRef.current) {
      imageInputRef.current.value = ""
    }

    setImagePreviewUrl(null)
    setImageFileName("")
  }

  const getFormInputValue = (name: string) => {
    const input = formRef.current?.elements.namedItem(name)
    if (
      input instanceof HTMLInputElement ||
      input instanceof HTMLTextAreaElement ||
      input instanceof HTMLSelectElement
    ) {
      return input.value
    }

    return ""
  }

  const setDescriptionValue = (value: string) => {
    const descriptionInput = formRef.current?.elements.namedItem("description")
    if (descriptionInput instanceof HTMLTextAreaElement) {
      descriptionInput.value = value
    }
  }

  const handleWritingAssist = async (action: PostWritingAction) => {
    setIsAssisting(true)
    setAssistantMessage("")

    const price = getFormInputValue("price").replaceAll(",", "")

    try {
      const result = await assistPostWriting({
        action,
        title: getFormInputValue("title"),
        description: getFormInputValue("description") || null,
        category: getFormInputValue("category") || null,
        price: price ? Number(price) : null,
        trade_location: getFormInputValue("trade_location") || null,
      })

      if (action !== "suggest_tags") {
        setDescriptionValue(result.description)
      }

      setAssistantTags(result.suggested_tags)
      setAssistantSources(result.sources)
      setAssistantMessage("AI 작성 도구가 내용을 반영했습니다.")
    } catch {
      setAssistantMessage("AI 작성 도구를 실행하지 못했습니다.")
    } finally {
      setIsAssisting(false)
    }
  }

  return (
    <form
      ref={formRef}
      id={formId}
      onSubmit={onSubmit}
      className="rounded-lg border border-gray-300 bg-white shadow-sm"
    >
      {/* 제목 입력 */}
      <div className="border-b border-gray-300 p-6">
        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400">
          제목
          <span className="ml-1 text-red-500">*</span>
        </label>

        <input
          name="title"
          type="text"
          className="mt-3 w-full border-0 text-2xl font-semibold text-gray-900 outline-none placeholder:text-gray-300"
          placeholder="상품명을 입력하세요"
          defaultValue={initialValues?.title ?? ""}
          required
          minLength={2}
          maxLength={80}
          onInvalid={(event) => {
            event.currentTarget.setCustomValidity(
              "제목은 2자 이상 입력해주세요.",
            )
          }}
          onInput={(event) => {
            event.currentTarget.setCustomValidity("")
          }}
        />
      </div>

      {/* 기본 정보 입력 */}
      <div className="grid gap-5 border-b border-gray-300 p-6 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            가격
            <span className="ml-1 text-red-500">*</span>
          </span>

          <input
            name="price"
            type="text"
            inputMode="numeric"
            className="mt-2 w-full rounded-md border border-gray-300 px-4 py-3 text-sm text-gray-800"
            placeholder="예: 2,200,000"
            defaultValue={
              initialValues
                ? initialValues.price.toLocaleString("ko-KR")
                : ""
            }
            required
            pattern="[0-9,]*"
            title="가격은 숫자와 쉼표만 입력할 수 있습니다."
            onInvalid={(event) => {
              event.currentTarget.setCustomValidity(
                "가격은 숫자와 쉼표만 입력해주세요.",
              )
            }}
            onInput={(event) => {
              event.currentTarget.setCustomValidity("")
            }}
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            거래 장소
            <span className="ml-1 text-red-500">*</span>
          </span>

          <input
            name="trade_location"
            type="text"
            className="mt-2 w-full rounded-md border border-gray-300 px-4 py-3 text-sm text-gray-800"
            placeholder="예: 정글 캠퍼스 라운지"
            defaultValue={initialValues?.trade_location ?? ""}
            required
            maxLength={40}
            onInvalid={(event) => {
              event.currentTarget.setCustomValidity("거래 장소를 입력해주세요.")
            }}
            onInput={(event) => {
              event.currentTarget.setCustomValidity("")
            }}
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            카테고리
            <span className="ml-1 text-red-500">*</span>
          </span>

          <select
            name="category"
            className="mt-2 w-full rounded-md border border-gray-300 px-4 py-3 text-sm text-gray-800"
            defaultValue={initialValues?.category ?? "전자기기"}
            required
          >
            <option>전자기기</option>
            <option>의류/잡화</option>
            <option>도서</option>
            <option>가구/인테리어</option>
            <option>스포츠</option>
            <option>기타</option>
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            거래 상태
            <span className="ml-1 text-red-500">*</span>
          </span>

          <select
            name="status"
            className="mt-2 w-full rounded-md border border-gray-300 px-4 py-3 text-sm text-gray-800"
            defaultValue={initialValues?.status ?? "selling"}
            required
          >
            <option value="selling">판매중</option>
            <option value="reserved">예약중</option>
            <option value="sold">거래완료</option>
          </select>
        </label>
      </div>

      {/* 이미지 업로드 영역 */}
      <div className="border-b border-gray-300 p-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
          이미지
        </p>

        <label className="relative flex min-h-52 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-400 hover:bg-gray-100">
          {imagePreviewUrl ? (
            <img
              src={imagePreviewUrl}
              alt="선택한 상품 이미지 미리보기"
              className="h-64 max-h-64 w-full object-contain p-3"
            />
          ) : (
            <span>상품 이미지를 선택해주세요</span>
          )}

          <input
            id={`${formId}-image`}
            ref={imageInputRef}
            name="image"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </label>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-gray-400">
            {imageFileName || "JPG, PNG 파일을 선택할 수 있습니다."}
          </p>

          {imagePreviewUrl && (
            <button
              type="button"
              onClick={handleImageRemove}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50"
            >
              이미지 제거
            </button>
          )}
        </div>
      </div>

      {/* 설명 입력 */}
      <div className="p-6">
        {/* AI 작성 도구 */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              AI 작성 도구
            </p>
            <p className="mt-1 text-xs text-gray-400">
              작성한 설명을 기준으로 AI 도움을 받을 수 있습니다.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isAssisting}
              onClick={() => handleWritingAssist("refine")}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50"
            >
              {isAssisting ? "실행 중" : "문장 다듬기"}
            </button>

            <button
              type="button"
              disabled={isAssisting}
              onClick={() => handleWritingAssist("fix_typos")}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50"
            >
              오타 수정
            </button>

            <button
              type="button"
              disabled={isAssisting}
              onClick={() => handleWritingAssist("suggest_tags")}
              className="rounded-md bg-[#00C471] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#00A862]"
            >
              태그 추천
            </button>
          </div>
        </div>

        {(assistantMessage || assistantTags.length > 0) && (
          <div className="mb-4 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3">
            {assistantMessage && (
              <p className="text-xs font-medium text-emerald-700">
                {assistantMessage}
              </p>
            )}

            {assistantTags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {assistantTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-emerald-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {assistantSources.length > 0 && (
              <p className="mt-2 text-xs text-emerald-700">
                유사 판매글 {assistantSources.length}개를 참고했습니다.
              </p>
            )}
          </div>
        )}

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            설명
          </span>

          <textarea
            name="description"
            className="mt-3 min-h-72 w-full resize-y rounded-md border border-gray-300 px-4 py-3 text-sm leading-6 text-gray-800 placeholder:text-gray-400"
            placeholder="상품 상태, 구성품, 거래 희망 시간 등을 적어주세요."
            defaultValue={initialValues?.description ?? ""}
            maxLength={1000}
          />
        </label>
      </div>
    </form>
  )
}

export default PostForm
