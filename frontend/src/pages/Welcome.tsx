import { Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

  const goFeed = () => {
    markWelcomeSeen();
    onDone?.();
    navigate("/", { replace: true });
  };

  const goLogin = () => {
    markWelcomeSeen();
    onDone?.();
    navigate("/login");
  };

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-sky-800 text-white">
      <img
        src="/welcome-morocco.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-[center_20%] md:object-[center_38%]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/55 md:bg-gradient-to-r md:from-black/50 md:via-black/15 md:to-black/50" />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-7xl flex-col px-6 pb-[max(3rem,env(safe-area-inset-bottom))] pt-[max(3.5rem,env(safe-area-inset-top))] md:flex-row md:items-center md:justify-between md:gap-12 md:px-8 md:py-12 lg:px-10">
        <div className="flex flex-1 flex-col items-center pt-[12vh] text-center md:flex-none md:self-start md:items-start md:pt-[6vh] md:text-left">
          <div className="flex -translate-x-3.5 items-center justify-center gap-2 md:translate-x-0 md:gap-3">
            <Wrench className="h-12 w-12 shrink-0 text-orange-500 md:h-16 md:w-16" strokeWidth={2.2} />
            <h1 className="text-5xl font-semibold tracking-tight drop-shadow-sm sm:text-6xl lg:text-7xl">Sifarah</h1>
          </div>
          <p className="mt-4 text-xl font-normal text-white/95 drop-shadow sm:text-2xl lg:text-3xl">
            Découvrir. Suivre. Soutenir.
          </p>
        </div>

        <div className="mx-auto w-full max-w-sm pb-8 text-center md:mx-0 md:max-w-[26rem] md:pb-0 md:text-left lg:max-w-lg md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
          <p className="mb-12 text-xl font-medium leading-snug text-white drop-shadow sm:text-2xl md:mb-8 lg:text-3xl">
            Explorez les meilleures entreprises
            <br />
            du Maroc
          </p>
          <div className="flex flex-col items-center md:flex-row md:gap-4">
            <button
              type="button"
              onClick={goFeed}
              className="h-14 w-full rounded-full bg-white text-xl font-bold text-neutral-900 shadow-md transition hover:bg-neutral-100 md:flex-1"
            >
              Commencer
            </button>
            <button
              type="button"
              onClick={goLogin}
              className="mt-7 text-xl font-medium text-white underline-offset-4 hover:underline md:mt-0 md:h-14 md:flex-1 md:rounded-full md:border-2 md:border-white md:bg-white/10 md:backdrop-blur-md md:transition md:hover:bg-white/20 md:hover:no-underline"
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
