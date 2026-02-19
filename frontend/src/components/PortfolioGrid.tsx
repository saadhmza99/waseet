import { useState } from "react";
import PortfolioModal from "./PortfolioModal";

interface PortfolioItem {
  image: string;
  label: string;
}

interface PortfolioGridProps {
  items: PortfolioItem[];
  username: string;
  avatar: string;
}

const PortfolioGrid = ({ items, username, avatar }: PortfolioGridProps) => {
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  const handleImageClick = (item: PortfolioItem) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  return (
    <>
      <div>
        <div className="flex gap-2 sm:gap-3 md:gap-4 overflow-x-auto pb-2 sm:pb-3 scrollbar-hide">
        {items.map((item, i) => (
            <div key={i} className="flex-shrink-0 w-32 sm:w-40 md:w-48">
              <button
                onClick={() => handleImageClick(item)}
                className="w-full hover:opacity-90 transition-opacity"
              >
            <img
              src={item.image}
              alt={item.label}
                  className="w-32 h-24 sm:w-40 sm:h-32 md:w-48 md:h-36 object-cover rounded-lg cursor-pointer"
            />
              </button>
              <p className="text-xs sm:text-sm text-center mt-1 sm:mt-2 font-medium text-card-foreground">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>

      {selectedItem && (
        <PortfolioModal
          image={selectedItem.image}
          label={selectedItem.label}
          username={username}
          avatar={avatar}
          isOpen={!!selectedItem}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default PortfolioGrid;
