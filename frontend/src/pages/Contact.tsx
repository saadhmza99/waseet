import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bug, Eye, Handshake, Megaphone, type LucideIcon } from "lucide-react";
import { DesktopRailFrame } from "@/components/FeedDesktopRail";
import PhoneInput from "@/components/PhoneInput";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { isCompletePhone } from "@/lib/phone";
import { contactService, type ContactTopic } from "@/services/contactService";

const TABS = [
  { id: "all", label: "Accueil" },
  { id: "projets", label: "Projets" },
  { id: "marche", label: "Matériaux" },
  { id: "opportunites", label: "Opportunités" },
  { id: "federations", label: "Fédérations" },
  { id: "contact", label: "Contactez-nous" },
] as const;

const TOPICS: Array<{ id: ContactTopic; title: string; text: string; Icon: LucideIcon }> = [
  { id: "partnership", title: "Partenariat", text: "Devenir partenaire de Sifarah.", Icon: Handshake },
  { id: "sponsorship", title: "Sponsoring", text: "Sponsoriser un espace ou une campagne.", Icon: Megaphone },
  { id: "visibility", title: "Acheter visibilité sur le site", text: "Pour plus de visibilité.", Icon: Eye },
  { id: "problem", title: "Problème sur le site", text: "Signaler un bug ou une erreur.", Icon: Bug },
];

