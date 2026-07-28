import PostForm from "../components/PostForm"

const PostEdit = () => {
  return (
    <section className="mx-auto max-w-4xl px-4">
      {/* 페이지 상단 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="mb-2 text-sm text-gray-500">중고 거래 글 수정</p>
          <h1 className="text-2xl font-semibold text-gray-900">
            판매글 수정
          </h1>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            임시저장
          </button>

          <button
            type="submit"
            form="post-edit-form"
            className="rounded-md bg-[#00C471] px-4 py-2 text-sm font-medium text-white hover:bg-[#00A862]"
          >
            수정 완료
          </button>
        </div>
      </div>

      {/* 수정 폼 */}
      <div>
        <PostForm mode="edit" formId="post-edit-form" />
      </div>
    </section>
  )
}

export default PostEdit
