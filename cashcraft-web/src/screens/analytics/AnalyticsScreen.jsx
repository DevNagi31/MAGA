import { useState } from 'react';
import { PieChart, TrendingUp, AlertCircle, CheckCircle, AlertTriangle, Info, Star } from 'lucide-react';
import { Colors, CATEGORIES } from '../../constants/theme';
import { useExpenseStore, useBudgetStore, useGroupStore } from '../../store';
import { getSpendingByCategory, getSpendingByBucket, generateInsights } from '../../utils/budgetCalculator';
import { formatCurrency, getCurrentMonth } from '../../utils/formatters';
import GlassCard from '../../components/GlassCard';
import ProgressBar from '../../components/ProgressBar';
import Icon from '../../components/Icon';

const DonutChart = ({ data, total }) => {
  const size = 180;
  const strokeW = 30;
  const r = (size - strokeW) / 2;
  const circ = 2 * Math.PI * r;
  const cx = size / 2, cy = size / 2;
  let offset = 0;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={Colors.border} strokeWidth={strokeW} />
        <g transform={`rotate(-90, ${cx}, ${cy})`}>
          {data.map((slice, i) => {
            if (slice.pct <= 0) return null;
            const dash = slice.pct * circ;
            const gap = (1 - slice.pct) * circ;
            const el = (
              <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                stroke={slice.color} strokeWidth={strokeW}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-offset * circ}
              />
            );
            offset += slice.pct;
            return el;
          })}
        </g>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 18, fontWeight: '800', color: Colors.textPrimary }}>{formatCurrency(total, true)}</span>
        <span style={{ fontSize: 10, color: Colors.textTertiary }}>this month</span>
      </div>
    </div>
  );
};

const BudgetBar = ({ label, spent, budget, color }) => {
  const pct = budget > 0 ? Math.min(spent / budget, 1) : 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: 4, background: color }} />
          <span style={{ fontSize: 14, fontWeight: '500', color: Colors.textPrimary }}>{label}</span>
        </div>
        <span style={{ fontSize: 12, color: Colors.textSecondary }}>{formatCurrency(spent)} / {formatCurrency(budget)}</span>
      </div>
      <ProgressBar progress={pct} color={color} />
      <span style={{ fontSize: 11, color: Colors.textTertiary, textAlign: 'right' }}>{formatCurrency(Math.max(0, budget - spent))} remaining</span>
    </div>
  );
};

const insightIcons = {
  warning: <AlertCircle size={14} color={Colors.warning} />,
  success: <CheckCircle size={14} color={Colors.success} />,
  danger: <AlertTriangle size={14} color={Colors.danger} />,
  info: <Info size={14} color={Colors.info} />,
};
const insightColors = { warning: Colors.warning, success: Colors.success, danger: Colors.danger, info: Colors.info };

