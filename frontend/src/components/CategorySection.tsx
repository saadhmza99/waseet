import { ChevronLeft, ChevronRight } from "lucide-react";
import { ReactNode } from "react";

interface CategorySectionProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  onViewMore?: () => void;
  maxRows?: number; // 1 for normal, 2 for sponsored
  isSponsored?: boolean;
}

const CategorySection = ({ title, icon, children, onViewMore, maxRows = 1, isSponsored = false }: CategorySectionProps) => {
  return (
    <div className="mb-8 sm:mb-12">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          {icon && <div className="text-accent">{icon}</div>}
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-card-foreground">
            {title}
          </h2>
        </div>
        {onViewMore && !isSponsored && (
          <button
            onClick={onViewMore}
            className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base text-muted-foreground hover:text-accent transition-colors"
          >
            <span className="hidden sm:inline">Plus d'annonces</span>
            <span className="sm:hidden">Plus</span>
     
          </button>
        )}
      </div>

      {/* Section Content */}
      {maxRows === 2 ? (
        // Sponsored: Max 2 rows, scroll horizontal if more - Bigger cards on desktop, normal on mobile
        <div className="overflow-x-auto -mx-2 sm:-mx-4 md:-mx-6 lg:-mx-8 px-2 sm:px-4 md:px-6 lg:px-8 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          <div className="grid grid-rows-2 grid-flow-col gap-4 sm:gap-6 w-max [grid-auto-columns:minmax(280px,320px)] sm:[grid-auto-columns:minmax(360px,420px)]">
            {children}
          </div>
        </div>
      ) : (
        // Normal: Max 1 row, scroll horizontal if more
        <div className="overflow-x-auto -mx-2 sm:-mx-4 md:-mx-6 lg:-mx-8 px-2 sm:px-4 md:px-6 lg:px-8 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          <div className="flex gap-4 sm:gap-6 min-w-max">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySection;

