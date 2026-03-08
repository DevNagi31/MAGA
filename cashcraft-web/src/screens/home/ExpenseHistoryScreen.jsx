import { useState, useMemo } from 'react';
import { Inbox } from 'lucide-react';
import { Colors, CATEGORIES } from '../../constants/theme';
import { useExpenseStore } from '../../store';
import { groupExpensesByDate, formatCurrency } from '../../utils/formatters';
import CategoryChip from '../../components/CategoryChip';
import ExpenseItem from '../../components/ExpenseItem';
import ScreenHeader from '../../components/ScreenHeader';

const ALL_CAT = { id: 'all', label: 'All', icon: 'Grid', color: '#8E8E93' };

export default function ExpenseHistoryScreen({ navigate }) {
  const expenses = useExpenseStore((s) => s.expenses);
  const deleteExpense = useExpenseStore((s) => s.deleteExpense);
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = useMemo(() => {
    const sorted = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (activeCategory === 'all') return sorted;
    return sorted.filter((e) => e.category === activeCategory);
  }, [expenses, activeCategory]);

  const grouped = groupExpensesByDate(filtered);
  const total = filtered.reduce((s, e) => s + e.amount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: Colors.bg }}>
      <ScreenHeader title="All Expenses" onBack={() => navigate('back')} />

      {/* Filter */}
      <div style={{ borderBottom: `1px solid ${Colors.border}` }}>
        <div style={{ overflowX: 'auto', display: 'flex', padding: '12px 16px 8px' }}>
          <CategoryChip category={ALL_CAT} selected={activeCategory === 'all'} onPress={() => setActiveCategory('all')} />
          {CATEGORIES.map((cat) => (
            <CategoryChip key={cat.id} category={cat} selected={activeCategory === cat.id} onPress={() => setActiveCategory(cat.id)} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 16px 10px' }}>
          <span style={{ fontSize: 13, color: Colors.textTertiary }}>{filtered.length} expense{filtered.length !== 1 ? 's' : ''}</span>
          <span style={{ fontSize: 14, fontWeight: '700', color: Colors.textPrimary }}>{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="screen" style={{ flex: 1 }}>
        <div style={{ padding: '12px 16px 100px' }}>
          {Object.keys(grouped).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Inbox size={32} color={Colors.textTertiary} style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: 16, color: Colors.textSecondary }}>No expenses found</p>
            </div>
          ) : (
            Object.entries(grouped).map(([dateGroup, items]) => (
              <div key={dateGroup}>
                <p style={{ fontSize: 12, fontWeight: '700', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 16, marginBottom: 8 }}>{dateGroup}</p>
                {items.map((e) => <ExpenseItem key={e.id} expense={e} onDelete={deleteExpense} />)}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
