export const getPagination = (page, limit) => {
  const parsedPage = Number(page), parsedLimit = Number(limit);
  const currentPage = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? Math.min(parsedPage, 1000000) : 1;
  const pageSize = Number.isSafeInteger(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 100) : 10;
  const from = (currentPage - 1) * pageSize;
  return { from, to: from + pageSize - 1, currentPage, pageSize };
};
export const getPaginationResult = (count, page, limit) => ({
  totalItems: count, totalPages: Math.ceil(count / limit), currentPage: page, pageSize: limit,
});
