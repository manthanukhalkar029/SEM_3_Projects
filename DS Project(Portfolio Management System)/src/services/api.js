// Future Spring Boot integration layer. Keep UI independent from backend endpoints.
const API_BASE='http://localhost:8080/api';
export const api={
  async get(path){return fetch(`${API_BASE}${path}`).then(r=>r.json())},
  async uploadStatement(formData){return fetch(`${API_BASE}/imports`,{method:'POST',body:formData}).then(r=>r.json())},
  async getHoldings(){return api.get('/portfolio/holdings')},
  async getTransactions(){return api.get('/transactions')},
  async getPrices(symbols){return fetch(`${API_BASE}/market/prices?symbols=${symbols.join(',')}`).then(r=>r.json())}
};
