const greenWait = "animate-pulse bg-emerald-400";
const greyWait = "animate-pulse bg-neutral-200 dark:bg-neutral-700";

export const ProfileMediaGridSkeleton = ({ cells = 18 }: { cells?: number }) => (
  <div className="grid grid-cols-3 gap-0.5" aria-hidden="true">
    {Array.from({ length: cells }).map((_, index) => (
      <div key={index} className={`aspect-square ${greyWait}`} />
    ))}
  </div>
);

const ProfilePageSkeleton = () => (
  <div className="min-h-screen bg-card pb-10 sm:pb-20" aria-busy="true" aria-label="Chargement du profil">
    <div className="border-b border-border bg-card">
      <div className="mx-auto max-w-5xl sm:px-4 md:px-6">
        <div className={`relative h-36 overflow-hidden sm:h-48 md:h-56 ${greenWait}`}>
          <div className="absolute left-3 right-3 top-3 z-10 flex items-center gap-2">
            <div className="h-9 w-9 shrink-0 rounded-full bg-black/20" />
            <div className={`h-7 w-28 rounded-full ${greenWait} ring-1 ring-white/30`} />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex items-start gap-2">
          <div
            className={`relative z-10 -mt-14 h-28 w-28 shrink-0 rounded-full border-4 border-card sm:-mt-16 sm:h-36 sm:w-36 ${greenWait}`}
          />
          <div className={`relative z-10 mt-1 h-8 w-[4.5rem] rounded-full ${greyWait}`} />
        </div>
        <div className={`mt-3 h-8 w-44 rounded-md sm:h-9 sm:w-56 ${greenWait}`} />
        <div className={`mt-2 h-4 w-36 rounded ${greyWait}`} />
        <div className="mt-4 space-y-2.5 pb-1">
          <div className={`h-3.5 w-full rounded-full ${greyWait}`} />
          <div className={`h-3.5 w-[94%] rounded-full ${greyWait}`} />
          <div className={`h-3.5 w-[62%] rounded-full ${greyWait}`} />
        </div>
        <div className="mt-4 flex w-full items-start gap-1.5 pb-4 sm:gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex min-w-0 flex-1 flex-col items-center gap-1.5 sm:flex-none sm:w-14">
              <div className={`h-10 w-10 rounded-full border border-border sm:h-11 sm:w-11 ${greyWait}`} />
              <div className={`h-2.5 w-10 rounded-full ${greyWait}`} />
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="mx-auto max-w-5xl px-3 sm:px-4 md:px-6">
      <div className="mb-1 flex border-b border-border">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex flex-1 items-center justify-center gap-1.5 px-2 py-2.5">
            <div className={`h-4 w-5 rounded ${greyWait}`} />
            <div className={`h-4 w-16 rounded ${greyWait}`} />
          </div>
        ))}
      </div>
      <ProfileMediaGridSkeleton />
    </div>
  </div>
);

export default ProfilePageSkeleton;
