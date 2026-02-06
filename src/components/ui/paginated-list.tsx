import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useTranslation } from "react-i18next";

interface PaginatedListProps<T> {
  items: T[];
  loading?: boolean;
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKey?: keyof T;
  itemsPerPage?: number;
  className?: string;
}

export function PaginatedList<T extends Record<string, unknown>>({
  items,
  loading = false,
  renderItem,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyAction,
  searchable = false,
  searchPlaceholder,
  searchKey,
  itemsPerPage = 10,
  className = "",
}: PaginatedListProps<T>) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  const displayEmptyTitle = emptyTitle ?? t("components.paginatedList.noItems");
  const displayEmptyDesc = emptyDescription ?? t("components.paginatedList.startAdding");
  const displaySearchPlaceholder = searchPlaceholder ?? t("common.search") + "...";

  const filteredItems = useMemo(() => {
    if (!debouncedSearch || !searchKey) return items;
    return items.filter((item) => {
      const value = item[searchKey];
      if (typeof value === "string") {
        return value.toLowerCase().includes(debouncedSearch.toLowerCase());
      }
      return true;
    });
  }, [items, debouncedSearch, searchKey]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          {emptyIcon || <AlertCircle className="w-8 h-8 text-muted-foreground" />}
        </div>
        <h3 className="text-lg font-semibold mb-2">{displayEmptyTitle}</h3>
        <p className="text-muted-foreground text-sm max-w-sm mb-4">{displayEmptyDesc}</p>
        {emptyAction}
      </div>
    );
  }

  if (filteredItems.length === 0 && debouncedSearch) {
    return (
      <div className={className}>
        {searchable && (
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder={displaySearchPlaceholder} value={searchQuery} onChange={(e) => handleSearch(e.target.value)} className="pl-10" />
            </div>
          </div>
        )}
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t("components.pagination.noResults")}</h3>
          <p className="text-muted-foreground text-sm">
            {t("components.paginatedList.noMatch", { query: debouncedSearch })}
          </p>
          <Button variant="outline" className="mt-4" onClick={() => handleSearch("")}>
            {t("components.paginatedList.clearSearch")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {searchable && (
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={displaySearchPlaceholder} value={searchQuery} onChange={(e) => handleSearch(e.target.value)} className="pl-10" />
          </div>
        </div>
      )}

      <div className="space-y-3">
        {paginatedItems.map((item, index) => renderItem(item, startIndex + index))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredItems.length)} {t("components.pagination.of")} {filteredItems.length}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm px-2">
              {t("components.pagination.page")} {currentPage} / {totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