const Contact = () => {
  const navigate = useNavigate();
  const { user, visitorUser } = useAuth();
  const isAdmin = useIsAdmin();
  const [topic, setTopic] = useState<ContactTopic | null>(null);
  const [topicsOpen, setTopicsOpen] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const account = user || visitorUser;
    if (!account) return;
    const metaName = String(account.user_metadata?.full_name || account.user_metadata?.name || "").trim();
    if (metaName) setName((current) => current || metaName);
    if (account.email && !account.email.endsWith("@sifarah.local")) {
      setEmail((current) => current || account.email || "");
    }
  }, [user, visitorUser]);

  const openTab = (id: (typeof TABS)[number]["id"]) => {
    if (id === "contact") return;
    if (id === "federations") {
      navigate("/federations");
      return;
    }
    if (id === "opportunites") {
      navigate("/opportunites");
      return;
    }
    if (id === "marche") {
      navigate("/produits");
      return;
    }
    if (id === "all") {
      navigate("/");
      return;
    }
    navigate(`/?vue=${id}`);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanMessage = message.trim();
    if (cleanName.length < 2) {
      toast({ title: "Nom requis", description: "Indiquez votre nom." });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      toast({ title: "Email", description: "Indiquez une adresse email valide." });
      return;
    }
    if (phone && !isCompletePhone(phone)) {
      toast({ title: "Téléphone", description: "Complétez le numéro ou laissez-le vide." });
      return;
    }
    if (!topic) {
      setTopicsOpen(true);
      toast({ title: "Sujet requis", description: "Choisissez un motif de contact." });
      return;
    }
    if (cleanMessage.length < 8) {
      toast({ title: "Message", description: "Décrivez votre demande en quelques mots." });
      return;
    }
    setSending(true);
    try {
      await contactService.create({
        topic,
        name: cleanName,
        email: cleanEmail,
        phone,
        organization: topic === "problem" ? undefined : organization,
        message: cleanMessage,
        pageUrl: topic === "problem" ? pageUrl : undefined,
        userId: (user || visitorUser)?.id || null,
      });
      setSent(true);
      setMessage("");
      setPageUrl("");
    } catch (error) {
      console.error(error);
      toast({ title: "Erreur", description: "Impossible d'envoyer le message." });
    } finally {
      setSending(false);
    }
  };

  return (
    <DesktopRailFrame className="min-h-screen bg-white pb-20 lg:pb-0">
      <div className="mb-12 hidden border-b border-neutral-200 lg:block">
        <div className="flex min-w-0 items-end gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.filter((item) => item.id !== "federations" || isAdmin).map((item) => {
            const active = item.id === "contact";
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => openTab(item.id)}
                className={`flex shrink-0 items-center justify-center whitespace-nowrap border-b-2 px-3.5 py-3.5 text-lg font-semibold ${
                  active ? "border-[#174f43] text-[#174f43]" : "border-transparent text-neutral-500 hover:text-neutral-900"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl px-4 py-2 lg:px-0">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">Contactez-nous</h1>
        <p className="mt-3 text-xl font-medium leading-snug text-neutral-800 sm:text-2xl">
          Partenariat, sponsoring, plan de visibilité, ou un problème sur le site.
        </p>

        <div className="mt-5">
          <button
            type="button"
            onClick={() => setTopicsOpen((open) => !open)}
            className="flex h-16 w-full items-center justify-center rounded-2xl border border-neutral-200 bg-white px-5 text-lg font-semibold text-neutral-900 shadow-sm transition duration-150 hover:scale-[0.97] hover:border-[#174f43] hover:text-[#174f43]"
          >
            {topic ? `Sujet : ${TOPICS.find((item) => item.id === topic)?.title}` : "Sujet"}
          </button>
          {topicsOpen ? (
            <div className="mt-3 grid grid-cols-2 items-start gap-3">
              {TOPICS.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setTopic(item.id);
                    setTopicsOpen(false);
                    setSent(false);
                    setMessage((current) => {
                      const stock = TOPICS.some((entry) => entry.text === current);
                      return !current.trim() || stock ? item.text : current;
                    });
                  }}
                  style={{ animationDelay: `${index * 45}ms` }}
                  className="group flex min-h-32 w-full animate-category-pop items-center gap-4 rounded-2xl border border-neutral-200 bg-white px-5 py-6 text-left text-xl font-semibold text-neutral-900 shadow-sm hover:border-[#174f43] hover:text-[#174f43]"
                >
                  <item.Icon className="h-9 w-9 shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-[20px] leading-snug">{item.title}</span>
                    <span className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-200 group-hover:grid-rows-[1fr] group-focus-visible:grid-rows-[1fr]">
                      <span className="overflow-hidden">
                        <span className="block pt-[0.6vh] text-lg font-normal leading-snug text-neutral-500">{item.text}</span>
                      </span>
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {topicsOpen ? null : sent ? (
          <div className="mt-6 rounded-2xl bg-[#174f43] px-5 py-6 text-white">
            <p className="text-lg font-semibold">Message envoyé</p>
            <p className="mt-1 text-sm text-white/80">Nous vous répondrons à l'adresse indiquée.</p>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="mt-4 h-10 rounded-xl bg-white px-4 text-sm font-semibold text-[#174f43]"
            >
              Envoyer un autre message
            </button>
          </div>
        ) : (
          <form onSubmit={(event) => void submit(event)} className="mt-6 space-y-3">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={120}
              placeholder="Nom"
              aria-label="Nom"
              className="h-12 w-full rounded-xl border border-neutral-200 px-3 text-base outline-none placeholder:text-neutral-400 focus:border-[#174f43]"
            />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              maxLength={180}
              placeholder="Email"
              aria-label="Email"
              className="h-12 w-full rounded-xl border border-neutral-200 px-3 text-base outline-none placeholder:text-neutral-400 focus:border-[#174f43]"
            />
            <PhoneInput value={phone} onChange={setPhone} placeholder="Téléphone" inputClassName="rounded-xl text-base" />
            {topic === "problem" ? (
              <input
                value={pageUrl}
                onChange={(event) => setPageUrl(event.target.value)}
                placeholder="Page concernée"
                aria-label="Page concernée"
                maxLength={500}
                className="h-12 w-full rounded-xl border border-neutral-200 px-3 text-base outline-none placeholder:text-neutral-400 focus:border-[#174f43]"
              />
            ) : (
              <input
                value={organization}
                onChange={(event) => setOrganization(event.target.value)}
                placeholder="Organisation"
                aria-label="Organisation"
                maxLength={160}
                className="h-12 w-full rounded-xl border border-neutral-200 px-3 text-base outline-none placeholder:text-neutral-400 focus:border-[#174f43]"
              />
            )}
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              required
              minLength={8}
              maxLength={4000}
              rows={6}
              placeholder="Message"
              aria-label="Message"
              className="w-full resize-none rounded-xl border border-neutral-200 px-3 py-3 text-base outline-none placeholder:text-neutral-400 focus:border-[#174f43]"
            />
            <button
              type="submit"
              disabled={sending}
              className="h-11 rounded-xl bg-[#174f43] px-5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {sending ? "Envoi…" : "Envoyer"}
            </button>
          </form>
        )}
      </div>
    </DesktopRailFrame>
  );
};

export default Contact;
