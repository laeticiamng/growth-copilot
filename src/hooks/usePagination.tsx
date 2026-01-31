import { useState, useMemo, useCallback } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  pageSizeOptions?: number[];
}

interface UsePaginationReturn<T> {
  // Current page data
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  
  // Paginated data
  paginatedData: T[];
  
  // Navigation
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  
  // Page size
  setPageSize: (size: number) => void;
  pageSizeOptions: number[];
  
  // Helpers
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startIndex: number;
  endIndex: number;
  
  // Reset
  reset: () => void;
}

export function usePagination<T>(
  data: T[],
  options: UsePaginationOptions = {}
): UsePaginationReturn<T> {
  const {
    initialPage = 1,
    initialPageSize = 10,
    pageSizeOptions = [5, 10, 25, 50, 100],
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Ensure current page is valid when data changes
  const validPage = useMemo(() => {
    return Math.min(Math.max(1, currentPage), totalPages);
  }, [currentPage, totalPages]);

  // Calculate indices
  const startIndex = (validPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  // Get paginated data
  const paginatedData = useMemo(() => {
    return data.slice(startIndex, endIndex);
  }, [data, startIndex, endIndex]);

  // Navigation functions
  const goToPage = useCallback((page: number) => {
    const newPage = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(newPage);
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (validPage < totalPages) {
      setCurrentPage(validPage + 1);
    }
  }, [validPage, totalPages]);

  const previousPage = useCallback(() => {
    if (validPage > 1) {
      setCurrentPage(validPage - 1);
    }
  }, [validPage]);

  const firstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const lastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  // Page size change
  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    // Reset to first page when changing page size
    setCurrentPage(1);
  }, []);

  // Reset function
  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setPageSizeState(initialPageSize);
  }, [initialPage, initialPageSize]);

  return {
    currentPage: validPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedData,
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    setPageSize,
    pageSizeOptions,
    hasNextPage: validPage < totalPages,
    hasPreviousPage: validPage > 1,
    startIndex: totalItems > 0 ? startIndex + 1 : 0,
    endIndex,
    reset,
  };
}

// Pagination component helper
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startIndex: number;
  endIndex: number;
  totalItems: number;
}

export function getPaginationProps<T>(
  pagination: UsePaginationReturn<T>
): PaginationProps {
  return {
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    onPageChange: pagination.goToPage,
    hasNextPage: pagination.hasNextPage,
    hasPreviousPage: pagination.hasPreviousPage,
    startIndex: pagination.startIndex,
    endIndex: pagination.endIndex,
    totalItems: pagination.totalItems,
  };
}
