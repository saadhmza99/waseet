import { toast } from "sonner";

/** Small light confirmation. Sits at the top so it does not cover the bottom of the feed. */
export const savedToast = (title = "Enregistré", description = "Retrouvez-le dans Enregistrés.") => {
  toast(title, {
    description,
    position: "top-center",
    duration: 2200,
    style: {
      background: "#fff",
      color: "#171717",
      border: "1px solid #e5e5e5",
      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
      width: "fit-content",
      maxWidth: "16rem",
      padding: "8px 14px",
      borderRadius: "16px",
    },
    descriptionClassName: "!text-neutral-500",
  });
};
