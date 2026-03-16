export const usePagination = (currentPage, totalItems, pageSize = 5) => {
  const totalPages = Math.max(1, Math.ceil((totalItems || 0) / pageSize));
  const start = Math.max(1, Math.min(currentPage + 1, totalPages) - 1);
  const end = Math.min(totalPages, start + 2);
  const adjustedStart = Math.max(1, end - 2);
  const pages = [];
  for (let page = adjustedStart; page <= end; page += 1) {
    pages.push(page);
  }
  return { totalPages, pages };
};

export default usePagination;
