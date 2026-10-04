import React, { useEffect, useMemo, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layouts/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Imports from './pages/Imports';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import DataStructures from './pages/DataStructures';
import Settings from './pages/Settings';
import { getSession, getUserData, saveUserData } from './services/localStore';

function Protected({ children }) {
  return getSession() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const session = getSession();

  const [theme, setTheme] = useState(
    localStorage.getItem('portfoliox_theme') || 'light'
  );

  const initialData = useMemo(
    () => getUserData(session?.email),
    [session?.email]
  );

  const [holdings, setHoldings] = useState(initialData.holdings || []);
  const [transactions, setTransactions] = useState(initialData.transactions || []);
  const [importHistory, setImportHistory] = useState(initialData.importHistory || []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('portfoliox_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!session?.email) return;

    saveUserData(session.email, {
      holdings,
      transactions,
      importHistory
    });
  }, [session?.email, holdings, transactions, importHistory]);

  const pushImportSnapshot = () => {
    setImportHistory(previous => [
      ...previous.slice(-9),
      {
        id: `IMP-${Date.now()}`,
        importedAt: new Date().toISOString(),
        holdings,
        transactions
      }
    ]);
  };

  const undoLatestImport = () => {
    if (!importHistory.length) return false;

    const latest = importHistory[importHistory.length - 1];

    setHoldings(latest.holdings || []);
    setTransactions(latest.transactions || []);
    setImportHistory(previous => previous.slice(0, -1));

    return true;
  };

  const resetPortfolio = () => {
    setHoldings([]);
    setTransactions([]);
    setImportHistory([]);
  };

  const appProps = {
    holdings,
    setHoldings,
    transactions,
    setTransactions,
    importHistory,
    setImportHistory,
    pushImportSnapshot,
    undoLatestImport,
    resetPortfolio,
    theme,
    setTheme,
    user: session
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/*"
        element={
          <Protected>
            <Layout {...appProps} />
          </Protected>
        }
      >
        <Route index element={<Dashboard {...appProps} />} />
        <Route path="portfolio" element={<Portfolio {...appProps} />} />
        <Route path="imports" element={<Imports {...appProps} />} />
        <Route path="transactions" element={<Transactions {...appProps} />} />
        <Route path="analytics" element={<Analytics {...appProps} />} />
        <Route path="data-structures" element={<DataStructures {...appProps} />} />
        <Route path="settings" element={<Settings {...appProps} />} />
      </Route>
    </Routes>
  );
}
