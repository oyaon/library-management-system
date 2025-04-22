const paginate = require('../utils/formatter').formatDate ?
  require('../utils/pagination') : require('../utils/pagination');

// Simple stub model: find returns this, countDocuments returns a promise
const createStubModel = (docs) => {
  const execMock = jest.fn().mockResolvedValue(docs);
  const countMock = jest.fn().mockResolvedValue(docs.length);

  const query = {
    skip: () => query,
    limit: () => query,
    sort: () => query,
    exec: execMock,
  };

  const model = {
    find: () => query,
    countDocuments: countMock,
  };
  return { model, execMock, countMock };
};

describe('paginate util', () => {
  it('paginates a stub model correctly', async () => {
    const docs = ['a', 'b', 'c'];
    const { model } = createStubModel(docs);
    const result = await paginate(model, {}, { page: '2', limit: '2' });

    expect(result.docs).toEqual(docs);
    expect(result.pagination).toMatchObject({
      total: 3,
      totalPages: 2,
      page: 2,
      limit: 2,
    });
  });
});
