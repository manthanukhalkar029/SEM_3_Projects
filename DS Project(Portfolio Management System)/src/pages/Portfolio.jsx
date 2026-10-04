import React, { useMemo, useState } from 'react';
import SectionHeader from '../components/SectionHeader';
import AssetBadge from '../components/AssetBadge';
import { Search, RefreshCw, Eye, ArrowDownAZ } from 'lucide-react';

const money = (value, currency = 'INR', digits = 2) => {
  const symbol = currency === 'USD' ? '$' : '₹';
  return `${symbol}${Number(value || 0).toLocaleString('en-IN', {
    maximumFractionDigits: digits
  })}`;
};

export default function Portfolio({ holdings }) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All');
  const [platform, setPlatform] = useState('All');
  const [sort, setSort] = useState('value');

  const platforms = ['All', ...new Set(holdings.map(h => h.platform))];

  const filtered = useMemo(() => {
    const result = holdings.filter(holding => {
      const matchesType = type === 'All' || holding.type === type;
      const matchesPlatform =
        platform === 'All' || holding.platform === platform;

      const searchText =
        `${holding.name} ${holding.symbol} ${holding.platform} ${holding.type}`
          .toLowerCase();

      return (
        matchesType &&
        matchesPlatform &&
        searchText.includes(query.toLowerCase())
      );
    });

    return [...result].sort((a, b) => {
      const aValue = a.qty * a.current;
      const bValue = b.qty * b.current;
      const aPl = aValue - a.invested;
      const bPl = bValue - b.invested;
      const aReturn = a.invested ? aPl / a.invested : 0;
      const bReturn = b.invested ? bPl / b.invested : 0;

      if (sort === 'profit') return bPl - aPl;
      if (sort === 'return') return bReturn - aReturn;
      if (sort === 'quantity') return b.qty - a.qty;

      return bValue - aValue;
    });
  }, [holdings, query, type, platform, sort]);

  return (
    <>
      <SectionHeader
        eyebrow="MY INVESTMENTS"
        title="Complete Portfolio"
        description="A consolidated view of every asset you are monitoring."
        action={
          <button className="secondary">
            <RefreshCw size={16} /> Refresh prices
          </button>
        }
      />

      <div className="filterbar card">
        <div className="search inline">
          <Search size={17} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name, symbol, platform or type..."
          />
        </div>

        <select value={platform} onChange={e => setPlatform(e.target.value)}>
          {platforms.map(item => (
            <option key={item}>{item}</option>
          ))}
        </select>

        <select value={sort} onChange={e => setSort(e.target.value)}>
          <option value="value">Largest holding</option>
          <option value="profit">Highest P/L</option>
          <option value="return">Highest return</option>
          <option value="quantity">Largest quantity</option>
        </select>

        <div className="segmented">
          {['All', 'Stock', 'Foreign Equity', 'ETF', 'Mutual Fund', 'Bond', 'Crypto'].map(
            item => (
              <button
                className={type === item ? 'selected' : ''}
                onClick={() => setType(item)}
                key={item}
              >
                {item}
              </button>
            )
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          <div>
            <h3>
              <ArrowDownAZ size={15} /> Portfolio ranking
            </h3>
            <p className="muted">
              {filtered.length} monitored holding
              {filtered.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Investment</th>
                <th>Type</th>
                <th>Platform</th>
                <th>Qty / Units</th>
                <th>Avg. cost</th>
                <th>Current price</th>
                <th>Current value</th>
                <th>P/L</th>
                <th>Return</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {filtered.length ? (
                filtered.map(holding => {
                  const value = holding.qty * holding.current;
                  const pl = value - holding.invested;
                  const returnPct = holding.invested
                    ? (pl / holding.invested) * 100
                    : 0;

                  return (
                    <tr key={holding.id}>
                      <td>
                        <strong>{holding.name}</strong>
                        <small>{holding.symbol}</small>
                      </td>

                      <td>
                        <AssetBadge type={holding.type} />
                      </td>

                      <td>{holding.platform}</td>
                      <td>{holding.qty}</td>
                      <td>{money(holding.avg, holding.currency)}</td>
                      <td>{money(holding.current, holding.currency)}</td>
                      <td>
                        <strong>
                          {money(value, holding.currency, 0)}
                        </strong>
                      </td>

                      <td className={pl >= 0 ? 'positive' : 'negative'}>
                        {pl >= 0 ? '+' : '-'}
                        {money(Math.abs(pl), holding.currency, 0)}
                      </td>

                      <td className={returnPct >= 0 ? 'positive' : 'negative'}>
                        {returnPct >= 0 ? '+' : ''}
                        {returnPct.toFixed(2)}%
                      </td>

                      <td>
                        <button className="icon-btn" title="View holding">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10">
                    <div className="empty-preview">
                      <strong>No holdings yet</strong>
                      <span className="muted">
                        Import an investment statement to populate this
                        portfolio.
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
