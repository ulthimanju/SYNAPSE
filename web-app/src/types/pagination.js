export const createPaginationMeta = (page = 1, pageSize = 20, total = 0, pages = 1) => ({
  page,
  page_size: pageSize,
  total,
  pages,
});

export const createPaginatedResponse = (data = [], pagination = {}, message = null, requestId = null) => ({
  success: true,
  message,
  data,
  pagination: createPaginationMeta(pagination.page, pagination.pageSize, pagination.total, pagination.pages),
  request_id: requestId,
});
