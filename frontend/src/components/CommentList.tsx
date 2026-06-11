const comments = [
  {
    id: 1,
    author: "frank",
    content: "충전기 포함인가요? 오늘 저녁 거래 가능하면 연락 주세요.",
    time: "10분 전",
  },
  {
    id: 2,
    author: "grace",
    content: "사진보다 상태가 좋아 보여요. 혹시 네고 가능한가요?",
    time: "25분 전",
  },
  {
    id: 3,
    author: "henry",
    content: "예약 불발되면 줄 서겠습니다.",
    time: "1시간 전",
  },
]

const CommentList = () => {
  return (
    <section className="rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-lg font-semibold text-gray-800">댓글 문의</h2>

      <div className="mb-6 grid grid-cols-[1fr_auto] gap-3">
        <input
          type="text"
          className="rounded-md border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400"
          placeholder="문의 내용을 입력하세요"
        />
        <button
          type="button"
          className="rounded-md bg-[#00C471] px-5 py-3 text-sm font-semibold text-white hover:bg-[#00A862]"
        >
          등록
        </button>
      </div>

      <div className="space-y-4">
        {comments.map((comment) => (
          <article
            key={comment.id}
            className="border-t border-dashed border-gray-300 pt-4"
          >
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-600">
                {comment.author[0].toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <strong className="text-sm text-gray-800">
                    {comment.author}
                  </strong>
                  <span className="text-xs text-gray-400">{comment.time}</span>
                </div>
                <p className="mt-1 text-sm leading-6 text-gray-500">
                  {comment.content}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default CommentList
