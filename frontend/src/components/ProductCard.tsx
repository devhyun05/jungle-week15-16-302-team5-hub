type ProductCardProps = {
  title: string
  price: string
  location: string
  time: string
  likes: number
  comments: number
}

const ProductCard = ({
  title,
  price,
  location,
  time,
  likes,
  comments,
}: ProductCardProps) => {
  return (
    <article className="overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex h-56 items-center justify-center border-b border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100">
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
      </div>

      <div className="p-4">
        <h3 className="mb-2 text-base font-medium text-gray-800">{title}</h3>
        <p className="mb-2 text-lg font-semibold text-gray-950">{price}</p>
        <p className="mb-4 text-sm text-gray-500">
          {location} · {time}
        </p>

        <div className="border-t border-dashed border-gray-300 pt-3">
          <div className="flex gap-3 text-sm text-gray-500">
            <span>♡ {likes}</span>
            <span>💬 {comments}</span>
          </div>
        </div>
      </div>
    </article>
  )
}

export default ProductCard
