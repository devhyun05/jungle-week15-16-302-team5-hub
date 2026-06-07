const products = [
  {
    id: 1,
    title: "맥북 프로 14인치 M3",
    price: "2,200,000원",
    location: "서초구",
    time: "3분 전",
    likes: 12,
    comments: 3,
  },
  {
    id: 2,
    title: "나이키 에어포스1 270mm",
    price: "65,000원",
    location: "강남구",
    time: "15분 전",
    likes: 7,
    comments: 1,
  },
  {
    id: 3,
    title: "아이패드 프로 11인치",
    price: "850,000원",
    location: "마포구",
    time: "32분 전",
    likes: 24,
    comments: 8,
  },
  {
    id: 4,
    title: "다이슨 에어랩 완전세트",
    price: "430,000원",
    location: "용산구",
    time: "1시간 전",
    likes: 31,
    comments: 14,
  },
  {
    id: 5,
    title: "소니 WH-1000XM5 헤드폰",
    price: "280,000원",
    location: "송파구",
    time: "2시간 전",
    likes: 18,
    comments: 5,
  },
  {
    id: 6,
    title: "캠핑 의자 2개 세트",
    price: "45,000원",
    location: "은평구",
    time: "3시간 전",
    likes: 9,
    comments: 2,
  },
  {
    id: 7,
    title: "레고 테크닉 42083",
    price: "120,000원",
    location: "광진구",
    time: "5시간 전",
    likes: 15,
    comments: 4,
  },
  {
    id: 8,
    title: "닌텐도 스위치 OLED",
    price: "310,000원",
    location: "강동구",
    time: "7시간 전",
    likes: 22,
    comments: 6,
  },
]

const Home = () => {
  return (
    <>
      <form className="mx-auto max-w-2xl">
        <label
          htmlFor="search"
          className="block mb-2.5 text-sm font-medium text-heading sr-only"
        >
          Search
        </label>

        {/* 검색창 */}
        <div className="relative mb-5 rounded-2xl border border-gray-200 bg-white p-2 shadow-lg shadow-gray-200/70">
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-5">
            <svg
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
                d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>

          <input
            type="search"
            id="search"
            className="block h-14 w-full rounded-xl border border-transparent bg-gray-50 ps-12 pe-24 text-sm font-medium text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#A7F3D0] focus:bg-white focus:ring-4 focus:ring-[#ECFDF5]"
            placeholder="검색어를 입력하세요. 예: 맥북, 아이패드, 나이키"
            required
          />

          <button
            type="submit"
            className="absolute end-4 top-1/2 -translate-y-1/2 rounded-lg bg-[#00C471] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#00A862] focus:outline-none focus:ring-4 focus:ring-[#A7F3D0]"
          >
            검색
          </button>
        </div>

        {/* 카테고리 버튼 UI */}
        <div>
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white"
            >
              전체
            </button>

            <button
              type="button"
              className="rounded-lg border-2 border-gray-400 bg-white px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50"
            >
              전자기기
            </button>

            <button
              type="button"
              className="rounded-lg border-2 border-gray-400 bg-white px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50"
            >
              의류/잡화
            </button>

            <button
              type="button"
              className="rounded-lg border-2 border-gray-400 bg-white px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50"
            >
              도서
            </button>

            <button
              type="button"
              className="rounded-lg border-2 border-gray-400 bg-white px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50"
            >
              가구/인테리어
            </button>

            <button
              type="button"
              className="rounded-lg border-2 border-gray-400 bg-white px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50"
            >
              스포츠
            </button>

            <button
              type="button"
              className="rounded-lg border-2 border-gray-400 bg-white px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50"
            >
              기타
            </button>
          </div>
        </div>
      </form>

      {/* 중고 거래 목록 */}
      <section className="mx-auto mt-10 max-w-7xl px-4">
        <div className="mb-5 flex items-center justify-between border-b border-dashed border-gray-300 pb-3">
          <h2 className="text-xl font-semibold text-gray-800">
            중고 거래 목록
          </h2>

          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100"
            >
              최신순
            </button>
            <button
              type="button"
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100"
            >
              인기순
            </button>
            <button
              type="button"
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100"
            >
              가격낮은순
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <article
              key={product.id}
              className="overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              {/* 이미지 자리 */}
              <div className="relative h-56 border-b border-gray-300 bg-gray-50">
                <div className="absolute left-0 top-0 h-full w-full">
                  <div className="absolute left-0 top-0 h-[1.5px] w-[145%] origin-left rotate-45 bg-gray-400" />
                  <div className="absolute right-0 top-0 h-[1.5px] w-[145%] origin-right -rotate-45 bg-gray-400" />
                </div>
              </div>

              {/* 상품 정보 */}
              <div className="p-4">
                <h3 className="mb-2 text-base font-medium text-gray-800">
                  {product.title}
                </h3>

                <p className="mb-2 text-lg font-semibold text-gray-950">
                  {product.price}
                </p>

                <p className="mb-4 text-sm text-gray-500">
                  {product.location} · {product.time}
                </p>

                <div className="border-t border-dashed border-gray-300 pt-3">
                  <div className="flex gap-3 text-sm text-gray-500">
                    <span>♡ {product.likes}</span>
                    <span>💬 {product.comments}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

export default Home
