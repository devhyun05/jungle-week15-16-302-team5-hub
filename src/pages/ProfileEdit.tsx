import { useState } from "react"

const userProfile = {
  name: "이현성",
  email: "devhyun.jungle@gmail.com",
  joinedAt: "2024년 1월 가입",
  location: "정글 캠퍼스",
  introduction:
    "크래프톤 정글에서 학습 중입니다. 전자기기와 개발 서적 거래를 선호합니다.",
}

const ProfileEdit = () => {
  const [profileImage, setProfileImage] = useState("")

  const handleProfileImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setProfileImage(URL.createObjectURL(file))
  }

  return (
    <section className="mx-auto max-w-7xl px-4">
      {/* 페이지 상단 */}
      <div className="mb-6">
        <p className="mb-2 text-sm text-gray-500">마이페이지</p>
        <h1 className="text-2xl font-semibold text-gray-900">프로필 수정</h1>
      </div>

      {/* 프로필 수정 카드 */}
      <section className="rounded-lg border border-gray-300 bg-white p-8 shadow-sm">
        <div className="flex items-start gap-6">
          {/* 프로필 이미지 */}
          <div className="shrink-0">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-200 text-3xl font-semibold text-gray-600">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="프로필 미리보기"
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                "A"
              )}
            </div>

            <label className="mt-3 block cursor-pointer rounded-md border border-gray-300 px-3 py-2 text-center text-xs font-medium text-gray-600 hover:bg-gray-50">
              이미지 변경
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfileImageChange}
              />
            </label>

            <p className="mt-2 text-center text-xs text-gray-400">
              JPG, PNG 가능
            </p>
          </div>

          {/* 기본 정보 */}
          <div className="w-full">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  이름
                </span>

                <input
                  type="text"
                  className="mt-2 w-full rounded-md border border-gray-300 px-4 py-3 text-sm text-gray-800"
                  defaultValue={userProfile.name}
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  이메일
                </span>

                <input
                  type="email"
                  className="mt-2 w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-500"
                  defaultValue={userProfile.email}
                  readOnly
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  가입일
                </span>

                <input
                  type="text"
                  className="mt-2 w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-500"
                  defaultValue={userProfile.joinedAt}
                  readOnly
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  선호 거래 장소
                </span>

                <input
                  type="text"
                  className="mt-2 w-full rounded-md border border-gray-300 px-4 py-3 text-sm text-gray-800"
                  defaultValue={userProfile.location}
                />
              </label>
            </div>

            {/* 소개글 */}
            <label className="mt-5 block">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                소개글
              </span>

              <textarea
                className="mt-2 min-h-40 w-full resize-y rounded-md border border-gray-300 px-4 py-3 text-sm leading-6 text-gray-800"
                defaultValue={userProfile.introduction}
              />
            </label>

            {/* 버튼 영역 */}
            <div className="mt-8 flex justify-end gap-2 border-t border-dashed border-gray-300 pt-6">
              <button
                type="button"
                className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                취소
              </button>

              <button
                type="button"
                className="rounded-md bg-[#00C471] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#00A862]"
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
      </section>
    </section>
  )
}

export default ProfileEdit
