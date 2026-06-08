import { useState } from "react"
import { Link } from "react-router"

const posts = [
  {
    id: 1,
    tags: ["전자기기", "판매중"],
    title: "맥북 프로 14인치 M3",
    price: "2,200,000원",
    location: "서초구",
    date: "2026년 6월 5일",
  },
  {
    id: 2,
    tags: ["도서", "거래완료"],
    title: "클린 코드 + 객체지향의 사실과 오해",
    price: "28,000원",
    location: "마포구",
    date: "2026년 5월 28일",
  },
  {
    id: 3,
    tags: ["스포츠", "예약중"],
    title: "캠핑 의자 2개 세트",
    price: "45,000원",
    location: "은평구",
    date: "2026년 5월 18일",
  },
]

const inquiries = [
  {
    id: 1,
    productTitle: "맥북 프로 14인치 M3",
    question: "아직 판매 중인가요? 배터리 사이클도 알 수 있을까요?",
    answer: "네, 아직 판매 중입니다. 배터리 사이클은 83회입니다.",
    status: "답변완료",
    date: "2026.06.08",
  },
  {
    id: 2,
    productTitle: "아이패드 프로 11인치",
    question: "직거래 가능 지역이 어디인가요?",
    answer: "",
    status: "답변대기",
    date: "2026.06.07",
  },
  {
    id: 3,
    productTitle: "나이키 에어포스1 270mm",
    question: "실착 횟수는 어느 정도인가요?",
    answer: "3번 정도 착용했습니다.",
    status: "답변완료",
    date: "2026.06.06",
  },
]
const Profile = () => {
  const [activeTab, setActiveTab] = useState("posts")

  return (
    <section className="mx-auto max-w-7xl px-4">
      {/* 프로필 카드 */}
      <div className="rounded-lg border border-gray-300 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between gap-6">
          <div className="flex gap-6">
            {/* 아바타 */}
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-200 text-3xl font-semibold text-gray-600">
              A
            </div>

            {/* 사용자 정보 */}
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">이현성</h1>
              <p className="mt-2 text-sm text-gray-500">
                devhyun.jungle@gmail.com
              </p>
              <p className="mt-2 text-sm text-gray-500">2024년 1월 가입</p>
            </div>
          </div>

          <Link
            to="/profile-edit"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            프로필 수정
          </Link>
        </div>

        {/* 프로필 통계 */}
        <div className="mt-8 border-t border-dashed border-gray-300 pt-6">
          <div className="grid max-w-xl grid-cols-2 gap-6 sm:grid-cols-4">
            <div>
              <p className="text-lg font-semibold text-gray-950">3</p>
              <p className="mt-1 text-xs text-gray-500">작성글</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-950">1</p>
              <p className="mt-1 text-xs text-gray-500">판매중</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-950">1</p>
              <p className="mt-1 text-xs text-gray-500">예약중</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-950">1</p>
              <p className="mt-1 text-xs text-gray-500">거래완료</p>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="mt-10 border-b border-gray-300">
        <div className="flex gap-8">
          <button
            className={`border-b-2 px-2 pb-4 text-sm font-semibold transition ${
              activeTab === "posts"
                ? "border-gray-800 text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
            onClick={() => {
              setActiveTab("posts")
            }}
          >
            📄 내가 쓴 글
          </button>
          <button
            className={`border-b-2 px-2 pb-4 text-sm font-semibold transition ${
              activeTab === "inquiries"
                ? "border-gray-800 text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
            onClick={() => {
              setActiveTab("inquiries")
            }}
          >
            💬 댓글 내역
          </button>
        </div>
      </div>

      {/* 내가 쓴 글 목록 */}
      <div className="mt-4 space-y-4">
        {activeTab === "posts" ? (
          <>
            {/* 게시글 목록 헤더 */}
            <div className="mt-8 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-400">작성글 3개</p>

              <Link
                to="/post-create"
                className="rounded-md bg-[#00C471] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#00A862]"
              >
                새 글 작성
              </Link>
            </div>

            {/* 내가 쓴 글 목록 */}
            <div className="mt-4 space-y-4">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="rounded-lg border border-gray-300 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <Link
                      to={`/post-details/${post.id}`}
                      className="block flex-1"
                    >
                      <div className="mb-3 flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-500"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <h2 className="text-lg font-semibold text-gray-900">
                        {post.title}
                      </h2>

                      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-400">
                        <span>{post.price}</span>
                        <span>·</span>
                        <span>{post.location}</span>
                        <span>·</span>
                        <span>{post.date}</span>
                      </div>
                    </Link>

                    <div className="flex gap-3 text-gray-400">
                      <button className="hover:text-blue-500" type="button">
                        ✎
                      </button>
                      <button className="hover:text-red-500" type="button">
                        🗑
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* 문의 내역 헤더 */}
            <div className="mt-8 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-400">
                댓글 내역 3개
              </p>
            </div>

            {/* 문의 내역 목록 */}
            <div className="mt-4 space-y-4">
              {inquiries.map((inquiry) => (
                <article
                  key={inquiry.id}
                  className="rounded-lg border border-gray-300 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            inquiry.status === "답변완료"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {inquiry.status}
                        </span>

                        <span className="text-sm text-gray-400">
                          {inquiry.date}
                        </span>
                      </div>

                      <h2 className="text-lg font-semibold text-gray-900">
                        {inquiry.productTitle}
                      </h2>

                      <p className="mt-3 text-sm text-gray-600">
                        {inquiry.question}
                      </p>

                      {inquiry.answer && (
                        <div className="mt-4 rounded-md bg-gray-50 p-4 text-sm text-gray-600">
                          <p className="mb-1 font-semibold text-gray-800">
                            판매자 답변
                          </p>
                          <p>{inquiry.answer}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 text-gray-400">
                      <button className="hover:text-blue-500" type="button">
                        ✎
                      </button>
                      <button className="hover:text-red-500" type="button">
                        🗑
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default Profile
