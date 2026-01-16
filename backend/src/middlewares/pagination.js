export const getPagination = (page, limit) => {
  const currentPage = parseInt(page) || 1;
  const pageSize = parseInt(limit) || 10;

  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  return { from, to, currentPage, pageSize };
};

export const getPaginationResult = (count, page, limit) => {
  return {
    totalItems: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    pageSize: limit,
  };
};
