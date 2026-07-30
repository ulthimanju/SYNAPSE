import { useState } from 'react';

export const usePagination = (initialPage = 1, initialPageSize = 20) => {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    nextPage: () => setPage((p) => p + 1),
    prevPage: () => setPage((p) => Math.max(p - 1, 1)),
  };
};
