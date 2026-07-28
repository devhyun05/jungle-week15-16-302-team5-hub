import CommentList from "../components/CommentList"
import { useParams } from "react-router"

const posts = [
  {
    id: 1,
    title: "맥북 프로 14인치 M3",
    price: "2,200,000원",
    location: "서초구",
    time: "3분 전",
    seller: "alice",
    category: "전자기기",
    status: "판매중",
    likes: 12,
    comments: 3,
    views: 382,
    description:
      "정글 프로젝트 기간에 사용한 맥북입니다. 충전기와 박스 포함이고 생활 기스는 거의 없습니다. 캠퍼스 근처 직거래를 선호합니다.",
  },
  {
    id: 2,
    title: "나이키 에어포스1 270mm",
    price: "65,000원",
    location: "강남구",
    time: "15분 전",
    seller: "brad",
    category: "의류/잡화",
    status: "판매중",
    likes: 7,
    comments: 1,
    views: 126,
    description:
      "몇 번 신지 않은 에어포스입니다. 사이즈가 맞지 않아 판매합니다. 캠퍼스 근처에서 직거래 가능합니다.",
  },
  {
    id: 3,
    title: "아이패드 프로 11인치",
    price: "850,000원",
    location: "마포구",
    time: "32분 전",
    seller: "chris",
    category: "전자기기",
    status: "예약중",
    likes: 24,
    comments: 8,
    views: 415,
    description:
      "필기와 개발 문서 확인용으로 사용했습니다. 케이스와 펜슬 포함이며 배터리 상태 양호합니다.",
  },
  {
    id: 4,
    title: "다이슨 에어랩 완전세트",
    price: "430,000원",
    location: "용산구",
    time: "1시간 전",
    seller: "dana",
    category: "기타",
    status: "판매중",
    likes: 31,
    comments: 14,
    views: 533,
    description:
      "구성품 모두 보관 중인 다이슨 에어랩입니다. 사용 횟수는 많지 않고 직접 확인 후 거래 가능합니다.",
  },
  {
    id: 5,
    title: "소니 WH-1000XM5 헤드폰",
    price: "280,000원",
    location: "송파구",
    time: "2시간 전",
    seller: "eric",
    category: "전자기기",
    status: "판매중",
    likes: 18,
    comments: 5,
    views: 291,
    description:
      "노이즈 캔슬링 헤드폰입니다. 박스와 케이블 포함이고 실내에서만 사용했습니다.",
  },
  {
    id: 6,
    title: "캠핑 의자 2개 세트",
    price: "45,000원",
    location: "은평구",
    time: "3시간 전",
    seller: "finn",
    category: "스포츠",
    status: "판매중",
    likes: 9,
    comments: 2,
    views: 144,
    description:
      "가볍게 접어서 들고 다니기 좋은 캠핑 의자 2개 세트입니다. 사용감은 조금 있습니다.",
  },
  {
    id: 7,
    title: "레고 테크닉 42083",
    price: "120,000원",
    location: "광진구",
    time: "5시간 전",
    seller: "grace",
    category: "기타",
    status: "판매중",
    likes: 15,
    comments: 4,
    views: 205,
    description:
      "조립 후 전시만 했던 레고 테크닉입니다. 설명서와 여분 부품 일부 보관 중입니다.",
  },
  {
    id: 8,
    title: "닌텐도 스위치 OLED",
    price: "310,000원",
    location: "강동구",
    time: "7시간 전",
    seller: "henry",
    category: "전자기기",
    status: "거래완료",
    likes: 22,
    comments: 6,
    views: 377,
    description:
      "OLED 모델 닌텐도 스위치입니다. 기본 구성품 포함이며 화면과 조이콘 상태 좋습니다.",
  },
]

const relatedPosts = [
  {
    id: 1,
    title: "아이패드 프로 11인치",
    price: "850,000원",
  },
  {
    id: 2,
    title: "소니 WH-1000XM5 헤드폰",
    price: "280,000원",
  },
  {
    id: 3,
    title: "닌텐도 스위치 OLED",
    price: "310,000원",
  },
]

const PostDetailPage = () => {
  const { postId } = useParams()
  const post =
    posts.find((postItem) => postItem.id === Number(postId)) ?? posts[0]

  return (
    <section className="mx-auto max-w-7xl px-4">
      {/* 상세 페이지 레이아웃 */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          {/* 상품 상세 카드 */}
          <article className="overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm">
            <div className="flex h-96 items-center justify-center border-b border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-300 shadow-sm">
                <svg
                  className="h-9 w-9"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M4 16l4.5-4.5a2 2 0 0 1 2.8 0L16 16m-2-2 1.5-1.5a2 2 0 0 1 2.8 0L20 14m-16 5h16a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Zm3-11h.01"
                  />
                </svg>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-500">
                  {post.category}
                </span>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                  {post.status}
                </span>
              </div>

              <h1 className="text-2xl font-semibold text-gray-900">
                {post.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <span>{post.seller}</span>
                <span>·</span>
                <span>{post.location}</span>
                <span>·</span>
                <span>{post.time}</span>
              </div>

              <p className="mt-6 text-3xl font-semibold text-gray-950">
                {post.price}
              </p>

              <p className="mt-6 leading-7 text-gray-600">{post.description}</p>

              <div className="mt-8 border-t border-dashed border-gray-300 pt-4">
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span>♡ {post.likes}</span>
                  <span>💬 {post.comments}</span>
                  <span>👁 {post.views}</span>
                </div>
              </div>
            </div>
          </article>

          {/* 댓글 영역 */}
          <CommentList />
        </div>

        {/* 사이드바 */}
        <aside className="space-y-6">
          <section className="rounded-lg border border-gray-300 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">판매자</h2>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-600">
                A
              </div>

              <div>
                <p className="font-semibold text-gray-900">{post.seller}</p>
                <p className="text-sm text-gray-500">정글 구성원</p>
              </div>
            </div>

            <button
              type="button"
              className="mt-5 w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              프로필 보기
            </button>
          </section>

          <section className="rounded-lg border border-gray-300 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              관련 상품
            </h2>

            <div className="space-y-3">
              {relatedPosts.map((relatedPost) => (
                <article
                  key={relatedPost.id}
                  className="rounded-md border border-gray-200 p-3"
                >
                  <h3 className="text-sm font-medium text-gray-800">
                    {relatedPost.title}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-gray-950">
                    {relatedPost.price}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </section>
  )
}

export default PostDetailPage
