import React, { useMemo, useState } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Undo2
} from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import { importApi } from '../services/api';

const normalize = (v = '') =>
  String(v).trim().toLowerCase().replace(/[^a-z0-9.-]/g, '');

const splitCsv = line => {
  const out = [];
  let current = '';
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      out.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  out.push(current.trim());
  return out;
};

const parseCsv = (text, selectedPlatform) => {
  const lines = text.split(/\r?\n/).filter(Boolean);

  if (lines.length < 2) return [];

  const headers = splitCsv(lines[0]).map(normalize);

  const find = names =>
    headers.findIndex(header => names.includes(header));

  const dateI = find(['date', 'transactiondate', 'tradedate', 'orderdate']);
  const platformI = find(['platform', 'source']);
  const assetI = find(['symbol', 'asset', 'ticker', 'stock']);
  const typeI = find(['transactiontype', 'type', 'action', 'tradetype']);
  const qtyI = find(['quantity', 'qty', 'units']);
  const priceI = find(['price', 'averageprice', 'avgprice', 'rate']);
  const totalI = find(['totalamount', 'amount', 'value', 'total']);
  const currencyI = find(['currency']);
  const nameI = find(['name', 'assetname', 'company']);
  const assetTypeI = find(['assettype', 'category', 'instrumenttype']);
  const transactionIdI = find(['transactionid', 'transactionno', 'orderno', 'id']);

  return lines.slice(1).map((line, index) => {
    const cells = splitCsv(line);

    const type =
      (cells[typeI >= 0 ? typeI : 0] || 'BUY').toUpperCase() === 'SELL'
        ? 'SELL'
        : 'BUY';

    const quantity = Number(cells[qtyI >= 0 ? qtyI : 0]) || 0;
    const price = Number(cells[priceI >= 0 ? priceI : 0]) || 0;
    const total =
      Number(cells[totalI >= 0 ? totalI : 0]) || quantity * price;

    const date =
      cells[dateI >= 0 ? dateI : 0] ||
      new Date().toISOString().slice(0, 10);

    const symbol =
      (cells[assetI >= 0 ? assetI : 1] || `ASSET-${index + 1}`)
        .trim()
        .toUpperCase();

    const name =
      cells[nameI >= 0 ? nameI : -1]?.trim() || symbol;

    const rowPlatform =
      platformI >= 0 && cells[platformI]
        ? cells[platformI].trim()
        : selectedPlatform;

    const currency =
      currencyI >= 0 && cells[currencyI]
        ? cells[currencyI].trim().toUpperCase()
        : 'INR';

    const assetType =
      assetTypeI >= 0 && cells[assetTypeI]
        ? cells[assetTypeI].trim()
        : 'Equity';

    const transactionId =
      transactionIdI >= 0 && cells[transactionIdI]
        ? cells[transactionIdI].trim()
        : '';

    return {
      id: transactionId || `IMP-${Date.now()}-${index}`,
      transactionId,
      date,
      platform: rowPlatform,
      asset: symbol,
      name,
      assetType,
      type,
      qty: quantity,
      price,
      total,
      status: 'Imported',
      currency
    };
  });
};

const transactionKey = t => {
  if (t.transactionId) {
    return `id|${normalize(t.transactionId)}`;
  }

  return [
    t.platform,
    t.date,
    t.asset,
    t.type,
    t.qty,
    t.price,
    t.total,
    t.currency || 'INR'
  ]
    .map(normalize)
    .join('|');
};

const holdingType = assetType => {
  if (assetType === 'ETF') return 'ETF';
  if (assetType === 'Mutual Fund') return 'Mutual Fund';
  if (assetType === 'Bond') return 'Bond';
  if (assetType === 'Crypto') return 'Crypto';
  if (assetType === 'Foreign Equity') return 'Foreign Equity';
  return 'Stock';
};

