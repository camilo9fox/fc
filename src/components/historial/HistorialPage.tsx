import React, { useCallback, useEffect, useState } from "react";
import {
  attemptsApi,
  AttemptType,
  HistoryFilters,
  HistoryItem,
  HistoryResponse,
} from "../../api/attempts";
import { useCategories } from "../../hooks/useCategories";
import "./HistorialPage.css";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<AttemptType, string> = {
  quiz: "Cuestionario",
  "true-false": "V / F",
  flashcards: "Flashcards",
};

const TYPE_COLOR: Record<AttemptType, string> = {
  quiz: "hp-badge--orange",
  "true-false": "hp-badge--pink",
  flashcards: "hp-badge--purple",
};

const pctColor = (pct: number) => {
  if (pct >= 80) return "hp-pct--green";
  if (pct >= 50) return "hp-pct--orange";
  return "hp-pct--red";
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// ─── Sub-components ───────────────────────────────────────────────────────────

const HistoryRow: React.FC<{ item: HistoryItem }> = ({ item }) => (
  <tr className="hp-row">
    <td className="hp-cell">
      <span className={`hp-badge ${TYPE_COLOR[item.type]}`}>
        {TYPE_LABELS[item.type]}
      </span>
    </td>
    <td className="hp-cell hp-cell--title">{item.categoryTitle ?? "—"}</td>
    <td className="hp-cell hp-cell--center">
      {item.score} / {item.total}
    </td>
    <td className={`hp-cell hp-cell--center hp-pct ${pctColor(item.pct)}`}>
      {item.pct}%
    </td>
    <td className="hp-cell hp-cell--date">{formatDate(item.completedAt)}</td>
  </tr>
);

const Pagination: React.FC<{
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}> = ({ page, totalPages, onPage }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="hp-pagination">
      <button
        className="hp-pg-btn"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      >
        &#8592; Anterior
      </button>
      <span className="hp-pg-info">
        {page} / {totalPages}
      </span>
      <button
        className="hp-pg-btn"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
      >
        Siguiente &#8594;
      </button>
    </div>
  );
};

// ─── CSV export helper ────────────────────────────────────────────────────────

const exportToCsv = (items: HistoryItem[]) => {
  const header = ["Tipo", "Tema", "Aciertos", "Total", "%", "Fecha"];
  const rows = items.map((item) => [
    TYPE_LABELS[item.type],
    item.categoryTitle ?? "",
    item.score,
    item.total,
    item.pct,
    new Date(item.completedAt).toLocaleString("es-ES"),
  ]);
  const csv = [header, ...rows]
    .map((row) =>
      row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `historial_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const HistorialPage: React.FC = () => {
  const { categories } = useCategories();

  const [filters, setFilters] = useState<HistoryFilters>({
    page: 1,
    limit: 20,
  });
  // Keep all items (unpaged) for CSV export
  const [allItems, setAllItems] = useState<HistoryItem[]>([]);
  const [result, setResult] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async (f: HistoryFilters) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch current page
      const data = await attemptsApi.getHistory(f);
      setResult(data);
      // Fetch all records (limit=1000) for CSV, only when filters change (not paging)
      if (f.page === 1) {
        const all = await attemptsApi.getHistory({
          ...f,
          page: 1,
          limit: 1000,
        });
        setAllItems(all.items);
      }
    } catch {
      setError("No se pudo cargar el historial.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(filters);
  }, [filters, fetchHistory]);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as AttemptType | "";
    setFilters((f) => ({ ...f, type: val || undefined, page: 1 }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((f) => ({
      ...f,
      categoryId: e.target.value || undefined,
      page: 1,
    }));
  };

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((f) => ({ ...f, from: e.target.value || undefined, page: 1 }));
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((f) => ({ ...f, to: e.target.value || undefined, page: 1 }));
  };

  const hasActiveFilters =
    filters.type || filters.categoryId || filters.from || filters.to;

  const handlePage = (p: number) => {
    setFilters((f) => ({ ...f, page: p }));
    // useEffect reacts to filters change — no manual fetchHistory call needed
  };

  return (
    <div className="hp-page">
      {/* ── Filters ── */}
      <div className="hp-filters">
        <select
          className="hp-select"
          value={filters.type ?? ""}
          onChange={handleTypeChange}
        >
          <option value="">Todos los tipos</option>
          <option value="quiz">Cuestionario</option>
          <option value="true-false">Verdadero / Falso</option>
          <option value="flashcards">Flashcards</option>
        </select>

        <select
          className="hp-select"
          value={filters.categoryId ?? ""}
          onChange={handleCategoryChange}
        >
          <option value="">Todos los temas</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="hp-date-input"
          value={filters.from ?? ""}
          onChange={handleFromChange}
          title="Desde"
        />
        <input
          type="date"
          className="hp-date-input"
          value={filters.to ?? ""}
          onChange={handleToChange}
          title="Hasta"
        />

        {hasActiveFilters && (
          <button
            className="hp-clear-btn"
            onClick={() => setFilters({ page: 1, limit: 20 })}
          >
            Limpiar
          </button>
        )}

        <div className="hp-filters-right">
          {result && <span className="hp-total">{result.total} registros</span>}
          {allItems.length > 0 && (
            <button
              className="hp-export-btn"
              onClick={() => exportToCsv(allItems)}
              title="Exportar a CSV"
            >
              ↓ CSV
            </button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="hp-loading">
          <span className="hp-spinner" />
          Cargando historial…
        </div>
      ) : error ? (
        <p className="hp-error">{error}</p>
      ) : !result || result.items.length === 0 ? (
        <div className="hp-empty">
          <p>No hay registros para los filtros seleccionados.</p>
        </div>
      ) : (
        <>
          <div className="hp-table-wrapper">
            <table className="hp-table">
              <thead>
                <tr className="hp-thead-row">
                  <th className="hp-th">Tipo</th>
                  <th className="hp-th hp-th--title">Tema</th>
                  <th className="hp-th hp-th--center">Resultado</th>
                  <th className="hp-th hp-th--center">%</th>
                  <th className="hp-th">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((item) => (
                  <HistoryRow key={`${item.type}-${item.id}`} item={item} />
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            onPage={handlePage}
          />
        </>
      )}
    </div>
  );
};

export default HistorialPage;
