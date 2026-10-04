const API_BASE =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';
  return contentType.includes('application/json')
    ? response.json()
    : response.text();
}

export const authApi = {
  login: credentials =>
    request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    }),

  signup: user =>
    request('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    }),

  me: () => request('/auth/me')
};

export const portfolioApi = {
  getSummary: () => request('/portfolio/summary'),
  getHoldings: () => request('/portfolio/holdings'),
  getHolding: symbol =>
    request(`/portfolio/holdings/${encodeURIComponent(symbol)}`),
  getTransactions: () => request('/portfolio/transactions'),
  refreshPrices: () => request('/portfolio/prices/refresh'),
  undoImport: () =>
    request('/portfolio/undo-import', { method: 'POST' })
};

export const importApi = {
  importTransactions: transactions =>
    request('/portfolio/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transactions)
    })
};

export const dataStructureApi = {
  linkedList: () => request('/portfolio/datastructures/linked-list'),
  hashTable: () => request('/portfolio/datastructures/hash-table'),
  bst: () => request('/portfolio/datastructures/bst'),
  stack: () => request('/portfolio/datastructures/stack'),
  queue: () => request('/portfolio/datastructures/queue'),
  sortByProfit: () => request('/portfolio/sort/profit'),
  sortByReturn: () => request('/portfolio/sort/return')
};

export const api = {
  get: request,
  ...portfolioApi
};

export { API_BASE };
