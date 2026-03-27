// T031: Dashboard skeleton shown while server component fetches data
export default function DashboardLoading() {
  return (
    <div className="min-h-screen pt-24 px-6 pb-10 md:px-10 bg-[#171717]">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Welcome banner skeleton */}
        <div className="space-y-2">
          <div className="h-8 w-64 rounded-xl bg-white/5 animate-pulse" />
          <div className="h-4 w-40 rounded-lg bg-white/5 animate-pulse" />
        </div>

        {/* Cards row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl p-6 bg-[#222222] space-y-3">
              <div className="h-3 w-20 rounded bg-white/10 animate-pulse" />
              <div className="h-8 w-16 rounded bg-white/10 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Career paths skeleton */}
        <div className="rounded-2xl p-6 bg-[#222222] space-y-4">
          <div className="h-5 w-36 rounded bg-white/10 animate-pulse" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 w-40 rounded bg-white/10 animate-pulse" />
                <div className="h-4 w-16 rounded bg-white/10 animate-pulse" />
              </div>
              <div className="h-2 rounded-full bg-white/10 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Skill gap skeleton */}
        <div className="rounded-2xl p-6 bg-[#222222] space-y-3">
          <div className="h-5 w-36 rounded bg-white/10 animate-pulse" />
          <div className="flex flex-wrap gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-6 w-20 rounded-full bg-white/10 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
