import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="bottom-center"
      offset={80}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-2xl group-[.toaster]:border-0 group-[.toaster]:bg-neutral-900/95 group-[.toaster]:text-white group-[.toaster]:shadow-[0_8px_30px_rgba(0,0,0,0.25)] group-[.toaster]:backdrop-blur-md",
          description: "group-[.toast]:text-white/75",
          actionButton:
            "group-[.toast]:bg-[#174f43] group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

