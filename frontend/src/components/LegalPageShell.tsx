import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import logo from "@/assets/sifarah-logo-detailed.png";

type LegalPageShellProps = {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
  otherLink: { to: string; label: string };
};

const LegalPageShell = ({ title, updatedAt, children, otherLink }: LegalPageShellProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const goBack = () => {
    // Prefer in-app history; otherwise close the tab if it was opened from signup,
    // or fall back to the inscription page / home.
    if (location.key !== "default") {
      navigate(-1);
      return;
    }
    if (window.opener) {
      window.close();
      return;
    }
    navigate("/create-profile");
  };

  return (
    <div className="min-h-[100dvh] bg-[#F7F8F7] text-[#182830]">
      <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100"
            aria-label="Retour"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <img src={logo} alt="Sifarah" className="h-8 w-auto" />
            <span className="truncate text-sm font-semibold text-[#174f43]">Sifarah</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#174f43]">Documents légaux</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#182830] sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-neutral-500">Dernière mise à jour : {updatedAt}</p>

        <div className="legal-prose mt-8 space-y-8 text-[15px] leading-relaxed text-neutral-800 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-[#182830] [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_a]:font-medium [&_a]:text-[#174f43] [&_a]:underline-offset-2 hover:[&_a]:underline">
          {children}
        </div>

        <div className="mt-12 rounded-2xl border border-neutral-200 bg-white p-5 text-sm text-neutral-600">
          <p>
            Voir aussi :{" "}
            <Link to={otherLink.to} className="font-medium text-[#174f43] underline-offset-2 hover:underline">
              {otherLink.label}
            </Link>
            {" · "}
            <Link to="/contact" className="font-medium text-[#174f43] underline-offset-2 hover:underline">
              Nous contacter
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default LegalPageShell;
