import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { attemptsApi, ChartData } from "../../api/attempts";
import "./DashboardCharts.css";

// ─── Custom tooltip for activity bar chart ────────────────────────────────────

const ActivityTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="dbc-tooltip">
      <p className="dbc-tooltip-label">{label}</p>
      {payload.map((entry: any) => (
        <p
          key={entry.dataKey}
          style={{ color: entry.color }}
          className="dbc-tooltip-row"
        >
          {entry.name}: <strong>{entry.value}</strong>
        </p>
      ))}
    </div>
  );
};

// ─── Custom tooltip for score line chart ─────────────────────────────────────

const ScoreTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  return (
    <div className="dbc-tooltip">
      <p className="dbc-tooltip-label">{label}</p>
      <p style={{ color: "#6366f1" }} className="dbc-tooltip-row">
        Promedio: <strong>{val != null ? `${val}%` : "—"}</strong>
      </p>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const DashboardCharts: React.FC = () => {
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    attemptsApi
      .getChartData()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="dbc-loading">
        <span className="dbc-spinner" />
        Cargando gráficas…
      </div>
    );
  }

  if (!data) return null;

  const hasActivity = data.activityByDay.some(
    (d) => d.quizzes + d.trueFalse + d.flashcards > 0,
  );
  const hasScores = data.scoreByDay.some((d) => d.avgScore != null);

  if (!hasActivity && !hasScores) {
    return (
      <p className="dbc-empty">
        Completa tu primer cuestionario o sesión para ver tus gráficas.
      </p>
    );
  }

  return (
    <div className="dbc-grid">
      {/* ── Bar: actividad diaria ── */}
      {hasActivity && (
        <div className="dbc-card">
          <h3 className="dbc-card-title">Actividad diaria (últimos 14 días)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={data.activityByDay}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickLine={false}
                axisLine={false}
                interval={1}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<ActivityTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "0.75rem", paddingTop: "8px" }}
              />
              <Bar
                dataKey="quizzes"
                name="Cuestionarios"
                stackId="a"
                fill="#f97316"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="trueFalse"
                name="Verdadero / Falso"
                stackId="a"
                fill="#ec4899"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="flashcards"
                name="Flashcards"
                stackId="a"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Line: promedio de score ── */}
      {hasScores && (
        <div className="dbc-card">
          <h3 className="dbc-card-title">Promedio de aciertos (Quiz + V·F)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={data.scoreByDay}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickLine={false}
                axisLine={false}
                interval={1}
              />
              <YAxis
                domain={[0, 100]}
                unit="%"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<ScoreTooltip />} />
              <Line
                type="monotone"
                dataKey="avgScore"
                name="Promedio %"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }}
                activeDot={{ r: 6 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default DashboardCharts;
