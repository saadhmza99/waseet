import logo from "@/assets/sifarah-logo.png";
import { useNavigate } from "react-router-dom";
import { prefetchFeedFirstPage } from "@/lib/feedPrefetch";

export const WELCOME_SEEN_KEY = "sifarah.seenWelcome";

export const hasSeenWelcome = () => {
  try {
    return localStorage.getItem(WELCOME_SEEN_KEY) === "1";
  } catch {
    return false;
  }
};

export const markWelcomeSeen = () => {
  try {
    localStorage.setItem(WELCOME_SEEN_KEY, "1");
  } catch {
    /* ignore */
  }
};

const Welcome = ({ onDone }: { onDone?: () => void }) => {
  const navigate = useNavigate();
  prefetchFeedFirstPage();

  const finish = () => {
    markWelcomeSeen();
    onDone?.();
  };

  const goFeed = () => {
    finish();
    navigate("/", { replace: true });
  };

  const goLogin = () => {
    finish();
    navigate("/login");
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/15 bg-[#182830] text-white shadow-2xl">
        <img
          src="/welcome-morocco.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/55 to-black/70" />

        <div className="relative z-10 flex flex-col items-center px-6 pb-8 pt-7 text-center sm:px-10 sm:pb-10 sm:pt-9">
          <div className="mb-4 flex w-full items-start justify-between gap-3">
            <h1 id="welcome-title" className="flex flex-col items-start text-left drop-shadow-sm">
              <span
                lang="ar"
                dir="rtl"
                className="text-[2rem] font-normal leading-none text-white sm:text-[2.35rem]"
                style={{ fontFamily: "Arabswell, serif" }}
              >
                سفارة
              </span>
              <span
                className="mt-1.5 text-lg font-normal leading-none text-white sm:text-xl"
                style={{ fontFamily: "Arabswell, serif" }}
              >
                Sifarah
              </span>
            </h1>
            <img src={logo} alt="" className="h-14 w-auto drop-shadow-md sm:h-16" />
          </div>

          <p
            className="mt-2 max-w-md text-2xl font-normal leading-snug tracking-tight text-white sm:text-3xl"
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              textShadow: "0 1px 2px rgba(0,0,0,0.95), 0 2px 14px rgba(0,0,0,0.85)",
            }}
          >
            Le réseau vivant de l&apos;écosystème immobilier et construction au Maroc.
          </p>
          <p
            className="mt-4 max-w-sm text-sm font-medium leading-relaxed text-white/95 sm:text-base"
            style={{ textShadow: "0 1px 2px rgba(0,0,0,0.9)" }}
          >
            Trouvez les meilleurs professionnels BTP, explorez les projets innovants et suivez les tendances du marché marocain.
          </p>

          <div className="mt-7 flex w-full flex-col gap-2.5 sm:mt-8 sm:flex-row sm:gap-3">
            <button
              type="button"
              onClick={goFeed}
              className="h-12 w-full rounded-full bg-white text-base font-bold text-neutral-900 shadow-md transition hover:bg-neutral-100 sm:flex-1"
            >
              Commencer
            </button>
            <button
              type="button"
              onClick={goLogin}
              className="h-12 w-full rounded-full border-2 border-white bg-white/10 text-base font-medium text-white backdrop-blur-md transition hover:bg-white/20 sm:flex-1"
            >
              Créer ma vitrine
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
