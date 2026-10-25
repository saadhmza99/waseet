import { HardHat } from "lucide-react";
import { DesktopRailFrame } from "@/components/FeedDesktopRail";

const Hrayfi = () => (
  <DesktopRailFrame className="min-h-screen bg-[#f6f5f3] pb-20 lg:pb-0">
    <div className="mx-auto w-full px-4 py-6 lg:px-2">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Sifarah Hrayfi</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Artisans et hrayfiya pour vos travaux — trouve le bon professionnel près de chez toi.
        </p>
      </header>
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#174f43]/10 text-[#174f43]">
          <HardHat className="h-7 w-7" />
        </span>
        <p className="mt-4 text-lg font-semibold text-neutral-900">Bientôt disponible</p>
        <p className="mt-1 max-w-md text-sm text-neutral-500">
          Sifarah Hrayfi arrivera ici — annuaire d&apos;artisans et demandes de devis locales.
        </p>
      </div>
    </div>
  </DesktopRailFrame>
);

export default Hrayfi;
