import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Colors } from '../../constants/theme';
import { useOCRStore, useExpenseStore } from '../../store';
import { formatCurrency } from '../../utils/formatters';
import GlassCard from '../../components/GlassCard';
import PremiumButton from '../../components/PremiumButton';
import ScreenHeader from '../../components/ScreenHeader';

export default function ScanResultsScreen({ navigate }) {
  const { scannedItems, clearScan } = useOCRStore();
  const addExpense = useExpenseStore((s) => s.addExpense);

  const [items, setItems] = useState(scannedItems);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editError, setEditError] = useState('');

  const total = items.reduce((s, i) => s + i.amount, 0);

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditAmount(item.amount.toString());
    setEditError('');
  };

  const saveEdit = () => {
    if (!editName.trim()) { setEditError('Item name cannot be empty'); return; }
    const parsed = parseFloat(editAmount);
    if (!parsed || parsed <= 0) { setEditError('Amount must be greater than $0'); return; }
    if (parsed > 99999) { setEditError('Amount cannot exceed $99,999'); return; }
    setItems((prev) => prev.map((i) =>
      i.id === editingId ? { ...i, name: editName.trim(), amount: parsed } : i
    ));
    setEditingId(null);
    setEditError('');
  };

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  const handleAddPersonal = () => {
    addExpense({ amount: total, category: 'food', description: `Receipt - ${items.length} items`, date: new Date().toISOString() });
    clearScan();
    navigate('back');
    alert(`$${total.toFixed(2)} added as a personal expense.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: Colors.bg }}>
      <ScreenHeader title="Scan Results" onBack={() => { clearScan(); navigate('back'); }} />
      <div className="screen" style={{ flex: 1 }}>
        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 40 }}>
          {/* Summary */}
          <div style={{
            textAlign: 'center', padding: '24px 20px',
            background: Colors.accentDim, borderRadius: 20,
            border: `1px solid ${Colors.accent}30`,
          }}>
            <p style={{ fontSize: 13, color: Colors.textSecondary, fontWeight: '500' }}>Receipt Total</p>
            <p style={{ fontSize: 42, fontWeight: '800', color: Colors.accent, letterSpacing: -1.5, margin: '6px 0' }}>{formatCurrency(total)}</p>
            <p style={{ fontSize: 13, color: Colors.textTertiary }}>{items.length} items detected</p>
          </div>

          <h3 style={{ fontSize: 17, fontWeight: '700', color: Colors.textPrimary }}>Line Items</h3>
          <p style={{ fontSize: 12, color: Colors.textTertiary, marginTop: -10 }}>Tap an item to edit, press X to remove</p>

          {items.map((item) => (
            <div key={item.id}>
              {editingId === item.id ? (
                <GlassCard padding={14}>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => { setEditName(e.target.value); setEditError(''); }}
                    placeholder="Item name"
                    maxLength={60}
                    style={{
                      width: '100%', fontSize: 15, color: Colors.textPrimary,
                      background: 'none', border: 'none',
                      borderBottom: `1px solid ${editError && !editName.trim() ? Colors.danger : Colors.border}`,
                      paddingBottom: 8, marginBottom: 12,
                    }}
                  />
                  {editError && <p style={{ fontSize: 12, color: Colors.danger, marginBottom: 8 }}>{editError}</p>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18, color: Colors.accent }}>$</span>
                    <input
                      type="number"
                      value={editAmount}
                      onChange={(e) => { setEditAmount(e.target.value); setEditError(''); }}
                      placeholder="0.00"
                      min="0.01"
                      max="99999"
                      style={{ flex: 1, fontSize: 18, fontWeight: '600', color: Colors.textPrimary, background: 'none', border: 'none' }}
                    />
                    <button
                      onClick={saveEdit}
                      style={{ width: 32, height: 32, borderRadius: 16, background: Colors.accent, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <Check size={16} color="#050505" />
                    </button>
                  </div>
                </GlassCard>
              ) : (
                <div
                  onClick={() => startEdit(item)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', background: Colors.card,
                    borderRadius: 12, border: `1px solid ${Colors.border}`,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ width: 6, height: 6, borderRadius: 3, background: Colors.accent, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 15, color: Colors.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                  <span style={{ fontSize: 15, fontWeight: '600', color: Colors.textPrimary, flexShrink: 0 }}>{formatCurrency(item.amount)}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                    style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <X size={14} color={Colors.textTertiary} />
                  </button>
                </div>
              )}
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: `1px solid ${Colors.border}` }}>
            <span style={{ fontSize: 16, fontWeight: '700', color: Colors.textPrimary }}>Total</span>
            <span style={{ fontSize: 20, fontWeight: '800', color: Colors.textPrimary }}>{formatCurrency(total)}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            <PremiumButton label="Add as Personal Expense" onPress={handleAddPersonal} />
            <PremiumButton label="Discard" variant="ghost" onPress={() => { clearScan(); navigate('back'); }} />
          </div>
        </div>
      </div>
    </div>
  );
}
