import React from 'react';
import {
  IndianRupee,
  TrendingUp,
  Layers3,
  RefreshCw,
  Upload,
  ArrowUpRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { performance } from '../data/mockData';
import SectionHeader from '../components/SectionHeader';
import MetricCard from '../components/MetricCard';
import AssetBadge from '../components/AssetBadge';
import { Link } from 'react-router-dom';

const valueOf = holding => Number(holding.qty || 0) * Number(holding.current || 0);

export default function Dashboard({ holdings, transactions, user }) {
  const totalInvested = holdings.reduce(
    (sum, holding) => sum + Number(holding.invested || 0),
    0
  );

  const totalValue = holdings.reduce(
    (sum, holding) => sum + valueOf(holding),
    0
  );

  const profitLoss = totalValue - totalInvested;

  const returnPct = totalInvested
    ? (profitLoss / totalInvested) * 100
    : 0;

  const profitable = holdings.filter(
    holding => valueOf(holding) >= Number(holding.invested || 0)
  ).length;

  const firstName = user?.name?.split(' ')[0] || 'Investor';

  const latestPerformance = holdings.length
    ? [
        ...performance.slice(0, Math.max(0, 6 - holdings.length)),
        {
          date: 'Now',
          value: totalValue
        }
      ]
    : [];

  return (
    <>
      <SectionHeader
        eyebrow="PORTFOLIO OVERVIEW"
        title={`Good morning, ${firstName}`}
        description={
          holdings.length
            ? 'Here’s how your monitored investments are doing.'
            : 'Your portfolio is currently empty. Import a statement to get started.'
        }
        action={
          <Link className="secondary" to="/imports">
            <Upload size={16} /> Import statement
          </Link>
        }
      />

      <div className="metrics">
        <MetricCard
          label="Total portfolio value"
          value={`₹${totalValue.toLocaleString('en-IN', {
            maximumFractionDigits: 0
          })}`}
          sub={holdings.length ? 'Across monitored holdings' : 'No holdings yet'}
          icon={IndianRupee}
        />

        <MetricCard
          label="Total invested"
          value={`₹${totalInvested.toLocaleString('en-IN', {
            maximumFractionDigits: 0
          })}`}
          sub="From imported transactions"
          icon={Layers3}
        />

        <MetricCard
          label="Overall P/L"
          value={`${profitLoss >= 0 ? '+' : '-'}₹${Math.abs(
            profitLoss
          ).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          change={`${profitLoss >= 0 ? '+' : ''}${returnPct.toFixed(2)}% return`}
          icon={TrendingUp}
        />

        <MetricCard
          label="Holdings monitored"
          value={holdings.length}
          sub={`${profitable} currently profitable`}
          icon={RefreshCw}
        />
      </div>

      <div className="grid-2">
        <div className="card chart-card">
          <div className="card-title">
            <div>
              <h3>Portfolio value</h3>
              <p className="muted">
                Latest available monitored value
              </p>
            </div>
            <span className="live">
              <i /> Monitoring
            </span>
          </div>

          <div className="chart">
            {latestPerformance.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={latestPerformance}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    hide
                    domain={['dataMin - 20000', 'dataMax + 20000']}
                  />
                  <Tooltip
                    formatter={value =>
                      `₹${Number(value).toLocaleString('en-IN')}`
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--primary)"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-preview">
                <strong>No portfolio history yet</strong>
                <span className="muted">
                  Import transactions to start monitoring performance.
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            <div>
              <h3>Asset mix</h3>
              <p className="muted">What your portfolio contains</p>
            </div>
            <Link to="/analytics" className="text-link">
              View analytics <ArrowUpRight size={15} />
            </Link>
          </div>

          <div className="mix-list">
            {['Stock', 'Foreign Equity', 'ETF', 'Mutual Fund', 'Bond', 'Crypto'].map(type => {
              const items = holdings.filter(h => h.type === type);
              const value = items.reduce((sum, h) => sum + valueOf(h), 0);

              return (
                <div className="mix-row" key={type}>
                  <div>
                    <AssetBadge type={type} />
                    <span>
                      {items.length} holding
                      {items.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <strong>
                    ₹{value.toLocaleString('en-IN', {
                      maximumFractionDigits: 0
                    })}
                  </strong>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          <div>
            <h3>Recently imported</h3>
            <p className="muted">
              Latest transactions from your statements
            </p>
          </div>
          <Link to="/transactions" className="text-link">
            View all <ArrowUpRight size={15} />
          </Link>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Platform</th>
                <th>Asset</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {transactions.slice(0, 5).map(transaction => (
                <tr key={transaction.id}>
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
                    {Number(transaction.total).toLocaleString('en-IN')}
                  </td>
                  <td>
                    <span className="status">
                      {transaction.status || 'Imported'}
                    </span>
                  </td>
                </tr>
              ))}

              {!transactions.length && (
                <tr>
                  <td colSpan="7">
                    <div className="empty-preview">
                      <strong>No imported transactions</strong>
                      <span className="muted">
                        Your new account starts with a blank portfolio.
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
