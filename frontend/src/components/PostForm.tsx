type PostFormProps = {
  mode: "create" | "edit"
  formId?: string
}

const PostForm = ({ mode, formId = `post-${mode}-form` }: PostFormProps) => {
  return (
    <form
      id={formId}
      className="rounded-lg border border-gray-300 bg-white shadow-sm"
    >
      {/* 제목 입력 */}
      <div className="border-b border-gray-300 p-6">
        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400">
          제목
          <span className="ml-1 text-red-500">*</span>
        </label>

        <input
          type="text"
          className="mt-3 w-full border-0 text-2xl font-semibold text-gray-900 outline-none placeholder:text-gray-300"
          placeholder="상품명을 입력하세요"
          defaultValue={mode === "edit" ? "맥북 프로 14인치 M3" : ""}
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
            type="text"
            inputMode="numeric"
            className="mt-2 w-full rounded-md border border-gray-300 px-4 py-3 text-sm text-gray-800"
            placeholder="예: 2,200,000"
            defaultValue={mode === "edit" ? "2,200,000" : ""}
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
            type="text"
            className="mt-2 w-full rounded-md border border-gray-300 px-4 py-3 text-sm text-gray-800"
            placeholder="예: 정글 캠퍼스 라운지"
            defaultValue={mode === "edit" ? "서초구" : ""}
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
            className="mt-2 w-full rounded-md border border-gray-300 px-4 py-3 text-sm text-gray-800"
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
            className="mt-2 w-full rounded-md border border-gray-300 px-4 py-3 text-sm text-gray-800"
            required
          >
            <option>판매중</option>
            <option>예약중</option>
            <option>거래완료</option>
          </select>
        </label>
      </div>

      {/* 이미지 업로드 영역 */}
      <div className="border-b border-gray-300 p-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
          이미지
        </p>

        <label className="flex h-40 cursor-pointer items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-400 hover:bg-gray-100">
          상품 이미지 업로드 영역
          <input
            type="file"
            accept="image/*"
            className="hidden"
          />
        </label>

        <p className="mt-2 text-xs text-gray-400">
          JPG, PNG 파일을 선택할 수 있습니다.
        </p>
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
              className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50"
            >
              문장 다듬기
            </button>

            <button
              type="button"
              className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50"
            >
              오타 수정
            </button>

            <button
              type="button"
              className="rounded-md bg-[#00C471] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#00A862]"
            >
              태그 추천
            </button>
          </div>
        </div>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            설명
          </span>

          <textarea
            className="mt-3 min-h-72 w-full resize-y rounded-md border border-gray-300 px-4 py-3 text-sm leading-6 text-gray-800 placeholder:text-gray-400"
            placeholder="상품 상태, 구성품, 거래 희망 시간 등을 적어주세요."
            defaultValue={
              mode === "edit"
                ? "정글 프로젝트 기간에 사용한 맥북입니다. 충전기와 박스 포함, 생활 기스 거의 없습니다."
                : ""
            }
            maxLength={1000}
          />
        </label>
      </div>
    </form>
  )
}

export default PostForm
