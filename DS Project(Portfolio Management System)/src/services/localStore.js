import { holdings as demoHoldings, transactions as demoTransactions } from '../data/mockData';

const USERS_KEY = 'portfoliox_users';
const SESSION_KEY = 'portfoliox_session';
const DATA_PREFIX = 'portfoliox_data_';

const safeEmail = (email = '') => email.trim().toLowerCase();

export function getUsers() {
  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');

    // Seed one demo/existing account so the old sample portfolio remains
    // available while the project is still frontend-only.
    if (!users['demo@portfoliox.local']) {
      users['demo@portfoliox.local'] = {
        name: 'Demo Investor',
        password: 'demo123',
        createdAt: new Date().toISOString()
      };

      localStorage.setItem(USERS_KEY, JSON.stringify(users));

      if (!localStorage.getItem(dataKey('demo@portfoliox.local'))) {
        saveUserData('demo@portfoliox.local', {
          holdings: demoHoldings,
          transactions: demoTransactions,
          importHistory: []
        });
      }
    }

    return users;
  } catch {
    return {};
  }
}

export function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
}

export function setSession(user) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      email: safeEmail(user.email),
      name: user.name || user.email.split('@')[0]
    })
  );
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function dataKey(email) {
  return `${DATA_PREFIX}${safeEmail(email)}`;
}

export function getUserData(email) {
  if (!email) {
    return { holdings: [], transactions: [], importHistory: [] };
  }

  try {
    return (
      JSON.parse(localStorage.getItem(dataKey(email)) || 'null') || {
        holdings: [],
        transactions: [],
        importHistory: []
      }
    );
  } catch {
    return { holdings: [], transactions: [], importHistory: [] };
  }
}

export function saveUserData(email, data) {
  if (!email) return;
  localStorage.setItem(dataKey(email), JSON.stringify(data));
}

export function createUser({ name, email, password }) {
  const normalizedEmail = safeEmail(email);
  const users = getUsers();

  if (users[normalizedEmail]) {
    return { ok: false, error: 'An account with this email already exists.' };
  }

  users[normalizedEmail] = {
    name: name.trim(),
    password,
    createdAt: new Date().toISOString()
  };

  saveUsers(users);

  // Every new user starts with an intentionally blank portfolio.
  saveUserData(normalizedEmail, {
    holdings: [],
    transactions: [],
    importHistory: []
  });

  return { ok: true };
}

export function authenticate(email, password) {
  const normalizedEmail = safeEmail(email);
  const users = getUsers();
  const user = users[normalizedEmail];

  if (!user || user.password !== password) {
    return { ok: false, error: 'Invalid email or password.' };
  }

  return {
    ok: true,
    user: {
      email: normalizedEmail,
      name: user.name
    }
  };
}
