import React, { useEffect, useMemo, useState } from 'react';
import SectionHeader from '../components/SectionHeader';
import {
  Link2,
  Hash,
  GitBranch,
  ArrowDownAZ,
  Layers,
  Clock3,
  Search,
  Plus,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  CheckCircle2,
  Zap,
  Database,
  GitCommitHorizontal,
  ListOrdered,
  Eye,
  Minus
} from 'lucide-react';

const BUCKETS = 7;

const valueOf = holding => Number(holding.qty || 0) * Number(holding.current || 0);
const profitOf = holding => valueOf(holding) - Number(holding.invested || 0);
const returnOf = holding => Number(holding.invested || 0) ? profitOf(holding) / Number(holding.invested || 0) : 0;

function hashSymbol(symbol) {
  return [...String(symbol || '')].reduce((sum, char) => sum + char.charCodeAt(0), 0) % BUCKETS;
}

function buildBST(items) {
  let root = null;
  const insert = (node, item) => {
    if (!node) return { item, left: null, right: null };
    if (item.value < node.item.value) node.left = insert(node.left, item);
    else node.right = insert(node.right, item);
    return node;
  };
  items.forEach(item => { root = insert(root, item); });
  return root;
}

function treeRows(root) {
  if (!root) return [];
  const rows = [];
  const walk = (node, depth = 0, side = 'ROOT') => {
    if (!node) return;
    rows.push({ ...node.item, depth, side });
    walk(node.left, depth + 1, 'L');
    walk(node.right, depth + 1, 'R');
  };
  walk(root);
  return rows;
}

function traverse(root, order, result = []) {
  if (!root) return result;
  if (order === 'preorder') result.push(root.item);
  traverse(root.left, order, result);
  if (order === 'inorder') result.push(root.item);
  traverse(root.right, order, result);
  if (order === 'postorder') result.push(root.item);
  return result;
}

function mergeSort(values) {
  if (values.length <= 1) return values;
  const middle = Math.floor(values.length / 2);
  const left = mergeSort(values.slice(0, middle));
  const right = mergeSort(values.slice(middle));
  const result = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    if (left[i].score >= right[j].score) result.push(left[i++]);
    else result.push(right[j++]);
  }
  return result.concat(left.slice(i), right.slice(j));
}

function Panel({ icon: Icon, eyebrow, title, complexity, children }) {
  return (
    <div className="card ds-panel">
      <div className="ds-panel-head">
        <div className="ds-icon"><Icon size={19} /></div>
        <div>
          <div className="eyebrow">{eyebrow}</div>
          <h3>{title}</h3>
        </div>
        {complexity && <span className="complexity">{complexity}</span>}
      </div>
      {children}
    </div>
  );
}