function applyTransactionsToHoldings(existing, newTransactions) {
  const next = existing.map(item => ({ ...item }));

  newTransactions.forEach(transaction => {
    const index = next.findIndex(
      holding =>
        holding.symbol === transaction.asset &&
        holding.platform === transaction.platform
    );

    const quantity = Number(transaction.qty) || 0;
    const price = Number(transaction.price) || 0;
    const total = Number(transaction.total) || quantity * price;

    if (index >= 0) {
      const holding = { ...next[index] };

      if (transaction.type === 'BUY') {
        const oldQty = Number(holding.qty) || 0;
        const newQty = oldQty + quantity;

        holding.avg =
          newQty > 0
            ? ((oldQty * Number(holding.avg || 0)) +
                quantity * price) /
              newQty
            : 0;

        holding.qty = newQty;
        holding.invested =
          Number(holding.invested || 0) + total;
      } else {
        const oldQty = Number(holding.qty) || 0;
        const sellQty = Math.min(oldQty, quantity);

        holding.qty = Math.max(0, oldQty - sellQty);
        holding.invested = Math.max(
          0,
          Number(holding.invested || 0) -
            sellQty * Number(holding.avg || 0)
        );
      }

      next[index] = holding;
      return;
    }

    if (transaction.type === 'BUY') {
      next.push({
        id: `${transaction.platform}-${transaction.asset}`,
        name: transaction.name || transaction.asset,
        symbol: transaction.asset,
        type: holdingType(transaction.assetType),
        platform: transaction.platform,
        qty: quantity,
        avg: price,
        current: price,
        invested: total,
        category: transaction.assetType || 'Equity',
        currency: transaction.currency || 'INR',
        fxRateToInr: transaction.currency === 'USD' ? 85 : 1,
        currentUpdatedAt: new Date().toISOString()
      });
    }
  });

  return next.filter(holding => Number(holding.qty) > 0);
};

