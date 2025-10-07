import React, { useEffect, useMemo, useState } from 'react';
import { useAppContext } from '../state/AppContext';
import { apiClient } from '../services/apiClient';
import { FunctionList, InvocationsTable, FunctionDetails } from '../components';
import '../App.css';
import '../styles/theme.css';
import '../styles/tokens.css';

/**
 * PUBLIC_INTERFACE
 * Functions
 * A page providing an overview of serverless functions with search, sort, pagination, and details panel.
 * - Fetches functions list via apiClient with mock support.
 * - Displays trends, errors, cold starts indicators.
 * - Provides a details panel with recent mock logs and AI-style recommendations.
 */
const Functions = () => {
  const { state } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [functions, setFunctions] = useState([]);
  const [error, setError] = useState(null);
  const [selectedFn, setSelectedFn] = useState(null);

  // Client-side UI state
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('errorRate'); // default critical metric
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    apiClient
      .getFunctions()
      .then((data) => {
        if (!mounted) return;
        setFunctions(Array.isArray(data) ? data : data?.items || []);
      })
      .catch((e) => {
        console.error('Failed to load functions', e);
        if (!mounted) return;
        setError('Failed to load functions');
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [state?.auth?.token]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return functions.filter((f) => {
      if (!q) return true;
      return (
        f.name?.toLowerCase().includes(q) ||
        f.provider?.toLowerCase().includes(q) ||
        f.region?.toLowerCase().includes(q) ||
        f.runtime?.toLowerCase().includes(q)
      );
    });
  }, [functions, search]);

  const sorted = useMemo(() => {
    const items = [...filtered];
    items.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      const av = a?.[sortBy];
      const bv = b?.[sortBy];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') {
        return av === bv ? 0 : av > bv ? dir : -dir;
      }
      const as = String(av).toLowerCase();
      const bs = String(bv).toLowerCase();
      return as === bs ? 0 : as > bs ? dir : -dir;
    });
    return items;
  }, [filtered, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage]);

  const onSelectFunction = (fn) => setSelectedFn(fn);

  const onChangeSort = (field) => {
    if (sortBy === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
  };

  const onPageChange = (newPage) => {
    setPage(Math.min(Math.max(1, newPage), totalPages));
  };

  return (
    <main
      className="min-h-screen bg-black text-white"
      aria-labelledby="functions-page-title"
      style={{ padding: '16px' }}
    >
      <header className="mb-4">
        <h1
          id="functions-page-title"
          className="text-2xl font-bold text-white"
          aria-label="Functions overview"
        >
          Functions
        </h1>
        <p className="text-gray-300">
          Monitor performance, reliability, and cost signals for your serverless functions across clouds.
        </p>
      </header>

      <section className="bg-gray-800 rounded-xl p-4 shadow-lg shadow-orange-500/10 border border-gray-700">
        <FunctionList
          items={paged}
          fullCount={sorted.length}
          page={currentPage}
          pageSize={pageSize}
          totalPages={totalPages}
          loading={loading}
          error={error}
          search={search}
          onSearch={setSearch}
          sortBy={sortBy}
          sortDir={sortDir}
          onChangeSort={onChangeSort}
          onPageChange={onPageChange}
          onSelect={onSelectFunction}
        />
      </section>

      <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-gray-800 rounded-xl p-4 border border-gray-700">
          <h2 className="text-xl font-semibold mb-2">Recent Invocations</h2>
          <InvocationsTable selectedFunction={selectedFn} />
        </div>
        <aside
          className="lg:col-span-1 bg-gray-800 rounded-xl p-4 border border-gray-700"
          aria-label="Function details panel"
        >
          <FunctionDetails selectedFunction={selectedFn} />
        </aside>
      </section>
    </main>
  );
};

export default Functions;
