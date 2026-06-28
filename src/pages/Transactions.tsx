import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '../api/errors';
import type { TransactionRow } from '../types';
import { transactionService, type TransactionQuery } from '../services/transactionService';
import { formatSignedNgn, formatTransactionDate } from '../utils/format';
import { hasSearchTerm, matchesAnySearchTerm } from '../utils/search';
import './Transactions.css';
import lightningSvg from '../assets/icons/lightning.svg';

const FILTERS = ['All', 'Income', 'Expense', 'Transfer', 'Bills', 'Airtime'] as const;
type FilterLabel = (typeof FILTERS)[number];

const AIRTIME_PATTERN = /airtime|mtn|glo|airtel|data bundle|9mobile/i;
const SEARCH_DEBOUNCE_MS = 300;

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
  return (
    AIRTIME_PATTERN.test(tx.description) ||
    (tx.category === 'Bills' && /mtn|glo|data/i.test(tx.description))
  );
}

function matchesTransactionSearch(tx: TransactionRow, search: string): boolean {
  return matchesAnySearchTerm(
    search,
    tx.description,
    tx.institution,
    tx.category,
    tx.type,
    String(tx.amount),
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

  const fetchPage = useCallback(async (pageNum: number, filter: FilterLabel, append: boolean) => {
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
  }, []);

  const fetchAllForSearch = useCallback(async (filter: FilterLabel) => {
    setLoading(true);
    setError(null);

    try {
      const baseQuery = filterToQuery(filter);
      const firstPage = await transactionService.getPage({ ...baseQuery, page: 1, limit: 30 });
      let allTransactions = [...firstPage.transactions];

      for (let nextPage = 2; nextPage <= firstPage.pages; nextPage += 1) {
        const result = await transactionService.getPage({
          ...baseQuery,
          page: nextPage,
          limit: 30,
        });
        allTransactions = [...allTransactions, ...result.transactions];
      }

      setTransactions(allTransactions);
      setPage(firstPage.pages || 1);
      setPages(firstPage.pages || 1);
      setTotal(firstPage.total);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to load transactions.';
      setError(message);
      setTransactions([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (hasSearchTerm(search)) {
      return;
    }

    fetchPage(1, activeFilter, false);
  }, [activeFilter, search, fetchPage]);

  useEffect(() => {
    if (!hasSearchTerm(search)) {
      return;
    }

    const timer = window.setTimeout(() => {
      fetchAllForSearch(activeFilter);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [search, activeFilter, fetchAllForSearch]);

  const visibleTransactions = useMemo(() => {
    let rows = transactions;

    if (activeFilter === 'Airtime') {
      rows = rows.filter(matchesAirtime);
    }

    return rows.filter((tx) => matchesTransactionSearch(tx, search));
  }, [transactions, activeFilter, search]);

  const searching = hasSearchTerm(search);

  function handleFilterChange(filter: FilterLabel) {
    setActiveFilter(filter);
    setPage(1);
  }

  function handleLoadMore() {
    if (page < pages && !loadingMore && !searching) {
      fetchPage(page + 1, activeFilter, true);
    }
  }

  return (
    <div className="transactions-container">
      <header className="transactions-header">
        <div className="transactions-header-row">
          <div>
            <h1>Transactions</h1>
            <p>View your transaction history.</p>
          </div>
          <Link to="/transfer" className="transactions-transfer-btn">
            New transfer
          </Link>
        </div>
        {!loading && !error && total > 0 && (
          <p className="transactions-count">
            {searching
              ? `${visibleTransactions.length} match${visibleTransactions.length === 1 ? '' : 'es'} · ${total} total`
              : `${total} transaction${total === 1 ? '' : 's'}`}
          </p>
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

      <form
        className="transactions-search"
        role="search"
        onSubmit={(event) => event.preventDefault()}
      >
        <span className="search-icon" aria-hidden="true">
          🔍
        </span>
        <input
          type="search"
          placeholder="Search by description, bank, category, or amount..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search transactions"
        />
        {searching && (
          <button
            type="button"
            className="transactions-search-clear"
            onClick={() => setSearch('')}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </form>

      {loading && (
        <p className="transactions-status">
          {searching ? 'Searching all transactions…' : 'Loading transactions…'}
        </p>
      )}

      {error && (
        <div className="transactions-error">
          <p>{error}</p>
          <button
            type="button"
            className="transactions-retry-btn"
            onClick={() =>
              searching ? fetchAllForSearch(activeFilter) : fetchPage(1, activeFilter, false)
            }
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && visibleTransactions.length === 0 && (
        <p className="transactions-status">
          {searching
            ? `No transactions match "${search.trim()}".`
            : 'No transactions match your filters.'}
        </p>
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

      {!loading && !error && !searching && page < pages && (
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