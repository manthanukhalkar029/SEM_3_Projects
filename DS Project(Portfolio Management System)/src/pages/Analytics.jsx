import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import SectionHeader from '../components/SectionHeader';
import { holdingValueInr, profitLoss, returnPercent } from '../utils/portfolio';

const colors = [
  '#2563eb',
  '#0ea5e9',
  '#14b8a6',
  '#8b5cf6',
  '#f59e0b'
];

export default function Analytics({ holdings, transactions }) {
  const types = ['Stock', 'ETF', 'Mutual Fund', 'Bond', 'Crypto'];

  const data = types
    .map(type => ({
      name: type,
      value: holdings
        .filter(holding => holding.type === type)
        .reduce((sum, holding) => sum + holdingValueInr(holding), 0)
    }))
    .filter(item => item.value > 0);

  const pl = holdings.map(holding => ({
    name: holding.symbol,
    value: profitLoss(holding)
  }));

  const totalValue = holdings.reduce(
    (sum, holding) => sum + holdingValueInr(holding),
    0
  );

  const largest = [...holdings].sort(
    (a, b) => holdingValueInr(b) - holdingValueInr(a)
  )[0];

  const positive = holdings.filter(holding => profitLoss(holding) >= 0).length;

  return (
    <>
      <SectionHeader
        eyebrow="ANALYTICS"
        title="Portfolio Analytics"
        description="Understand allocation, performance and the data behind your monitored portfolio."
      />

      <div className="grid-2">
        <div className="card chart-card">
          <div className="card-title">
            <div>
              <h3>Asset allocation</h3>
              <p className="muted">
                Current monitored value in INR reporting
              </p>
            </div>
          </div>

          <div className="chart donut">
            {data.length ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={72}
                    outerRadius={105}
                    paddingAngle={3}
                  >
                    {data.map((item, index) => (
                      <Cell
                        key={item.name}
                        fill={colors[index % colors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={value =>
                      `₹${Number(value).toLocaleString('en-IN')}`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-preview">
                <strong>No allocation data</strong>
                <span className="muted">
                  Import holdings to see allocation.
                </span>
              </div>
            )}
          </div>

          <div className="legend">
            {data.map((item, index) => (
              <span key={item.name}>
                <i
                  style={{
                    background: colors[index % colors.length]
                  }}
                />
                {item.name}
              </span>
            ))}
          </div>
        </div>

        <div className="card chart-card">
          <div className="card-title">
            <div>
              <h3>P/L by investment</h3>
              <p className="muted">Unrealized gain or loss</p>
            </div>
          </div>

          <div className="chart">
            {pl.length ? (
              <ResponsiveContainer>
                <BarChart data={pl}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={value =>
                      `₹${Number(value).toLocaleString('en-IN')}`
                    }
                  />
                  <Bar
                    dataKey="value"
                    fill="var(--primary)"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-preview">
                <strong>No P/L data</strong>
                <span className="muted">
                  Import transactions to calculate P/L.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="analytics-cards">
        <div className="card">
          <span className="muted">Largest holding</span>
          <strong>{largest?.symbol || '—'}</strong>
          <small>
            {largest
              ? `₹${holdingValueInr(largest).toLocaleString('en-IN')}`
              : 'No holdings'}
          </small>
        </div>

        <div className="card">
          <span className="muted">Asset classes</span>
          <strong>{data.length}</strong>
          <small>Currently represented</small>
        </div>

        <div className="card">
          <span className="muted">Imported transactions</span>
          <strong>{transactions.length}</strong>
          <small>From your uploaded statements</small>
        </div>

        <div className="card">
          <span className="muted">Profitable holdings</span>
          <strong>{positive}</strong>
          <small>
            Total monitored value ₹
            {totalValue.toLocaleString('en-IN', {
              maximumFractionDigits: 0
            })}
          </small>
        </div>
      </div>

      {largest && (
        <div className="notice">
          Portfolio return for {largest.symbol}:{' '}
          {returnPercent(largest).toFixed(2)}%. Foreign assets are
          reported in INR using the configured FX rate.
        </div>
      )}
    </>
  );
}
