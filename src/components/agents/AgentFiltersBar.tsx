import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface AgentFilters {
  search: string;
  category: string;
  status: string;
}

interface AgentFiltersBarProps {
  filters: AgentFilters;
  onFiltersChange: (filters: AgentFilters) => void;
  categories: string[];
  activeFiltersCount?: number;
}

export function AgentFiltersBar({ 
  filters, 
  onFiltersChange, 
  categories,
  activeFiltersCount = 0,
}: AgentFiltersBarProps) {
  const { t } = useTranslation();
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleCategoryChange = (value: string) => {
    onFiltersChange({ ...filters, category: value });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, status: value });
  };

  const clearFilters = () => {
    onFiltersChange({ search: '', category: 'all', status: 'all' });
  };

  const hasActiveFilters = filters.search || filters.category !== 'all' || filters.status !== 'all';

  return (
    <div className="flex flex-col sm:flex-row gap-3 p-4 bg-secondary/30 rounded-lg">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={t("common.search")}
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Category filter */}
      <Select value={filters.category} onValueChange={handleCategoryChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder={t("common.filter")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("common.noData", "All")}</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat} className="capitalize">
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status filter */}
      <Select value={filters.status} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-full sm:w-[150px]">
          <SelectValue placeholder={t("status.title", "Status")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("status.title", "All")}</SelectItem>
          <SelectItem value="active">{t("status.active", "Active")}</SelectItem>
          <SelectItem value="idle">{t("status.idle", "Idle")}</SelectItem>
          <SelectItem value="error">{t("common.error")}</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
          <X className="w-4 h-4" />
          {t("common.reset")}
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      )}
    </div>
  );
}