export default function AnalyticsScreen() {
  const [tab, setTab] = useState('personal');

  const getMonthlyExpenses = useExpenseStore((s) => s.getMonthlyExpenses);
  const expenses = useExpenseStore((s) => s.expenses);
  const { salary, budgetRule, getBudgetAllocations } = useBudgetStore();
  const groups = useGroupStore((s) => s.groups);

  const monthly = getMonthlyExpenses();
  const allocs = getBudgetAllocations();
  const catSpending = getSpendingByCategory(monthly);
  const bucketSpending = getSpendingByBucket(monthly);
  const insights = generateInsights(monthly, salary, budgetRule);
  const totalSpent = monthly.reduce((s, e) => s + e.amount, 0);

  const now = new Date();
  const thisWeekStart = new Date(now); thisWeekStart.setDate(now.getDate() - 7);
  const lastWeekStart = new Date(now); lastWeekStart.setDate(now.getDate() - 14);
  const thisWeek = expenses.filter((e) => new Date(e.date) >= thisWeekStart);
  const lastWeek = expenses.filter((e) => { const d = new Date(e.date); return d >= lastWeekStart && d < thisWeekStart; });
  const thisWeekTotal = thisWeek.reduce((s, e) => s + e.amount, 0);
  const lastWeekTotal = lastWeek.reduce((s, e) => s + e.amount, 0);
  const weekChange = lastWeekTotal > 0 ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100 : 0;
  const biggestExpense = monthly.length > 0 ? monthly.reduce((max, e) => e.amount > max.amount ? e : max, monthly[0]) : null;

  const donutData = CATEGORIES
    .filter((cat) => (catSpending[cat.id] || 0) > 0)
    .map((cat) => ({ label: cat.label, color: cat.color, amount: catSpending[cat.id] || 0, pct: totalSpent > 0 ? (catSpending[cat.id] || 0) / totalSpent : 0 }))
    .sort((a, b) => b.amount - a.amount);

  const allBills = groups.flatMap((g) => g.bills.filter((b) => !b.settled));
  const totalSplit = allBills.reduce((s, b) => s + b.amount, 0);
  const mostActiveGroup = [...groups].sort((a, b) => b.bills.filter((bl) => !bl.settled).length - a.bills.filter((bl) => !bl.settled).length)[0];

  return (
    <div className="screen" style={{ background: Colors.bg }}>
      <div style={{ padding: '20px 16px 100px' }}>
        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ fontSize: 28, fontWeight: '700', color: Colors.textPrimary }}>Analytics</h1>
          <p style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 2 }}>{getCurrentMonth()}</p>
        </div>

        {/* Tab toggle */}
        <div style={{ display: 'flex', background: Colors.card, borderRadius: 12, padding: 4, marginBottom: 24, border: `1px solid ${Colors.border}` }}>
          {['personal', 'splits'].map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '8px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: tab === t ? Colors.accentDim : 'transparent',
              color: tab === t ? Colors.accent : Colors.textTertiary,
              fontSize: 14, fontWeight: '600', transition: 'all 0.15s',
            }}>
              {t === 'personal' ? 'Personal' : 'Splits'}
            </button>
          ))}
        </div>

        {tab === 'personal' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Donut + Legend */}
            {totalSpent > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <DonutChart data={donutData} total={totalSpent} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {donutData.slice(0, 5).map((item) => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 4, background: item.color, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 12, color: Colors.textSecondary }}>{item.label}</span>
                      <span style={{ fontSize: 11, color: Colors.textTertiary, width: 28, textAlign: 'right' }}>{Math.round(item.pct * 100)}%</span>
                      <span style={{ fontSize: 12, fontWeight: '600', color: Colors.textPrimary, width: 52, textAlign: 'right' }}>{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <GlassCard style={{ textAlign: 'center', padding: '40px 20px' }}>
                <PieChart size={32} color={Colors.textTertiary} style={{ margin: '0 auto 12px' }} />
                <p style={{ fontSize: 15, color: Colors.textSecondary }}>No spending data yet</p>
              </GlassCard>
            )}

            {/* Budget Health */}
            <div>
              <h2 style={{ fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 }}>Budget Health</h2>
              <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <BudgetBar label="Needs" spent={bucketSpending.needs} budget={allocs.needs} color="#60A5FA" />
                <BudgetBar label="Wants" spent={bucketSpending.wants} budget={allocs.wants} color="#A78BFA" />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: `1px solid ${Colors.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 4, background: Colors.accent }} />
                    <span style={{ fontSize: 14, fontWeight: '500', color: Colors.textPrimary }}>Savings Target</span>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: '700', color: Colors.accent }}>{formatCurrency(allocs.savings)}/mo</span>
                </div>
              </GlassCard>
            </div>

            {/* Insights */}
            {insights.length > 0 && (
              <div>
                <h2 style={{ fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 }}>Insights</h2>
                {insights.map((insight, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: Colors.card, borderRadius: 10,
                    padding: '12px 14px', marginBottom: 8,
                  }}>
                    {insightIcons[insight.type]}
                    <span style={{ flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 1.4 }}>{insight.text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Trends */}
            <div>
              <h2 style={{ fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 }}>Trends</h2>
              <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 12, color: Colors.textTertiary, fontWeight: '500', marginBottom: 4 }}>This week</p>
                    <p style={{ fontSize: 18, fontWeight: '700', color: Colors.textPrimary }}>{formatCurrency(thisWeekTotal)}</p>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 12, color: Colors.textTertiary, fontWeight: '500', marginBottom: 4 }}>Last week</p>
                    <p style={{ fontSize: 18, fontWeight: '700', color: Colors.textPrimary }}>{formatCurrency(lastWeekTotal)}</p>
                  </div>
                  {lastWeekTotal > 0 && (
                    <div style={{
                      padding: '4px 10px', borderRadius: 999, alignSelf: 'center',
                      background: weekChange <= 0 ? 'rgba(52,211,153,0.15)' : 'rgba(239,68,68,0.15)',
                    }}>
                      <span style={{ fontSize: 12, fontWeight: '700', color: weekChange <= 0 ? Colors.success : Colors.danger }}>
                        {weekChange <= 0 ? '↓' : '↑'} {Math.abs(weekChange).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
                {biggestExpense && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 12, borderTop: `1px solid ${Colors.border}` }}>
                    <TrendingUp size={14} color={Colors.warning} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 11, color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.3, fontWeight: '500', marginBottom: 2 }}>Biggest this month</p>
                      <p style={{ fontSize: 14, fontWeight: '600', color: Colors.textPrimary }}>{biggestExpense.description}</p>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: '700', color: Colors.textPrimary }}>{formatCurrency(biggestExpense.amount)}</span>
                  </div>
                )}
              </GlassCard>
            </div>

            {/* By Category */}
            <div>
              <h2 style={{ fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 }}>By Category</h2>
              <GlassCard>
                {CATEGORIES.filter((cat) => catSpending[cat.id] > 0).map((cat, i, arr) => (
                  <div key={cat.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12, paddingTop: i > 0 ? 12 : 0, paddingBottom: i < arr.length - 1 ? 12 : 0,
                    borderBottom: i < arr.length - 1 ? `1px solid ${Colors.border}` : 'none',
                  }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${cat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name={cat.icon} size={14} color={cat.color} />
                    </div>
                    <span style={{ flex: 1, fontSize: 15, fontWeight: '500', color: Colors.textPrimary }}>{cat.label}</span>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 15, fontWeight: '700', color: Colors.textPrimary }}>{formatCurrency(catSpending[cat.id])}</p>
                      <p style={{ fontSize: 11, color: Colors.textTertiary }}>{Math.round((catSpending[cat.id] / totalSpent) * 100)}%</p>
                    </div>
                  </div>
                ))}
                {Object.keys(catSpending).length === 0 && (
                  <p style={{ fontSize: 14, color: Colors.textTertiary, textAlign: 'center', padding: '20px 0' }}>No expenses this month</p>
                )}
              </GlassCard>
            </div>
          </div>
        ) : (
          /* Split Analytics */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <GlassCard style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }} padding={20}>
                <Icon name="DollarSign" size={20} color={Colors.accent} />
                <span style={{ fontSize: 24, fontWeight: '800', color: Colors.textPrimary }}>{formatCurrency(totalSplit)}</span>
                <span style={{ fontSize: 12, color: Colors.textSecondary }}>Total split</span>
              </GlassCard>
              <GlassCard style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }} padding={20}>
                <Icon name="Users" size={20} color="#60A5FA" />
                <span style={{ fontSize: 24, fontWeight: '800', color: Colors.textPrimary }}>{groups.length}</span>
                <span style={{ fontSize: 12, color: Colors.textSecondary }}>Active groups</span>
              </GlassCard>
            </div>

            {mostActiveGroup && (
              <div>
                <h2 style={{ fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 }}>Most Active</h2>
                <GlassCard style={{ display: 'flex', alignItems: 'center', gap: 12 }} padding={16}>
                  <Star size={16} color={Colors.warning} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 16, fontWeight: '700', color: Colors.textPrimary }}>{mostActiveGroup.name}</p>
                    <p style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 2 }}>
                      {mostActiveGroup.members.length} members · {mostActiveGroup.bills.filter((b) => !b.settled).length} unsettled bills
                    </p>
                  </div>
                </GlassCard>
              </div>
            )}

            <div>
              <h2 style={{ fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 }}>Groups Breakdown</h2>
              {groups.map((group) => {
                const unsettled = group.bills.filter((b) => !b.settled);
                const groupTotal = unsettled.reduce((s, b) => s + b.amount, 0);
                return (
                  <GlassCard key={group.id} style={{ marginBottom: 10 }} padding={14}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 16, fontWeight: '700', color: Colors.textPrimary }}>{group.name}</span>
                      <span style={{ fontSize: 16, fontWeight: '700', color: Colors.textPrimary }}>{formatCurrency(groupTotal)}</span>
                    </div>
                    <p style={{ fontSize: 13, color: Colors.textSecondary }}>{group.members.length} members · {unsettled.length} unsettled</p>
                  </GlassCard>
                );
              })}
              {groups.length === 0 && (
                <GlassCard style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <p style={{ fontSize: 15, color: Colors.textSecondary }}>No groups yet</p>
                </GlassCard>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
