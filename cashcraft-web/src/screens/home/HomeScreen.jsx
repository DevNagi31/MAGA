import { useState } from 'react';
import { Plus, ArrowDownLeft, ArrowUpRight, AlertCircle, CheckCircle, AlertTriangle, Info, Users, User, X } from 'lucide-react';
import { Colors, CATEGORIES, CategoryColors } from '../../constants/theme';
import { useExpenseStore, useBudgetStore, useGroupStore } from '../../store';
import { getSpendingByBucket, generateInsights } from '../../utils/budgetCalculator';
import { getGreeting, formatCurrency, getCurrentMonth, getDaysRemainingInMonth } from '../../utils/formatters';
import GlassCard from '../../components/GlassCard';
import ExpenseItem from '../../components/ExpenseItem';
import MemberAvatar from '../../components/MemberAvatar';
import Icon from '../../components/Icon';

export default function HomeScreen({ navigate }) {
  const expenses = useExpenseStore((s) => s.expenses);
  const deleteExpense = useExpenseStore((s) => s.deleteExpense);
  const getMonthlyExpenses = useExpenseStore((s) => s.getMonthlyExpenses);
  const { salary, budgetRule } = useBudgetStore();
  const groups = useGroupStore((s) => s.groups);

  const monthly = getMonthlyExpenses();
  const spending = getSpendingByBucket(monthly);
  const totalSpent = spending.needs + spending.wants;
  const diff = salary - totalSpent;
  const spentPct = salary > 0 ? Math.min(totalSpent / salary, 1) : 0;
  const insights = generateInsights(monthly, salary, budgetRule);
  const daysLeft = getDaysRemainingInMonth();
  const dailySafe = daysLeft > 0 ? Math.max(0, diff) / daysLeft : 0;

  const byCategory = {};
  monthly.forEach((e) => {
    if (!byCategory[e.category]) byCategory[e.category] = 0;
    byCategory[e.category] += e.amount;
  });
  const top3 = Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const recentExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 7);

  const [fabOpen, setFabOpen] = useState(false);
  const [showGroupPicker, setShowGroupPicker] = useState(false);

  const insightIcons = {
    warning: <AlertCircle size={13} color={Colors.warning} />,
    success: <CheckCircle size={13} color={Colors.success} />,
    danger: <AlertTriangle size={13} color={Colors.danger} />,
    info: <Info size={13} color={Colors.info} />,
  };
  const insightColors = { warning: Colors.warning, success: Colors.success, danger: Colors.danger, info: Colors.info };

  return (
    <div className="screen" style={{ background: Colors.bg }}>
      <div style={{ padding: '20px 16px', paddingBottom: 100 }}>
        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ fontSize: 24, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.5 }}>{getGreeting()}</h1>
          <p style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 2 }}>{getCurrentMonth()}</p>
        </div>

        {/* Hero Card */}
        <div style={{
          background: Colors.card, borderRadius: 20, padding: 20,
          border: `1px solid ${Colors.border}`, marginBottom: 12,
        }}>
          {/* Income */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: '600', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Income</div>
              <div style={{ fontSize: 28, fontWeight: '800', color: Colors.success, letterSpacing: -1 }}>{formatCurrency(salary)}</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 19, background: `${Colors.success}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowDownLeft size={18} color={Colors.success} />
            </div>
          </div>

          {/* Expenses */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: '600', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Expenses</div>
              <div style={{ fontSize: 28, fontWeight: '800', color: Colors.danger, letterSpacing: -1 }}>{formatCurrency(totalSpent)}</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 19, background: `${Colors.danger}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowUpRight size={18} color={Colors.danger} />
            </div>
          </div>

          {/* Progress */}
          <div style={{ height: 3, background: Colors.border, borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
            <div style={{
              height: '100%', width: `${Math.round(spentPct * 100)}%`,
              background: spentPct > 0.85 ? Colors.danger : spentPct > 0.6 ? Colors.warning : Colors.success,
              borderRadius: 2, transition: 'width 0.4s',
            }} />
          </div>
          <p style={{ fontSize: 11, color: Colors.textTertiary, marginBottom: 14 }}>{Math.round(spentPct * 100)}% of income spent</p>

          <div style={{ height: 1, background: Colors.border, marginBottom: 14 }} />

          {/* Diff */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: Colors.textSecondary, fontWeight: '500' }}>
              {diff >= 0 ? 'Saved this month' : 'Overspent by'}
            </span>
            <span style={{ fontSize: 20, fontWeight: '800', color: diff >= 0 ? Colors.success : Colors.danger, letterSpacing: -0.5 }}>
              {diff >= 0 ? '+' : '-'}{formatCurrency(Math.abs(diff))}
            </span>
          </div>
        </div>

        {/* Daily safe */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: Colors.accentDim, borderRadius: 12, padding: '12px 16px',
          border: `1px solid ${Colors.accent}25`, marginBottom: 20,
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: '500', color: Colors.textSecondary }}>Safe to spend today</div>
            <div style={{ fontSize: 11, color: Colors.textTertiary, marginTop: 2 }}>{daysLeft} days left this month</div>
          </div>
          <div style={{ fontSize: 20, fontWeight: '800', color: Colors.accent, letterSpacing: -0.5 }}>{formatCurrency(dailySafe)}/day</div>
        </div>

        {/* Insights */}
        {insights.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {insights.map((insight, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: Colors.card, borderRadius: 10,
                padding: '10px 14px',
              }}>
                {insightIcons[insight.type]}
                <span style={{ fontSize: 13, color: Colors.textSecondary, lineHeight: 1.4 }}>{insight.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Recent Activity */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 18, fontWeight: '700', color: Colors.textPrimary }}>Recent Activity</h2>
            <button onClick={() => navigate('history')} style={{ fontSize: 13, color: Colors.accent, fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer' }}>
              See all
            </button>
          </div>

          {/* Top 3 categories */}
          {top3.length > 0 && (
            <GlassCard style={{ marginBottom: 12 }} padding={12}>
              <p style={{ fontSize: 11, fontWeight: '600', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Top spending</p>
              {top3.map(([cat, amount], i) => {
                const catDef = CATEGORIES.find((c) => c.id === cat);
                const color = CategoryColors[cat] || Colors.textTertiary;
                return (
                  <div key={cat} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    paddingTop: i > 0 ? 8 : 0, paddingBottom: i < top3.length - 1 ? 8 : 0,
                    borderBottom: i < top3.length - 1 ? `1px solid ${Colors.border}` : 'none',
                  }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name={catDef?.icon || 'MoreHorizontal'} size={13} color={color} />
                    </div>
                    <span style={{ flex: 1, fontSize: 14, fontWeight: '500', color: Colors.textPrimary }}>{catDef?.label || cat}</span>
                    <span style={{ fontSize: 14, fontWeight: '700', color: Colors.textPrimary }}>{formatCurrency(amount)}</span>
                  </div>
                );
              })}
            </GlassCard>
          )}

          {recentExpenses.length === 0 ? (
            <GlassCard style={{ textAlign: 'center', padding: '40px 20px' }}>
              <p style={{ fontSize: 15, fontWeight: '600', color: Colors.textSecondary }}>No expenses yet</p>
              <p style={{ fontSize: 13, color: Colors.textTertiary, marginTop: 4 }}>Tap + to log your first expense</p>
            </GlassCard>
          ) : (
            recentExpenses.map((e) => <ExpenseItem key={e.id} expense={e} onDelete={deleteExpense} />)
          )}
        </div>
      </div>

      {/* FAB */}
      {fabOpen && (
        <div
          onClick={() => setFabOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 40 }}
        />
      )}
      <div style={{ position: 'fixed', bottom: 90, right: 20, zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
        {fabOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, marginBottom: 4 }}>
            <button
              onClick={() => { setFabOpen(false); setShowGroupPicker(true); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 16px', borderRadius: 999,
                background: Colors.card, border: `1px solid ${Colors.border}`,
                color: Colors.textPrimary, fontWeight: '600', fontSize: 14, cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              }}
            >
              <Users size={16} color={Colors.accent} /> Group Expense
            </button>
            <button
              onClick={() => { setFabOpen(false); navigate('addExpense'); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 16px', borderRadius: 999,
                background: Colors.card, border: `1px solid ${Colors.border}`,
                color: Colors.textPrimary, fontWeight: '600', fontSize: 14, cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              }}
            >
              <User size={16} color={Colors.accent} /> Personal Expense
            </button>
          </div>
        )}
        <button
          onClick={() => setFabOpen(!fabOpen)}
          style={{
            width: 58, height: 58, borderRadius: 29,
            background: 'linear-gradient(135deg, #34D399, #10B981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(52,211,153,0.4)',
            transform: fabOpen ? 'rotate(45deg)' : 'rotate(0)',
            transition: 'transform 0.25s',
          }}
        >
          <Plus size={26} color="#050505" />
        </button>
      </div>

      {/* Group Picker Modal */}
      {showGroupPicker && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          zIndex: 60, display: 'flex', alignItems: 'flex-end',
        }}
          onClick={() => setShowGroupPicker(false)}
        >
          <div
            style={{
              width: '100%', background: Colors.card,
              borderTopLeftRadius: 20, borderTopRightRadius: 20,
              padding: 20, borderTop: `1px solid ${Colors.border}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: '700', color: Colors.textPrimary }}>Add to which group?</h3>
              <button onClick={() => setShowGroupPicker(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color={Colors.textTertiary} />
              </button>
            </div>
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => { setShowGroupPicker(false); navigate('addBill', { groupId: group.id }); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', marginBottom: 8, borderRadius: 12,
                  background: Colors.cardElevated, border: `1px solid ${Colors.border}`,
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex' }}>
                  {group.members.slice(0, 3).map((m, i) => (
                    <div key={m.id} style={{ marginLeft: i > 0 ? -8 : 0 }}>
                      <MemberAvatar name={m.name} color={m.color} size={30} />
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: '600', color: Colors.textPrimary }}>{group.name}</div>
                  <div style={{ fontSize: 12, color: Colors.textTertiary, marginTop: 2 }}>{group.members.length} members</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
