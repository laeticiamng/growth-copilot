import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { PaginationProps } from "@/hooks/usePagination";

interface DataTablePaginationProps extends PaginationProps {
  onPageSizeChange?: (size: number) => void;
  pageSize?: number;
  pageSizeOptions?: number[];
  className?: string;
}

export function DataTablePagination({
  currentPage,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPreviousPage,
  startIndex,
  endIndex,
  totalItems,
  onPageSizeChange,
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  className = "",
}: DataTablePaginationProps) {
  return (
    <div className={`flex items-center justify-between px-2 ${className}`}>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          {totalItems > 0 
            ? `${startIndex}-${endIndex} sur ${totalItems}` 
            : "Aucun résultat"
          }
        </span>
        
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span>Afficher</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Page {currentPage} sur {totalPages}
        </span>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(1)}
            disabled={!hasPreviousPage}
          >
            <ChevronsLeft className="h-4 w-4" />
            <span className="sr-only">Première page</span>
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPreviousPage}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Page précédente</span>
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNextPage}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Page suivante</span>
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(totalPages)}
            disabled={!hasNextPage}
          >
            <ChevronsRight className="h-4 w-4" />
            <span className="sr-only">Dernière page</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
