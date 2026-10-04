import React from 'react';

const cls = {
  Stock: 'stock',
  'Foreign Equity': 'foreign-equity',
  ETF: 'etf',
  'Mutual Fund': 'mf',
  Bond: 'bond',
  Crypto: 'crypto'
};

export default function AssetBadge({ type }) {
  return (
    <span className={`asset-badge ${cls[type] || ''}`}>
      {type}
    </span>
  );
}
