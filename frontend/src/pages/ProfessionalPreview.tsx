import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import ProfileHeader from "@/components/ProfileHeader";
import AboutThisMemberSheet from "@/components/AboutThisMemberSheet";
import { ProfileDetailsFields } from "@/components/ProfileInfosCard";
import { ServiceCard } from "@/components/service/ServiceCard";
import {
  PROFESSIONAL_PREVIEW_ROWS,
  servicesForProfessional,
  type ProfessionalPreview as ProRow,
} from "@/lib/showcaseProfessionalsPreview";

const profileShape = (pro: ProRow) => ({
  profession: pro.profession,
  location: pro.location,
  email: pro.email,
  phone: pro.phone,
  website_url: pro.website_url,
  ice: pro.ice,
});

const ProfessionalPreview = () => {
  const [infosFor, setInfosFor] = useState<string | null>(null);
  const [aboutMemberFor, setAboutMemberFor] = useState<ProRow | null>(null);

  return (
    <div className="min-h-screen bg-[#f4f6f3] pb-16">
      <div className="mx-auto max-w-5xl px-3 pt-4 sm:px-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#174f43]">
          Aperçu profils (frontend only)
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-neutral-950">
          Comptes professionnels — preview
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-neutral-600">
          Rendu comme sur Sifarah, sans écriture Supabase. Infos et Website branchés comme sur un vrai profil.
        </p>
      </div>

      <div className="mt-6 space-y-10">
        {PROFESSIONAL_PREVIEW_ROWS.map((pro) => {
          const services = servicesForProfessional(pro.id);
          const showInfos = infosFor === pro.id;

          return (
            <section
              key={pro.id}
              className="overflow-hidden border-y border-neutral-200 bg-white shadow-sm sm:mx-4 sm:rounded-xl sm:border"
            >
              <div className="border-b border-dashed border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900 sm:px-6">
                <span className="font-semibold">{pro.id}</span>
                {" · "}
                {pro.categoryLabel}
                {" · ICE "}
                {pro.ice}
                {pro.email ? ` · ${pro.email}` : " · email placeholder à générer"}
              </div>
              <ProfileHeader
                profileId={pro.id}
                avatar={pro.avatar_url}
                fullName={pro.full_name}
                username={pro.username}
                bio={pro.bio}
                ice={pro.ice}
                profession={pro.profession}
                location={pro.location}
                phone={pro.phone}
                websiteUrl={pro.website_url}
                isOwnProfile={false}
                isVerified={false}
                authReady
                rating={0}
                reviewCount={0}
                services={[]}
                onAboutMember={() => setInfosFor(pro.id)}
                onAboutThisMember={() => setAboutMemberFor(pro)}
              />
              <div className="mx-auto max-w-5xl px-3 pb-6 sm:px-4 md:px-6">
                {showInfos ? (
                  <>
                    <div className="mb-3 flex items-center gap-2 border-b border-neutral-200 py-2">
                      <button
                        type="button"
                        onClick={() => setInfosFor(null)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100"
                        aria-label="Retour"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <p className="text-sm font-semibold text-neutral-900">Infos</p>
                    </div>
                    <div className="border-t border-neutral-200 py-6 sm:rounded-lg sm:border sm:px-6">
                      <ProfileDetailsFields
                        profile={profileShape(pro)}
                        isOwnProfile={false}
                        onEdit={() => undefined}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-3 flex gap-4 border-b border-neutral-200 text-sm font-semibold">
                      <span className="border-b-2 border-[#174f43] px-1 py-2 text-[#174f43]">Services</span>
                      <span className="px-1 py-2 text-neutral-400">Publications</span>
                      <span className="px-1 py-2 text-neutral-400">Projets</span>
                      <span className="px-1 py-2 text-neutral-400">Biens</span>
                    </div>
                    {services.length ? (
                      <div
                        className={`grid gap-4 ${
                          services.length === 1 ? "grid-cols-1 max-w-md" : "grid-cols-1 sm:grid-cols-2"
                        }`}
                      >
                        {services.map((row) => (
                          <ServiceCard key={row.id} row={row} />
                        ))}
                      </div>
                    ) : (
                      <p className="py-8 text-center text-sm text-neutral-500">
                        Aucun service lié pour l’instant.
                      </p>
                    )}
                  </>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <AboutThisMemberSheet
        open={Boolean(aboutMemberFor)}
        onOpenChange={(open) => {
          if (!open) setAboutMemberFor(null);
        }}
        createdAt={null}
        signupCountry="Morocco"
        isVerified={false}
      />

      <div className="mx-auto mt-8 max-w-5xl px-4 text-center">
        <Link to="/" className="text-sm font-semibold text-[#174f43]">
          ← Retour au feed
        </Link>
      </div>
    </div>
  );
};

export default ProfessionalPreview;
