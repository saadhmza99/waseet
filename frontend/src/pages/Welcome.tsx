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

  const leave = (path: string) => {
    markWelcomeSeen();
    onDone?.();
    navigate(path);
  };

  return (
    <div className="bg-[#F7F4EE] text-[#182830]">
    <div className="relative h-[100dvh] overflow-hidden bg-sky-800 text-white sm:h-auto sm:min-h-[100dvh]">
      <img
        src="/welcome-morocco.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-[center_20%] md:object-[center_38%]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/45 to-black/55" />

      <div className="relative z-10 flex h-full min-h-0 w-full flex-col px-3 pb-[max(3vh,env(safe-area-inset-bottom))] pt-[max(2vh,env(safe-area-inset-top))] sm:min-h-[100dvh] sm:pb-[max(3rem,env(safe-area-inset-bottom))] sm:pt-[max(1.25rem,env(safe-area-inset-top))] md:px-5">
        <div className="ml-8 flex translate-y-[2vh] flex-col items-start text-left sm:translate-y-0 sm:pt-8 md:ml-14 md:pt-[4vh]">
          <h1 className="flex flex-col items-start drop-shadow-sm">
            <span
              lang="ar"
              dir="rtl"
              className="text-[2.65rem] font-normal leading-none text-white md:text-[3.15rem]"
              style={{ fontFamily: "Arabswell, serif" }}
            >
              سفارة
            </span>
            <span
              className="mt-2 text-[22px] font-normal leading-none text-white md:text-[27px]"
              style={{ fontFamily: "Arabswell, serif" }}
            >
              Sifarah
            </span>
          </h1>
          {/* <p className="mt-3 text-lg font-normal text-white/95 drop-shadow sm:text-xl">
            Découvrez. Suivez. Échangez.
          </p> */}
        </div>

        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center text-center sm:pb-8">
          <img src={logo} alt="" className="mb-[1.5vh] h-28 w-auto drop-shadow-md sm:mb-5 sm:h-36 lg:h-40" />
          <p className="max-w-3xl text-4xl font-normal leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-6xl" style={{ fontFamily: '"Playfair Display", Georgia, serif', textShadow: "0 1px 2px rgba(0,0,0,0.95), 0 2px 18px rgba(0,0,0,0.9), 0 0 1px #000" }}>
            L'annuaire vivant de l'écosystème immobilier et construction au Maroc.
          </p>
          <p
            className="mt-[2vh] max-w-2xl text-lg font-medium leading-relaxed text-white sm:mt-10 sm:text-xl"
            style={{ textShadow: "0 1px 2px rgba(0,0,0,0.95), 0 2px 18px rgba(0,0,0,0.9), 0 0 1px #000" }}
          >
            Trouvez les meilleurs professionnels, explorez les projets innovants et suivez les tendances du marché marocain.
          </p>
          <div className="mt-[2.5vh] flex w-full max-w-md flex-col items-center sm:mt-10 sm:max-w-lg sm:flex-row sm:gap-4">
            <button
              type="button"
              onClick={goFeed}
              className="mt-3 h-14 w-full rounded-full bg-white text-xl font-bold text-neutral-900 shadow-md transition hover:bg-neutral-100 sm:mt-0 sm:flex-1"
            >
              Commencer
            </button>
            <button
              type="button"
              onClick={goLogin}
              className="mt-2 h-14 w-full rounded-full border-2 border-white bg-white/10 text-xl font-medium text-white backdrop-blur-md transition hover:bg-white/20 sm:mt-0 sm:flex-1"
            >
              Créer ma vitrine
            </button>
          </div>
        </div>
      </div>
    </div>

    <section className="bg-[#F7F4EE] px-6 pb-24 pt-16 text-[#182830] sm:px-12 sm:pb-32 sm:pt-20 lg:px-20" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-24 max-w-3xl text-center sm:mb-28">
          <span className="mb-4 block text-xs font-semibold uppercase tracking-[0.3em] text-[#B35438]">Immobilier &amp; Construction</span>
          <h2 className="mb-6 text-4xl font-normal tracking-tight text-[#182830] sm:text-6xl" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            Que cherchez-vous ?
          </h2>
          <p className="text-xl font-light italic text-[#5C6B73] sm:text-2xl" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            Un bien ? Un professionnel ? Un projet ? Une opportunité ?
          </p>
        </div>

        <div className="space-y-28 lg:space-y-36">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-20">
            <div className="space-y-6 lg:col-span-5">
              <div className="flex items-center gap-3">
                <span className="h-px w-6 bg-[#B35438]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#B35438]">Je cherche</span>
              </div>
              <h3 className="text-3xl font-normal leading-tight text-[#182830] sm:text-4xl lg:text-5xl" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
                Un bien, un professionnel ou un service
              </h3>
              <p className="text-lg font-light leading-relaxed text-[#5C6B73]">
                Explorez les biens d&apos;exception, entreprises et professionnels qualifiés qui façonnent le paysage immobilier marocain, de Casablanca à Agadir.
              </p>
              <button type="button" onClick={() => leave("/explore")} className="inline-flex items-center text-sm font-semibold uppercase tracking-wider text-[#182830] hover:text-[#B35438]">
                Explorer l&apos;annuaire
                <span className="ml-2" aria-hidden>→</span>
              </button>
            </div>
            <div className="group overflow-hidden rounded-lg border border-[#D8D0C5] bg-[#EFECE4] shadow-sm lg:col-span-7">
              <img src="/welcome/haut-standing.jpg" alt="Résidence contemporaine haut standing avec piscine" className="aspect-[16/10] w-full object-cover object-center transition duration-700 group-hover:scale-[1.03]" />
            </div>
          </div>

          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-20">
            <div className="group order-2 overflow-hidden rounded-lg border border-[#D8D0C5] bg-[#EFECE4] shadow-sm lg:order-1 lg:col-span-7">
              <img src="/welcome/casablanca-tour.jpg" alt="Tour en construction à Casablanca, avec grues" className="aspect-[16/10] w-full object-cover object-[center_40%] transition duration-700 group-hover:scale-[1.03]" />
            </div>
            <div className="order-1 space-y-6 lg:order-2 lg:col-span-5">
              <div className="flex items-center gap-3">
                <span className="h-px w-6 bg-[#B35438]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#B35438]">Je découvre</span>
              </div>
              <h3 className="text-3xl font-normal leading-tight text-[#182830] sm:text-4xl lg:text-5xl" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
                Ce qui se passe autour de moi
              </h3>
              <p className="text-lg font-light leading-relaxed text-[#5C6B73]">
                Suivez en temps réel les chantiers en cours, les grandes réalisations architecturales et les publications des acteurs clés de votre région.
              </p>
              <button type="button" onClick={() => leave("/")} className="inline-flex items-center text-sm font-semibold uppercase tracking-wider text-[#182830] hover:text-[#B35438]">
                Découvrir les chantiers
                <span className="ml-2" aria-hidden>→</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-20">
            <div className="space-y-6 lg:col-span-5">
              <div className="flex items-center gap-3">
                <span className="h-px w-6 bg-[#B35438]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#B35438]">Je cherche une opportunité</span>
              </div>
              <h3 className="text-3xl font-normal leading-tight text-[#182830] sm:text-4xl lg:text-5xl" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
                Des projets à rejoindre
              </h3>
              <p className="text-lg font-light leading-relaxed text-[#5C6B73]">
                Découvrez des partenariats stratégiques, des investissements fonciers, des appels d&apos;offres et des missions BTP à travers le Royaume.
              </p>
              <button type="button" onClick={() => leave("/opportunites")} className="inline-flex items-center text-sm font-semibold uppercase tracking-wider text-[#182830] hover:text-[#B35438]">
                Voir les opportunités
                <span className="ml-2" aria-hidden>→</span>
              </button>
            </div>
            <div className="group overflow-hidden rounded-lg border border-[#D8D0C5] bg-[#EFECE4] shadow-sm lg:col-span-7">
              <img src="/welcome/cimenterie.jpg" alt="Cimenterie au Maroc, silos et halls industriels" className="aspect-[16/10] w-full object-cover object-[center_35%] transition duration-700 group-hover:scale-[1.03]" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="bg-[#141210] px-6 py-24 text-[#F7F4EE] sm:px-12 sm:py-32 lg:px-20" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="mx-auto max-w-6xl text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#C4A48A]">
          Vous êtes professionnel ?
        </p>
        <h2 className="mx-auto mt-8 max-w-4xl text-4xl font-normal leading-tight tracking-tight sm:text-6xl" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
          Faites vivre votre présence.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg font-light italic leading-relaxed text-[#C9C1B6] sm:text-xl" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
          Présentez votre activité, partagez vos réalisations, publiez vos projets et gardez vos informations à jour au cœur de l&apos;écosystème local.
        </p>
        <div className="mx-auto mt-12 h-px max-w-5xl bg-white/15" />
        <div className="mt-10 grid grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["01. Vitrine vivante", "Présentez votre travail", "Un portfolio visuel et vivant ancré dans la cartographie d'Agadir et du Souss."],
            ["02. Projets en cours", "Publiez vos chantiers", "Montrez vos réalisations étape par étape aux maîtres d'ouvrage et investisseurs."],
            ["03. Réseau direct", "Devenez découvrable", "Soyez identifié pour les appels d'offres privés, sous-traitance et consultations."],
            ["04. Ancrage régional", "Construisez votre réputation", "Inscrivez votre marque dans le paysage bâti en pleine expansion du Maroc."],
          ].map(([label, title, body]) => (
            <button
              key={label}
              type="button"
              onClick={goLogin}
              className="border border-white/10 bg-[#1c1a18] p-5 text-left transition hover:border-[#B35438]/50"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B35438]">{label}</p>
              <h3 className="mt-4 text-xl font-normal text-white" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>{title}</h3>
              <p className="mt-3 text-sm font-light leading-relaxed text-white/60">{body}</p>
            </button>
          ))}
        </div>
        <p className="mx-auto mt-12 max-w-3xl text-lg font-light italic leading-relaxed text-[#C9C1B6]" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
          Sur Sifarah, votre entreprise n&apos;est pas un simple annuaire statique. C&apos;est un profil dynamique qui valorise votre savoir-faire auprès des décideurs locaux.
        </p>
      </div>
    </section>

    <section className="bg-[#F7F4EE] px-6 py-28 text-center sm:py-36" style={{ fontFamily: "Inter, sans-serif" }}>
      <p className="text-5xl leading-none text-[#C4A48A]" style={{ fontFamily: '"Playfair Display", Georgia, serif' }} aria-hidden>
        &ldquo;
      </p>
      <p className="mx-auto mt-6 max-w-3xl text-3xl font-normal leading-snug tracking-tight text-[#182830] sm:text-5xl" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
        &ldquo;Tout ce qui bouge dans votre écosystème, au même endroit.&rdquo;
      </p>
    </section>

    <footer className="bg-[#141210] px-6 pb-8 pt-16 text-[#F7F4EE] sm:px-12 lg:px-20" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="mx-auto grid max-w-6xl gap-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="text-sm font-semibold tracking-[0.18em]">SIFARAH</p>
          <p className="mt-4 max-w-xs text-sm font-light leading-relaxed text-white/55">
            La plateforme vivante de l&apos;écosystème bâti, de l&apos;immobilier et du BTP au Maroc.
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B35438]">Naviguer</p>
          <div className="mt-4 flex flex-col items-start gap-3 text-sm font-light text-white/70">
            <button type="button" onClick={() => leave("/explore")} className="hover:text-white">Explorer l&apos;annuaire</button>
            <button type="button" onClick={() => leave("/")} className="hover:text-white">Activité récente</button>
            <button type="button" onClick={() => leave("/opportunites")} className="hover:text-white">Opportunités &amp; Fonciers</button>
            <button type="button" onClick={goLogin} className="hover:text-white">Espace Professionnel</button>
          </div>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B35438]">Professionnels</p>
          <p className="mt-4 text-sm font-light leading-relaxed text-white/70">
            Inscrivez votre cabinet ou entreprise générale sur Sifarah.
          </p>
          <button
            type="button"
            onClick={goLogin}
            className="mt-5 bg-[#B35438] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#9c4125]"
          >
            Demander une vitrine
          </button>
        </div>
      </div>

      <div className="relative mx-auto mt-14 flex max-w-6xl flex-col items-center gap-4 border-t border-white/10 pt-6 text-[11px] font-light text-white/40 sm:flex-row sm:justify-between">
        <p className="sm:max-w-[34%]">© 2026 Sifarah. Tous droits réservés. Écosystème local marocain.</p>
        <img src={logo} alt="" className="h-10 w-auto sm:absolute sm:left-1/2 sm:-translate-x-1/2" />
        <p className="sm:max-w-[34%] sm:text-right">Fabriqué avec passion pour le territoire de Souss-Massa.</p>
      </div>
    </footer>
    </div>
  );
};

export default Welcome;
