import React, { useMemo, useState } from 'react';
import SectionHeader from '../components/SectionHeader';
import { Search, Download } from 'lucide-react';

export default function Transactions({ transactions }) {
  const [query, setQuery] = useState('');
  const [platform, setPlatform] = useState('All');
  const [type, setType] = useState('All');

  const platforms = ['All', ...new Set(transactions.map(t => t.platform))];

  const rows = useMemo(
    () =>
      transactions.filter(transaction => {
        const matchesPlatform =
          platform === 'All' || transaction.platform === platform;
        const matchesType =
          type === 'All' || transaction.type === type;

        const searchText =
          `${transaction.platform} ${transaction.asset} ${transaction.id}`
            .toLowerCase();

        return (
          matchesPlatform &&
          matchesType &&
          searchText.includes(query.toLowerCase())
        );
      }),
    [transactions, query, platform, type]
  );

  return (
    <>
      <SectionHeader
        eyebrow="HISTORY"
        title="Transactions"
        description="Imported investment activity across your statements."
        action={
          <button className="secondary">
            <Download size={16} /> Export
          </button>
        }
      />

      <div className="filterbar card">
        <div className="search inline">
          <Search size={17} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search transactions..."
          />
        </div>

        <select value={platform} onChange={e => setPlatform(e.target.value)}>
          {platforms.map(item => (
            <option key={item}>{item}</option>
          ))}
        </select>

        <select value={type} onChange={e => setType(e.target.value)}>
          <option>All</option>
          <option>BUY</option>
          <option>SELL</option>
        </select>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Date</th>
                <th>Platform</th>
                <th>Asset</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
                <th>Currency</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {rows.length ? (
                rows.map(transaction => (
                  <tr key={transaction.id}>
                    <td>
                      <code>{transaction.id}</code>
                    </td>
                    <td>{transaction.date}</td>
                    <td>{transaction.platform}</td>
                    <td>
                      <strong>{transaction.asset}</strong>
                    </td>
                    <td>
                      <span className="type-chip">
                        {transaction.type}
                      </span>
                    </td>
                    <td>{transaction.qty}</td>
                    <td>
                      {transaction.currency === 'USD' ? '$' : '₹'}
                      {Number(transaction.price).toLocaleString('en-IN')}
                    </td>
                    <td>
                      {transaction.currency === 'USD' ? '$' : '₹'}
                      {Number(transaction.total).toLocaleString('en-IN')}
                    </td>
                    <td>{transaction.currency || 'INR'}</td>
                    <td>
                      <span className="status">
                        {transaction.status || 'Imported'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10">
                    <div className="empty-preview">
                      <strong>No transactions</strong>
                      <span className="muted">
                        Import a statement to create transaction history.
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
