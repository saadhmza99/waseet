import { BookOpen } from "lucide-react";
import { DesktopRailFrame } from "@/components/FeedDesktopRail";

const Courses = () => (
  <DesktopRailFrame className="min-h-screen bg-[#f6f5f3] pb-20 lg:pb-0">
    <div className="mx-auto w-full px-4 py-6 lg:px-2">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Médiathèque</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Formations, guides et documents pour progresser dans le bâtiment et l&apos;immobilier.
        </p>
      </header>
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#174f43]/10 text-[#174f43]">
          <BookOpen className="h-7 w-7" />
        </span>
        <p className="mt-4 text-lg font-semibold text-neutral-900">Bientôt disponible</p>
        <p className="mt-1 max-w-md text-sm text-neutral-500">
          La médiathèque Sifarah arrivera ici — guides pratiques, modules et certifications.
        </p>
      </div>
    </div>
  </DesktopRailFrame>
);

export default Courses;
