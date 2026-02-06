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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  return (
    <div className={`flex items-center justify-between px-2 ${className}`}>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          {totalItems > 0 
            ? `${startIndex}-${endIndex} ${t("components.pagination.of")} ${totalItems}` 
            : t("components.pagination.noResults")
          }
        </span>
        
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span>{t("components.pagination.show")}</span>
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
          {t("components.pagination.page")} {currentPage} {t("components.pagination.of")} {totalPages}
        </span>

        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(1)} disabled={!hasPreviousPage}>
            <ChevronsLeft className="h-4 w-4" />
            <span className="sr-only">{t("components.pagination.firstPage")}</span>
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(currentPage - 1)} disabled={!hasPreviousPage}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">{t("common.previous")}</span>
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(currentPage + 1)} disabled={!hasNextPage}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">{t("common.next")}</span>
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(totalPages)} disabled={!hasNextPage}>
            <ChevronsRight className="h-4 w-4" />
            <span className="sr-only">{t("components.pagination.lastPage")}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
