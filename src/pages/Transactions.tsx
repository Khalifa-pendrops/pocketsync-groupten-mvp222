import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError } from '../api/errors';
import type { TransactionRow } from '../types';
import { transactionService, type TransactionQuery } from '../services/transactionService';
import { formatSignedNgn, formatTransactionDate } from '../utils/format';
import './Transactions.css';
import lightningSvg from '../assets/icons/lightning.svg';

const FILTERS = ['All', 'Income', 'Expense', 'Transfer', 'Bills', 'Airtime'] as const;
type FilterLabel = (typeof FILTERS)[number];

const AIRTIME_PATTERN = /airtime|mtn|glo|airtel|data bundle|9mobile/i;

function filterToQuery(filter: FilterLabel): TransactionQuery {
  switch (filter) {
    case 'Income':
      return { type: 'credit' };
    case 'Expense':
      return { type: 'debit' };
    case 'Transfer':
      return { category: 'Transfer' };
    case 'Bills':
      return { category: 'Bills' };
    case 'Airtime':
      return { type: 'debit' };
    default:
      return {};
  }
}

function badgeClass(tx: TransactionRow): string {
  if (tx.type === 'credit') {
    return 'receive';
  }
  if (tx.category === 'Bills') {
    return 'bills';
  }
  if (tx.category === 'Transfer') {
    return 'transfer';
  }
  if (AIRTIME_PATTERN.test(tx.description)) {
    return 'airtime';
  }
  return 'transfer';
}

function matchesAirtime(tx: TransactionRow): boolean {
  return AIRTIME_PATTERN.test(tx.description) || tx.category === 'Bills' && /mtn|glo|data/i.test(tx.description);
}

function matchesSearch(tx: TransactionRow, search: string): boolean {
  const term = search.trim().toLowerCase();
  if (!term) {
    return true;
  }

  return (
    tx.description.toLowerCase().includes(term) ||
    tx.institution.toLowerCase().includes(term) ||
    tx.category.toLowerCase().includes(term)
  );
}

const Transactions = () => {
  const [activeFilter, setActiveFilter] = useState<FilterLabel>('All');
  const [search, setSearch] = useState('');
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(
    async (pageNum: number, filter: FilterLabel, append: boolean) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      try {
        const result = await transactionService.getPage({
          ...filterToQuery(filter),
          page: pageNum,
          limit: 30,
        });

        setPage(result.page);
        setPages(result.pages);
        setTotal(result.total);
        setTransactions((current) =>
          append ? [...current, ...result.transactions] : result.transactions,
        );
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Failed to load transactions.';
        setError(message);
        if (!append) {
          setTransactions([]);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchPage(1, activeFilter, false);
  }, [activeFilter, fetchPage]);

  const visibleTransactions = useMemo(() => {
    let rows = transactions;

    if (activeFilter === 'Airtime') {
      rows = rows.filter(matchesAirtime);
    }

    return rows.filter((tx) => matchesSearch(tx, search));
  }, [transactions, activeFilter, search]);

  function handleFilterChange(filter: FilterLabel) {
    setActiveFilter(filter);
    setPage(1);
  }

  function handleLoadMore() {
    if (page < pages && !loadingMore) {
      fetchPage(page + 1, activeFilter, true);
    }
  }

  return (
    <div className="transactions-container">
      <header className="transactions-header">
        <h1>Transactions</h1>
        <p>View your transaction history.</p>
        {!loading && !error && total > 0 && (
          <p className="transactions-count">{total} transaction{total === 1 ? '' : 's'}</p>
        )}
      </header>

      <div className="filter-bar">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            className={`filter-btn${activeFilter === filter ? ' active' : ''}`}
            onClick={() => handleFilterChange(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="transactions-search">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search transactions..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {loading && <p className="transactions-status">Loading transactions…</p>}

      {error && (
        <div className="transactions-error">
          <p>{error}</p>
          <button type="button" className="transactions-retry-btn" onClick={() => fetchPage(1, activeFilter, false)}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && visibleTransactions.length === 0 && (
        <p className="transactions-status">No transactions match your filters.</p>
      )}

      <div className="transactions-list">
        {visibleTransactions.map((tx) => {
          const badge = badgeClass(tx);

          return (
            <div key={tx.id} className="transaction-row">
              <div className={`tx-badge ${badge}`}>
                {badge === 'bills' ? (
                  <img src={lightningSvg} alt="" width="16" height="16" />
                ) : badge === 'receive' ? (
                  '↙'
                ) : badge === 'airtime' ? (
                  '📱'
                ) : (
                  '↗'
                )}
              </div>
              <div className="tx-row-info">
                <p className="tx-row-name">{tx.description}</p>
                <p className="tx-row-desc">
                  {tx.institution} · {tx.category}
                </p>
              </div>
              <div className="tx-row-right">
                <p className={`tx-row-amount ${tx.type === 'credit' ? 'positive' : 'negative'}`}>
                  {formatSignedNgn(tx.amount, tx.type)}
                </p>
                <p className="tx-row-date">{formatTransactionDate(tx.date)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {!loading && !error && page < pages && (
        <div className="transactions-load-more">
          <button type="button" className="load-more-btn" onClick={handleLoadMore} disabled={loadingMore}>
            {loadingMore ? 'Loading…' : `Load more (${page} of ${pages})`}
          </button>
        </div>
      )}
    </div>
  );
};

export default Transactions;