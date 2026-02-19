import { useState } from "react";
import { Image, Smile, MapPin, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import avatarTony from "@/assets/avatar-tony.jpg";

interface CreatePostProps {
  onPostCreated?: (post: { text: string; images: string[]; beforeImage?: string; afterImage?: string }) => void;
}

const CreatePost = ({ onPostCreated }: CreatePostProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [postText, setPostText] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageTags, setImageTags] = useState<{ [key: number]: 'avant' | 'après' | null }>({});

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const imageUrls: string[] = [];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            imageUrls.push(event.target.result as string);
            if (imageUrls.length === files.length) {
              setSelectedImages((prev) => [...prev, ...imageUrls]);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImageTags((prev) => {
      const newTags = { ...prev };
      delete newTags[index];
      // Reindex tags after removal
      const reindexed: { [key: number]: 'avant' | 'après' | null } = {};
      Object.keys(newTags).forEach((key) => {
        const oldIndex = parseInt(key);
        if (oldIndex > index) {
          reindexed[oldIndex - 1] = newTags[oldIndex];
        } else if (oldIndex < index) {
          reindexed[oldIndex] = newTags[oldIndex];
        }
      });
      return reindexed;
    });
  };

  const toggleImageTag = (index: number, tag: 'avant' | 'après') => {
    setImageTags((prev) => {
      const newTags = { ...prev };
      // If clicking the same tag, remove it
      if (newTags[index] === tag) {
        newTags[index] = null;
      } else {
        // Remove the tag from the other image if it exists
        Object.keys(newTags).forEach((key) => {
          const keyIndex = parseInt(key);
          if (keyIndex !== index && newTags[keyIndex] === tag) {
            newTags[keyIndex] = null;
          }
        });
        newTags[index] = tag;
      }
      return newTags;
    });
  };

  const handleSubmit = () => {
    if (postText.trim() || selectedImages.length > 0) {
      // Prepare images with tags for before/after
      const beforeImage = selectedImages.length === 2 && imageTags[0] === 'avant' 
        ? selectedImages[0] 
        : selectedImages.length === 2 && imageTags[1] === 'avant' 
        ? selectedImages[1] 
        : undefined;
      
      const afterImage = selectedImages.length === 2 && imageTags[0] === 'après' 
        ? selectedImages[0] 
        : selectedImages.length === 2 && imageTags[1] === 'après' 
        ? selectedImages[1] 
        : undefined;

      onPostCreated?.({ 
        text: postText, 
        images: selectedImages,
        beforeImage,
        afterImage
      });
      setPostText("");
      setSelectedImages([]);
      setImageTags({});
      setIsExpanded(false);
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="my-4 sm:my-6 flex justify-center">
        <button
          onClick={() => {
            setIsOpen(true);
            setIsExpanded(true);
          }}
          className="bg-card border border-border rounded-lg px-4 sm:px-6 py-2 sm:py-3 flex items-center gap-2 hover:bg-secondary transition-colors"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-accent/10 flex items-center justify-center">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
          </div>
          <span className="text-sm sm:text-base text-card-foreground font-medium">Créer un poste</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card border-b border-border my-4 sm:my-6">
      <div className="px-2 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-start gap-3">
          <img
            src={avatarTony}
            alt="Profile"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              placeholder="Créer un poste"
              className="w-full bg-background border border-border rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-card-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent min-h-[100px] max-h-[200px]"
              rows={4}
              autoFocus
            />

            {/* Selected Images Preview */}
            {selectedImages.length > 0 && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {selectedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 sm:h-40 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-foreground/70 hover:bg-foreground/90 text-background rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {/* Before/After Tags - Only show when exactly 2 images */}
                    {selectedImages.length === 2 && (
                      <div className="absolute bottom-2 left-2 right-2 flex gap-1 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleImageTag(index, 'avant');
                          }}
                          className={`flex-1 px-2 py-1 text-xs font-semibold rounded ${
                            imageTags[index] === 'avant'
                              ? 'bg-accent text-accent-foreground'
                              : 'bg-foreground/80 text-background hover:bg-foreground/90'
                          } transition-colors`}
                        >
                          Avant
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleImageTag(index, 'après');
                          }}
                          className={`flex-1 px-2 py-1 text-xs font-semibold rounded ${
                            imageTags[index] === 'après'
                              ? 'bg-accent text-accent-foreground'
                              : 'bg-foreground/80 text-background hover:bg-foreground/90'
                          } transition-colors`}
                        >
                          Après
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-3 flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center gap-2 sm:gap-4">
                <label className="flex items-center gap-2 text-muted-foreground hover:text-accent cursor-pointer transition-colors">
                  <Image className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm font-medium">Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
                <button className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors">
                  <Smile className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm font-medium">Émoji</span>
                </button>
                <button className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors">
                  <MapPin className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm font-medium">Localisation</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPostText("");
                    setSelectedImages([]);
                    setIsExpanded(false);
                    setIsOpen(false);
                  }}
                  className="text-sm"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!postText.trim() && selectedImages.length === 0}
                  className="text-sm"
                >
                  Publier
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;