export default function Imports({
  transactions,
  setTransactions,
  holdings,
  setHoldings,
  pushImportSnapshot,
  undoLatestImport,
  importHistory
}) {
  const [platform, setPlatform] = useState('Groww');
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [done, setDone] = useState(null);
  const [error, setError] = useState('');
  const [backendStatus, setBackendStatus] = useState('');

  const existingKeys = useMemo(
    () => new Set(transactions.map(transactionKey)),
    [transactions]
  );

  const newRows = useMemo(() => {
    const seen = new Set(existingKeys);

    return rows.filter(row => {
      const key = transactionKey(row);

      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    });
  }, [rows, existingKeys]);

  const duplicateRows = rows.length - newRows.length;

  const handleFile = async event => {
    const selected = event.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setDone(null);
    setError('');
    setBackendStatus('');
    setRows([]);

    if (!selected.name.toLowerCase().endsWith('.csv')) {
      setError(
        'CSV preview is supported in the frontend. Excel/PDF parsing will be handled by the Spring Boot backend.'
      );
      return;
    }

    try {
      const text = await selected.text();
      const parsed = parseCsv(text, platform);

      if (!parsed.length) {
        throw new Error('No transactions found in this statement.');
      }

      setRows(parsed);
    } catch (err) {
      setError(err.message || 'Could not parse this statement.');
    }
  };

  const importNew = async () => {
    if (!newRows.length) return;

    pushImportSnapshot();

    const mergedTransactions = [...transactions, ...newRows];
    const updatedHoldings = applyTransactionsToHoldings(
      holdings,
      newRows
    );

    setTransactions(mergedTransactions);
    setHoldings(updatedHoldings);

    // When Spring Boot is running, the same normalized records can be sent
    // to the real backend. The frontend still works without the backend.
    try {
      await importApi.importTransactions(newRows);
      setBackendStatus('Backend import endpoint accepted the records.');
    } catch {
      setBackendStatus(
        'Saved locally for now. Spring Boot backend is not running yet.'
      );
    }

    setDone({
      added: newRows.length,
      duplicates: duplicateRows
    });

    setRows([]);
    setFile(null);
  };

  const undo = () => {
    if (!importHistory.length) return;
    undoLatestImport();
    setDone(null);
    setRows([]);
    setFile(null);
  };

  return (
    <>
      <SectionHeader
        eyebrow="DATA IMPORT"
        title="Import Statements"
        description="Bring investment activity from multiple platforms into one monitoring system."
        action={
          <button
            className="secondary"
            disabled={!importHistory.length}
            onClick={undo}
          >
            <Undo2 size={16} /> Undo latest import
          </button>
        }
      />

      <div className="grid-2 import-grid">
        <div className="card import-card">
          <div className="upload-icon">
            <UploadCloud size={25} />
          </div>

          <h3>Upload a statement</h3>
          <p className="muted">
            PortfolioX compares the uploaded records with your existing
            transaction history and imports only new records.
          </p>

          <label>
            Source platform
            <select
              value={platform}
              onChange={e => setPlatform(e.target.value)}
            >
              <option>Groww</option>
              <option>INDmoney</option>
              <option>CoinSwitch</option>
              <option>Zerodha</option>
              <option>Upstox</option>
              <option>Other</option>
            </select>
          </label>

          <label className="dropzone">
            <input
              type="file"
              accept=".csv,.xlsx,.xls,.pdf"
              onChange={handleFile}
            />
            <FileText size={22} />
            <strong>
              {file ? file.name : 'Choose a statement file'}
            </strong>
            <span>
              CSV preview supported · Excel/PDF handled by backend later
            </span>
          </label>

          <button
            className="primary full"
            disabled={!newRows.length}
            onClick={importNew}
          >
            {newRows.length
              ? `Import ${newRows.length} new transaction${
                  newRows.length > 1 ? 's' : ''
                }`
              : 'Upload a CSV to preview'}
          </button>

          {error && (
            <div className="notice">
              <AlertCircle size={17} />
              <span>{error}</span>
            </div>
          )}

          {done && (
            <div className="success-box">
              <CheckCircle2 size={18} />
              <span>
                Imported <b>{done.added}</b> new transaction(s). Skipped{' '}
                <b>{done.duplicates}</b> duplicate(s).
              </span>
            </div>
          )}

          {backendStatus && (
            <div className="notice">
              <AlertCircle size={17} />
              <span>{backendStatus}</span>
            </div>
          )}
        </div>

        <div className="card import-card">
          <h3>Import preview</h3>

          {rows.length ? (
            <>
              <div className="import-summary">
                <div>
                  <strong>{newRows.length}</strong>
                  <span>New</span>
                </div>
                <div>
                  <strong>{duplicateRows}</strong>
                  <span>Duplicates</span>
                </div>
                <div>
                  <strong>{rows.length}</strong>
                  <span>Total rows</span>
                </div>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Platform</th>
                      <th>Asset</th>
                      <th>Type</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {rows.map(row => {
                      const isNew = newRows.some(
                        item => transactionKey(item) === transactionKey(row)
                      );

                      return (
                        <tr key={row.id}>
                          <td>{row.date}</td>
                          <td>{row.platform}</td>
                          <td>
                            <strong>{row.asset}</strong>
                          </td>
                          <td>{row.type}</td>
                          <td>{row.qty}</td>
                          <td>
                            {row.currency === 'USD' ? '$' : '₹'}
                            {row.price.toLocaleString('en-IN')}
                          </td>
                          <td>
                            <span
                              className={
                                isNew
                                  ? 'status'
                                  : 'status duplicate-status'
                              }
                            >
                              {isNew ? 'New' : 'Duplicate'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <button
                className="secondary full"
                onClick={() => {
                  setRows([]);
                  setFile(null);
                }}
              >
                <RefreshCw size={14} /> Clear preview
              </button>
            </>
          ) : (
            <div className="empty-preview">
              <FileText size={24} />
              <strong>No statement loaded</strong>
              <span className="muted">
                Upload a CSV to see which transactions are new and which
                already exist.
              </span>
            </div>
          )}

          <div className="notice">
            <AlertCircle size={17} />
            <span>
              Re-uploading the same statement does not create duplicate
              transaction records.
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
