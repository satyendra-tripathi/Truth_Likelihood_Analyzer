import { Activity, Gauge, SearchCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import http from "../api/http.js";
import { useToast } from "../context/ToastContext.jsx";

const colors = ["#14b8a6", "#f59e0b", "#ef4444"];

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const { push } = useToast();

  useEffect(() => {
    http
      .get("/analytics")
      .then((res) => setData(res.data))
      .catch((error) => push(error.response?.data?.message || "Unable to load analytics", "error"));
  }, []);

  if (!data) return <div className="card">Loading analytics...</div>;

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Metric icon={SearchCheck} label="Total Analyses" value={data.totalAnalyses} />
        <Metric icon={Gauge} label="Average Truth Score" value={`${data.averageTruthScore}%`} />
        <Metric icon={Activity} label="Active Days" value={data.dailyActivity.length} />
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Daily Activity">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.dailyActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#14b8a6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Sentiment Distribution">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data.sentimentDistribution} dataKey="value" nameKey="name" outerRadius={90} label>
                {data.sentimentDistribution.map((entry, index) => (
                  <Cell key={entry.name} fill={colors[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Top Suspicious Phrases">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.topSuspiciousPhrases}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="phrase" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <section className="card">
          <h2 className="text-xl font-bold">Dashboard Notes</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Trends summarize your saved analyses only. Higher frequency of suspicious phrases does not prove deception; it indicates language worth reviewing in context.
          </p>
        </section>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="card">
      <Icon className="text-teal-700 dark:text-teal-300" size={24} />
      <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-black">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <section className="card">
      <h2 className="mb-4 text-xl font-bold">{title}</h2>
      {children}
    </section>
  );
}
