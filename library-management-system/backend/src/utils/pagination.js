/**
 * Generic pagination helper for Mongoose models.
 * @param {import('mongoose').Model} model - Mongoose model to paginate.
 * @param {Object} filter - Mongoose filter object.
 * @param {Object} query - Express request query params.
 * @param {Object} [options] - Optional settings: sort, populate, select.
 * @returns {Promise<{docs: Array, pagination: {total: number, totalPages: number, page: number, limit: number}}>} 
 */
async function paginate(model, filter = {}, query = {}, options = {}) {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const sort = options.sort || { createdAt: -1 };
  let docsQuery = model.find(filter)
    .skip(skip)
    .limit(limit)
    .sort(sort);

  if (options.select) {
    docsQuery = docsQuery.select(options.select);
  }

  if (options.populate) {
    if (Array.isArray(options.populate)) {
      options.populate.forEach(path => {
        docsQuery = docsQuery.populate(path);
      });
    } else {
      docsQuery = docsQuery.populate(options.populate);
    }
  }

  const docsPromise = docsQuery.exec();
  const countPromise = model.countDocuments(filter);

  const [docs, total] = await Promise.all([docsPromise, countPromise]);
  const totalPages = Math.ceil(total / limit);

  return { docs, pagination: { total, totalPages, page, limit } };
}

module.exports = paginate;