export default function DataStructures({ holdings, transactions, importHistory, undoLatestImport }) {
  const [active, setActive] = useState('overview');
  const [list, setList] = useState(transactions);
  const [listSearch, setListSearch] = useState('');
  const [newTxn, setNewTxn] = useState('DEMO-TXN');
  const [hashSearch, setHashSearch] = useState(holdings[0]?.symbol || 'RELIANCE');
  const [hashResult, setHashResult] = useState(null);
  const [bstOrder, setBstOrder] = useState('inorder');
  const [sortBy, setSortBy] = useState('profit');
  const [sortResult, setSortResult] = useState([]);
  const [sortRunning, setSortRunning] = useState(false);
  const [stackItems, setStackItems] = useState([]);
  const [queue, setQueue] = useState(holdings.slice(0, 5).map(h => h.symbol));
  const [queueInput, setQueueInput] = useState('');
  const [operationMessage, setOperationMessage] = useState('Select a structure to start interacting.');

  useEffect(() => setList(transactions), [transactions]);
  useEffect(() => {
    setStackItems(importHistory.map(item => item.id));
  }, [importHistory]);

  const hashBuckets = useMemo(() => {
    const buckets = Array.from({ length: BUCKETS }, () => []);
    holdings.forEach(holding => buckets[hashSymbol(holding.symbol)].push(holding));
    return buckets;
  }, [holdings]);

  const bstRoot = useMemo(
    () => buildBST(holdings.map(h => ({ symbol: h.symbol, value: valueOf(h), profit: profitOf(h) }))),
    [holdings]
  );
  const bstRows = useMemo(() => treeRows(bstRoot), [bstRoot]);
  const bstTraversal = useMemo(() => traverse(bstRoot, bstOrder), [bstRoot, bstOrder]);
  const bstSortedValues = useMemo(() => [...holdings].sort((a, b) => valueOf(a) - valueOf(b)), [holdings]);

  const sortData = useMemo(() => holdings.map(h => ({
    symbol: h.symbol,
    score: sortBy === 'value' ? valueOf(h) : sortBy === 'return' ? returnOf(h) * 100 : profitOf(h)
  })), [holdings, sortBy]);

  const filteredList = list.filter(item =>
    `${item.id} ${item.asset} ${item.platform} ${item.type}`.toLowerCase().includes(listSearch.toLowerCase())
  );

  const listSearchResult = listSearch
    ? list.find(item => `${item.id} ${item.asset}`.toLowerCase().includes(listSearch.toLowerCase()))
    : null;

  const runSort = () => {
    setSortRunning(true);
    setSortResult([]);
    const sorted = mergeSort(sortData);
    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setSortResult(sorted.slice(0, index));
      if (index >= sorted.length) {
        clearInterval(timer);
        setSortRunning(false);
      }
    }, 220);
  };

  const addNode = () => {
    const id = newTxn.trim() || `DEMO-${Date.now()}`;
    setList(previous => [...previous, {
      id,
      date: new Date().toISOString().slice(0, 10),
      platform: 'Simulation',
      asset: 'DEMO',
      type: 'BUY',
      qty: 1,
      price: 100,
      total: 100,
      currency: 'INR',
      status: 'Simulation'
    }]);
    setOperationMessage(`Inserted ${id} at the end of the transaction list.`);
    setNewTxn('');
  };

  const deleteNode = () => {
    const target = listSearch.trim().toLowerCase();
    if (!target) return setOperationMessage('Enter an ID or asset to delete a node.');
    const index = list.findIndex(item => `${item.id} ${item.asset}`.toLowerCase().includes(target));
    if (index < 0) return setOperationMessage('No matching node found.');
    const removed = list[index];
    setList(previous => previous.filter((_, i) => i !== index));
    setOperationMessage(`Deleted node ${removed.id}.`);
  };

  const findHash = () => {
    const symbol = hashSearch.trim().toUpperCase();
    const bucket = hashSymbol(symbol);
    const match = holdings.find(h => h.symbol.toUpperCase() === symbol);
    setHashResult({ symbol, bucket, match });
    setOperationMessage(match ? `${symbol} found in bucket ${bucket}.` : `${symbol} is not present in the hash table.`);
  };

  const popStack = () => {
    if (!stackItems.length) return setOperationMessage('Stack is empty.');
    const popped = stackItems[stackItems.length - 1];
    const success = undoLatestImport();
    if (success) {
      setOperationMessage(`POP → ${popped}. Latest import restored.`);
    }
  };

  const enqueue = () => {
    const symbol = queueInput.trim().toUpperCase();
    if (!symbol) return;
    setQueue(previous => [...previous, symbol]);
    setQueueInput('');
    setOperationMessage(`ENQUEUE → ${symbol}`);
  };

  const dequeue = () => {
    if (!queue.length) return setOperationMessage('Queue is empty.');
    setOperationMessage(`DEQUEUE → ${queue[0]}`);
    setQueue(previous => previous.slice(1));
  };

  const resetSimulation = () => {
    setList(transactions);
    setListSearch('');
    setHashResult(null);
    setSortResult([]);
    setQueue(holdings.slice(0, 5).map(h => h.symbol));
    setQueueInput('');
    setOperationMessage('Frontend simulation reset to current portfolio data.');
  };

  const tabs = [
    ['overview', 'Overview'],
    ['linked-list', 'Linked List'],
    ['hash', 'Hash Table'],
    ['bst', 'BST'],
    ['sorting', 'Sorting'],
    ['stack', 'Stack'],
    ['queue', 'Queue']
  ];

  return (
    <>
      <SectionHeader
        eyebrow="DS VISUALIZATION"
        title="Interactive Data Structures"
        description="Explore how PortfolioX uses data structures to process real portfolio concepts. Current interactions run as a frontend simulation; the final source of truth will be the Java Spring Boot implementation."
      />

      <div className="ds-toolbar card">
        <div className="segmented ds-tabs">
          {tabs.map(([id, label]) => (
            <button key={id} className={active === id ? 'selected' : ''} onClick={() => setActive(id)}>
              {label}
            </button>
          ))}
        </div>
        <div className="ds-toolbar-actions">
          <span className="simulation-badge"><Zap size={12} /> Frontend Simulation</span>
          <button className="secondary" onClick={resetSimulation}><RotateCcw size={13} /> Reset</button>
        </div>
      </div>

      <div className="ds-operation-message"><CheckCircle2 size={14} /> {operationMessage}</div>

      {active === 'overview' && (
        <div className="ds-overview-grid">
          <div className="card ds-overview-hero">
            <div className="eyebrow">HOW PORTFOLIOX USES DS</div>
            <h2>Every structure has a real job.</h2>
            <p className="muted">Import data, find holdings quickly, organize them, rank them, process updates and undo imports — each action maps naturally to a classic data structure.</p>
            <div className="ds-flow">
              <span><Database size={14} /> Import</span><ChevronRight size={14}/>
              <span><Link2 size={14} /> Linked List</span><ChevronRight size={14}/>
              <span><Hash size={14} /> Hash Table</span><ChevronRight size={14}/>
              <span><ArrowDownAZ size={14} /> Sort</span>
            </div>
          </div>
          <div className="ds-mini-grid">
            {[
              ['Linked List', `${list.length} nodes`, 'Transaction history', Link2],
              ['Hash Table', `${holdings.length} holdings`, 'Symbol → Holding', Hash],
              ['BST', `${holdings.length} nodes`, 'Current value order', GitBranch],
              ['Stack', `${stackItems.length} imports`, 'Undo / LIFO', Layers],
              ['Queue', `${queue.length} jobs`, 'Price updates / FIFO', Clock3],
              ['Sorting', 'Merge Sort', 'Portfolio ranking', ArrowDownAZ]
            ].map(([title, value, desc, Icon]) => (
              <button key={title} className="card ds-mini-card" onClick={() => setActive(title === 'Linked List' ? 'linked-list' : title === 'Hash Table' ? 'hash' : title === 'BST' ? 'bst' : title === 'Stack' ? 'stack' : title === 'Queue' ? 'queue' : 'sorting')}>
                <Icon size={17}/><strong>{title}</strong><span>{value}</span><small>{desc}</small>
              </button>
            ))}
          </div>
        </div>
      )}

      {active === 'linked-list' && (
        <Panel icon={Link2} eyebrow="LINKED LIST" title="Interactive transaction chain" complexity="Search O(n) · Insert O(1) at tail">
          <div className="ds-controls">
            <div className="ds-control-group"><label>Search node</label><div className="input-with-icon"><Search size={14}/><input value={listSearch} onChange={e => setListSearch(e.target.value)} placeholder="TXN-1008 or RELIANCE" /></div></div>
            <div className="ds-control-group"><label>New node ID</label><input value={newTxn} onChange={e => setNewTxn(e.target.value)} placeholder="DEMO-TXN" /></div>
            <div className="ds-control-buttons"><button className="primary" onClick={addNode}><Plus size={14}/> Insert</button><button className="secondary" onClick={deleteNode}><Trash2 size={14}/> Delete</button></div>
          </div>
          {listSearchResult && <div className="ds-result success"><CheckCircle2 size={14}/> Found <strong>{listSearchResult.id}</strong> — {listSearchResult.asset}</div>}
          <div className="linked-chain">
            {filteredList.length ? filteredList.map((item, index) => (
              <React.Fragment key={`${item.id}-${index}`}>
                <div className={`list-node ${listSearchResult?.id === item.id ? 'highlight' : ''}`}><span>{index === 0 ? 'HEAD' : `NODE ${index + 1}`}</span><strong>{item.id}</strong><small>{item.asset} · {item.type}</small></div>
                {index < filteredList.length - 1 && <div className="chain-arrow">→</div>}
              </React.Fragment>
            )) : <div className="empty-preview">No matching nodes.</div>}
            {filteredList.length > 0 && <><div className="chain-arrow">→</div><div className="null-node">NULL</div></>}
          </div>
          <div className="ds-explain"><strong>Why Linked List?</strong><span>Imported transactions form an ordered history. In the final Java backend, each transaction will be represented by a linked-list node and traversed when transaction history is requested.</span></div>
        </Panel>
      )}

      {active === 'hash' && (
        <Panel icon={Hash} eyebrow="HASH TABLE" title="Symbol → Holding lookup" complexity="Average lookup O(1)">
          <div className="ds-controls">
            <div className="ds-control-group wide"><label>Search symbol</label><div className="input-with-icon"><Search size={14}/><input value={hashSearch} onChange={e => setHashSearch(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && findHash()} placeholder="RELIANCE" /></div></div>
            <button className="primary ds-action" onClick={findHash}><Search size={14}/> Hash & Search</button>
          </div>
          {hashResult && <div className={`ds-result ${hashResult.match ? 'success' : 'warning'}`}><Hash size={14}/> hash("{hashResult.symbol}") → bucket <strong>{hashResult.bucket}</strong> → {hashResult.match ? `Holding found: ${hashResult.match.name}` : 'no holding found'}</div>}
          <div className="hash-grid">
            {hashBuckets.map((bucket, index) => <div className={`hash-bucket ${hashResult?.bucket === index ? 'active' : ''}`} key={index}><div className="bucket-head"><span>Bucket {index}</span><small>{bucket.length} item{bucket.length !== 1 ? 's' : ''}</small></div>{bucket.length ? bucket.map(h => <div className="hash-item" key={h.symbol}><strong>{h.symbol}</strong><span>{h.qty} units</span></div>) : <div className="bucket-empty">empty</div>}</div>)}
          </div>
          <div className="ds-explain"><strong>Why Hash Table?</strong><span>When a market-price update arrives for RELIANCE, PortfolioX can calculate its bucket and quickly retrieve the corresponding holding instead of scanning every holding.</span></div>
        </Panel>
      )}

      {active === 'bst' && (
        <Panel icon={GitBranch} eyebrow="BINARY SEARCH TREE" title="Holdings ordered by current value" complexity="Search avg O(log n) · Traversal O(n)">
          <div className="ds-controls">
            <div className="ds-control-group"><label>Traversal</label><select value={bstOrder} onChange={e => setBstOrder(e.target.value)}><option value="inorder">Inorder</option><option value="preorder">Preorder</option><option value="postorder">Postorder</option></select></div>
            <div className="bst-stat"><span>Minimum</span><strong>{bstSortedValues.length ? bstSortedValues[0].symbol : '—'}</strong></div>
            <div className="bst-stat"><span>Root</span><strong>{bstRoot?.item.symbol || '—'}</strong></div>
            <div className="bst-stat"><span>Maximum</span><strong>{bstSortedValues.length ? bstSortedValues[bstSortedValues.length - 1].symbol : '—'}</strong></div>
          </div>
          <div className="tree-stage">
            {bstRows.map(node => <div key={`${node.symbol}-${node.depth}-${node.side}`} className="tree-node" style={{ '--depth': node.depth, '--offset': node.depth * 36 + node.depth * 8 }}><strong>{node.symbol}</strong><span>₹{Math.round(node.value).toLocaleString('en-IN')}</span></div>)}
          </div>
          <div className="traversal-output"><span>{bstOrder.toUpperCase()}</span>{bstTraversal.map((item, i) => <React.Fragment key={item.symbol}><strong>{item.symbol}</strong>{i < bstTraversal.length - 1 && <ChevronRight size={12}/>}</React.Fragment>)}</div>
          <div className="ds-explain"><strong>Why BST?</strong><span>For the project, holdings can be organized by current value so ordered traversals and minimum/maximum demonstrations are visible. The final Java backend will own the BST implementation.</span></div>
        </Panel>
      )}

      {active === 'sorting' && (
        <Panel icon={ArrowDownAZ} eyebrow="SORTING" title="Portfolio ranking with Merge Sort" complexity="Merge Sort O(n log n)">
          <div className="ds-controls">
            <div className="ds-control-group"><label>Rank by</label><select value={sortBy} onChange={e => { setSortBy(e.target.value); setSortResult([]); }}><option value="profit">Highest P/L</option><option value="return">Highest Return</option><option value="value">Largest Holding</option></select></div>
            <button className="primary ds-action" onClick={runSort} disabled={sortRunning}>{sortRunning ? <><Pause size={14}/> Sorting…</> : <><Play size={14}/> Run Merge Sort</>}</button>
          </div>
          <div className="sort-bars">
            {(sortResult.length ? sortResult : sortData.slice(0, 8)).map((item, index) => {
              const max = Math.max(...sortData.map(x => Math.abs(x.score)), 1);
              const width = Math.max(8, Math.round((Math.abs(item.score) / max) * 100));
              return <div className="sort-row" key={item.symbol}><span>{index + 1}</span><strong>{item.symbol}</strong><div className="sort-track"><div className="sort-fill" style={{ width: `${width}%` }}/></div><small>{sortBy === 'return' ? `${item.score.toFixed(2)}%` : `₹${Math.round(item.score).toLocaleString('en-IN')}`}</small></div>;
            })}
          </div>
          <div className="ds-explain"><strong>What to demonstrate in viva?</strong><span>Explain that Merge Sort divides the holdings into smaller parts, sorts them and merges them. The UI animation is only a visualization; the final Java implementation performs the actual sorting.</span></div>
        </Panel>
      )}

      {active === 'stack' && (
        <Panel icon={Layers} eyebrow="STACK" title="Import history / undo" complexity="Push O(1) · Pop O(1) · LIFO">
          <div className="stack-layout">
            <div className="stack-visual">
              <div className="stack-label">TOP</div>
              {stackItems.length ? stackItems.slice().reverse().map((id, index) => <div className={`stack-item ${index === 0 ? 'top' : ''}`} key={id}><span>{index === 0 ? 'TOP → ' : ''}{id}</span>{index === 0 && <Eye size={13}/>}</div>) : <div className="stack-empty">EMPTY</div>}
              <div className="stack-base" />
            </div>
            <div className="stack-actions"><h4>Operations</h4><p className="muted">The latest imported statement is on top. Popping it triggers the existing PortfolioX undo-import action.</p><button className="primary" onClick={popStack} disabled={!stackItems.length}><Minus size={14}/> Pop latest import</button><div className="operation-card"><strong>Peek</strong><span>{stackItems.length ? stackItems[stackItems.length - 1] : 'EMPTY'}</span></div></div>
          </div>
          <div className="ds-explain"><strong>Why Stack?</strong><span>Imports are naturally LIFO: if the user wants to undo an import, the newest import should be removed first. This directly maps to Stack.pop().</span></div>
        </Panel>
      )}

      {active === 'queue' && (
        <Panel icon={Clock3} eyebrow="QUEUE" title="Price update processing" complexity="Enqueue O(1) · Dequeue O(1) · FIFO">
          <div className="ds-controls">
            <div className="ds-control-group wide"><label>Symbol to enqueue</label><input value={queueInput} onChange={e => setQueueInput(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && enqueue()} placeholder="RELIANCE" /></div>
            <button className="primary ds-action" onClick={enqueue}><Plus size={14}/> Enqueue</button>
            <button className="secondary ds-action" onClick={dequeue} disabled={!queue.length}><Minus size={14}/> Dequeue</button>
          </div>
          <div className="queue-stage"><div className="queue-end"><span>FRONT</span><small>dequeue</small></div>{queue.map((symbol, index) => <React.Fragment key={`${symbol}-${index}`}><div className={`queue-item ${index === 0 ? 'next' : ''}`}><strong>{symbol}</strong><span>{index === 0 ? 'next' : `#${index + 1}`}</span></div>{index < queue.length - 1 && <ChevronRight size={15}/>}</React.Fragment>)}<div className="queue-end"><span>REAR</span><small>enqueue</small></div></div>
          <div className="ds-explain"><strong>Why Queue?</strong><span>Market-price update jobs can be processed in arrival order. A queue prevents a later update from jumping ahead of earlier pending work.</span></div>
        </Panel>
      )}
    </>
  );
}
