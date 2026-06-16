import { useEffect, useState } from "react"
import { Link } from "react-router"
import { listPosts } from "../api/posts"
import type { FormEvent } from "react"
import type { Post, PostCategory } from "../types/post"

const categories = [
  "전체",
  "전자기기",
  "의류/잡화",
  "도서",
  "가구/인테리어",
  "스포츠",
  "기타",
] as const

const sortOptions = ["최신순", "인기순", "가격낮은순"] as const
type SortOption = (typeof sortOptions)[number]

const sortMap = {
  최신순: "latest",
  인기순: "popular",
  가격낮은순: "price_low",
} as const

const formatPrice = (price: number) => `${price.toLocaleString("ko-KR")}원`

const formatTime = (createdAt: string) => {
  const createdTime = new Date(createdAt).getTime()
  const diffMinutes = Math.floor((Date.now() - createdTime) / 1000 / 60)

  if (diffMinutes < 1) {
    return "방금 전"
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`
  }

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours}시간 전`
  }

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}일 전`
}

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [selectedSortOption, setSelectedSortOption] =
    useState<SortOption>("최신순")
  const [searchKeyword, setSearchKeyword] = useState("")
  const [submittedKeyword, setSubmittedKeyword] = useState("")
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    let isMounted = true

    const fetchPosts = async () => {
      setIsLoading(true)
      setErrorMessage("")

      try {
        const posts = await listPosts({
          keyword: submittedKeyword || undefined,
          category:
            selectedCategory === "전체"
              ? undefined
              : (selectedCategory as PostCategory),
          sort: sortMap[selectedSortOption],
        })

        if (isMounted) {
          setPosts(posts)
        }
      } catch {
        if (isMounted) {
          setErrorMessage("게시글 목록을 불러오지 못했습니다.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchPosts()

    return () => {
      isMounted = false
    }
  }, [selectedCategory, selectedSortOption, submittedKeyword])

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmittedKeyword(searchKeyword.trim())
  }

  return (
    <>
      <form
        className="mx-auto max-w-2xl"
        onSubmit={handleSearchSubmit}
      >
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
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
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
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category
                    ? "rounded-lg border-2 border-gray-400 px-4 py-2 text-sm font-semibold text-white bg-gray-800"
                    : "rounded-lg border-2 border-gray-400 px-4 py-2 text-sm font-semibold text-gray-500 bg-white"
                }
              >
                {category}
              </button>
            ))}
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
            {sortOptions.map((sortOption) => (
              <button
                key={sortOption}
                type="button"
                onClick={() => setSelectedSortOption(sortOption)}
                className={
                  selectedSortOption === sortOption
                    ? "rounded-lg border-2 border-gray-400 px-4 py-2 text-sm font-semibold text-white bg-gray-800"
                    : "rounded-lg border-2 border-gray-400 px-4 py-2 text-sm font-semibold text-gray-500 bg-white"
                }
              >
                {sortOption}
              </button>
            ))}
          </div>
        </div>

        {isLoading && (
          <div className="rounded-lg border border-gray-300 bg-white py-16 text-center text-sm font-medium text-gray-400">
            게시글을 불러오고 있습니다.
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 py-16 text-center text-sm font-medium text-red-500">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && posts.length === 0 && (
          <div className="rounded-lg border border-gray-300 bg-white py-16 text-center text-sm font-medium text-gray-400">
            등록된 게시글이 없습니다.
          </div>
        )}

        {!isLoading && !errorMessage && posts.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/post-details/${post.id}`}
                className="overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                {/* 이미지 자리 */}
                <div className="flex h-56 items-center justify-center overflow-hidden border-b border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100">
                  {post.images[0] ? (
                    <img
                      src={post.images[0].image_url}
                      alt=""
                      className="h-full w-full object-contain p-3"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-300 shadow-sm">
                      <svg
                        className="h-6 w-6"
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
                  )}
                </div>

                {/* 상품 정보 */}
                <div className="p-4">
                  <h3 className="mb-2 text-base font-medium text-gray-800">
                    {post.title}
                  </h3>

                  <span className="mb-2 inline-flex rounded-full border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-500">
                    {post.category}
                  </span>

                  <p className="mb-2 text-lg font-semibold text-gray-950">
                    {formatPrice(post.price)}
                  </p>

                  <p className="mb-4 text-sm text-gray-500">
                    {post.trade_location} · {formatTime(post.created_at)}
                  </p>

                  <div className="border-t border-dashed border-gray-300 pt-3">
                    <div className="flex gap-3 text-sm text-gray-500">
                      <span>♡ {post.like_count}</span>
                      <span>💬 {post.comment_count}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

export default Home
