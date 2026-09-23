import { useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle, FontSize } from "@tiptap/extension-text-style";
import { Bold, ImagePlus, Italic, Link as LinkIcon, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { storageService } from "@/services/storageService";
import { toast } from "@/components/ui/use-toast";
import { toAboutHtml } from "@/lib/aboutHtml";

const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32];

const AboutImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      size: {
        default: "natural",
        parseHTML: (element) => element.getAttribute("data-size") || "natural",
        renderHTML: (attributes) => ({
          "data-size": attributes.size,
          class: attributes.size === "full" ? "about-img-full" : "about-img-natural",
        }),
      },
    };
  },
});

const hrefForLink = (url: string) => {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^(https?:|mailto:)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const readImageSize = (src: string) =>
  new Promise<{ width: number; height: number }>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error("Impossible de lire la photo."));
    img.src = src;
  });

type AboutRichEditorProps = {
  value: string;
  onChange: (html: string) => void;
};

const AboutRichEditor = ({ value, onChange }: AboutRichEditorProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pendingLink, setPendingLink] = useState<{ url: string; text: string; hasSelection: boolean } | null>(
    null
  );
  const [pendingImage, setPendingImage] = useState<{
    src: string;
    alt: string;
    width: number;
    height: number;
  } | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: false,
        code: false,
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          HTMLAttributes: {
            rel: "noopener noreferrer",
            target: "_blank",
          },
        },
      }),
      TextStyle,
      FontSize,
      AboutImage.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({
        placeholder: "Cliquez et écrivez. Ajoutez du texte, du style et des photos.",
      }),
    ],
    content: toAboutHtml(value) || "<p></p>",
    editorProps: {
      attributes: {
        class: "min-h-[220px] max-w-full overflow-hidden px-3 py-2 text-sm leading-relaxed text-card-foreground focus:outline-none",
      },
    },
    onUpdate: ({ editor: current }) => {
      onChange(current.getHTML());
    },
  });

  const prepareImage = async (file: File) => {
    setUploading(true);
    try {
      const src = await storageService.uploadImage(file, "about");
      const { width, height } = await readImageSize(src);
      setPendingImage({ src, alt: file.name, width, height });
    } catch (error) {
      console.error("Error uploading about image:", error);
      toast({ title: "Erreur", description: "Impossible d’ajouter cette photo." });
    } finally {
      setUploading(false);
    }
  };

  const insertPendingImage = (size: "natural" | "full") => {
    if (!editor || !pendingImage) return;
    editor
      .chain()
      .focus()
      .insertContent({
        type: "image",
        attrs:
          size === "natural"
            ? {
                src: pendingImage.src,
                alt: pendingImage.alt,
                width: pendingImage.width,
                height: pendingImage.height,
                size: "natural",
              }
            : {
                src: pendingImage.src,
                alt: pendingImage.alt,
                size: "full",
              },
      })
      .run();
    setPendingImage(null);
  };

  const openLinkDialog = () => {
    if (!editor) return;
    const { from, to, empty } = editor.state.selection;
    const selected = editor.state.doc.textBetween(from, to, " ").trim();
    setPendingLink({
      url: editor.getAttributes("link").href || "",
      text: selected,
      hasSelection: !empty,
    });
  };

  const applyLink = () => {
    if (!editor || !pendingLink) return;
    const href = hrefForLink(pendingLink.url);
    if (!href) {
      toast({ title: "Lien invalide", description: "Entrez une URL ou une adresse email." });
      return;
    }
    const label = (pendingLink.text.trim() || href)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
    const safeHref = href.replace(/"/g, "");
    if (pendingLink.hasSelection) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: safeHref }).run();
    } else {
      editor.chain().focus().insertContent(`<a href="${safeHref}">${label}</a>`).run();
    }
    setPendingLink(null);
  };

  const removeLink = () => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setPendingLink(null);
  };

  if (!editor) return null;

  const currentSize = String(editor.getAttributes("textStyle").fontSize || "")
    .replace(/px$/i, "")
    .replace(/pt$/i, "");

  return (
    <div className="about-editor overflow-hidden rounded-lg border border-border">
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/40 p-1.5">
        <Button
          type="button"
          size="icon"
          variant={editor.isActive("bold") ? "secondary" : "ghost"}
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-label="Gras"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant={editor.isActive("italic") ? "secondary" : "ghost"}
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Italique"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <select
          className="h-8 rounded-md border border-input bg-background px-2 text-xs"
          value={currentSize}
          onChange={(e) => {
            const next = e.target.value;
            if (!next) editor.chain().focus().unsetFontSize().run();
            else editor.chain().focus().setFontSize(`${next}pt`).run();
          }}
          aria-label="Taille du texte"
        >
          <option value="">Taille</option>
          {FONT_SIZES.map((size) => (
            <option key={size} value={String(size)}>
              {size}
            </option>
          ))}
        </select>
        <Button
          type="button"
          size="icon"
          variant={editor.isActive("link") ? "secondary" : "ghost"}
          className="h-8 w-8"
          onClick={openLinkDialog}
          aria-label="Lien"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          Photo
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void prepareImage(file);
          }}
        />
      </div>
      <EditorContent editor={editor} />

      <Dialog open={Boolean(pendingImage)} onOpenChange={(open) => !open && setPendingImage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Taille de la photo</DialogTitle>
          </DialogHeader>
          {pendingImage ? (
            <div className="space-y-4">
              <img
                src={pendingImage.src}
                alt=""
                className="max-h-48 w-full rounded-md object-contain bg-muted"
              />
              <p className="text-sm text-muted-foreground">
                {pendingImage.width} × {pendingImage.height} px
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button type="button" variant="outline" onClick={() => insertPendingImage("natural")}>
                  Taille naturelle
                </Button>
                <Button type="button" onClick={() => insertPendingImage("full")}>
                  Pleine largeur
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Naturelle : taille d’origine si elle tient dans la section. Pleine largeur : occupe toute la
                largeur, hauteur ajustée.
              </p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(pendingLink)} onOpenChange={(open) => !open && setPendingLink(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{pendingLink?.hasSelection ? "Lier le texte" : "Ajouter un lien"}</DialogTitle>
          </DialogHeader>
          {pendingLink ? (
            <div className="space-y-3">
              {!pendingLink.hasSelection ? (
                <Input
                  placeholder="Texte du lien"
                  value={pendingLink.text}
                  onChange={(e) => setPendingLink({ ...pendingLink, text: e.target.value })}
                />
              ) : null}
              <Input
                placeholder="https://exemple.com"
                value={pendingLink.url}
                onChange={(e) => setPendingLink({ ...pendingLink, url: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyLink();
                  }
                }}
              />
            </div>
          ) : null}
          <DialogFooter className="gap-2">
            {editor.isActive("link") ? (
              <Button type="button" variant="ghost" onClick={removeLink}>
                Retirer le lien
              </Button>
            ) : null}
            <Button type="button" onClick={applyLink}>
              Appliquer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AboutRichEditor;
