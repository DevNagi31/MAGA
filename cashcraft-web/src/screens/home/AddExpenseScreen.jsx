import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Colors, CATEGORIES } from '../../constants/theme';
import { useExpenseStore } from '../../store';
import CategoryChip from '../../components/CategoryChip';
import PremiumButton from '../../components/PremiumButton';
import ScreenHeader from '../../components/ScreenHeader';

export default function AddExpenseScreen({ navigate, params }) {
  const addExpense = useExpenseStore((s) => s.addExpense);
  const [amount, setAmount] = useState(params?.amount?.toString() || '');
  const [category, setCategory] = useState(params?.category || 'food');
  const [description, setDescription] = useState(params?.description || '');
  const [errors, setErrors] = useState({});

  const handleAmountChange = (e) => {
    const val = e.target.value;
    setAmount(val);
    const num = parseFloat(val);
    if (val && (num <= 0 || num > 999999)) {
      setErrors((p) => ({ ...p, amount: num <= 0 ? 'Amount must be greater than $0' : 'Amount cannot exceed $999,999' }));
    } else {
      setErrors((p) => ({ ...p, amount: null }));
    }
  };

  const handleAdd = () => {
    const val = parseFloat(amount);
    const newErrors = {};
    if (!val || val <= 0) newErrors.amount = 'Amount must be greater than $0';
    else if (val > 999999) newErrors.amount = 'Amount cannot exceed $999,999';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    addExpense({ amount: val, category, description: description.trim(), date: new Date().toISOString() });
    navigate('back');
  };

  const isValid = amount && parseFloat(amount) > 0 && parseFloat(amount) <= 999999 && description.trim();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: Colors.bg }}>
      <ScreenHeader title="Add Expense" onBack={() => navigate('back')} />
      <div className="screen" style={{ flex: 1 }}>
        <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Amount */}
          <div style={{
            textAlign: 'center', padding: '32px 20px',
            background: Colors.card, borderRadius: 16, border: `1px solid ${Colors.border}`,
          }}>
            <p style={{ fontSize: 12, fontWeight: '600', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Amount</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <span style={{ fontSize: 36, fontWeight: '700', color: Colors.accent }}>$</span>
              <input
                type="number"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                min="0.01"
                max="999999"
                autoFocus
                style={{
                  fontSize: 48, fontWeight: '800', color: errors.amount ? Colors.danger : Colors.textPrimary,
                  background: 'none', border: 'none', width: '160px',
                  textAlign: 'center', letterSpacing: -1,
                }}
              />
            </div>
            {errors.amount && <p style={{ fontSize: 12, color: Colors.danger, marginTop: 8, textAlign: 'center' }}>{errors.amount}</p>}
          </div>

          {/* Category */}
          <div>
            <p style={{ fontSize: 12, fontWeight: '600', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Category</p>
            <div style={{ overflowX: 'auto', display: 'flex', paddingBottom: 4 }}>
              {CATEGORIES.map((cat) => (
                <CategoryChip key={cat.id} category={cat} selected={category === cat.id} onPress={() => setCategory(cat.id)} />
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <p style={{ fontSize: 12, fontWeight: '600', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Description</p>
            <input
              type="text"
              value={description}
              onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: null })); }}
              placeholder="What was this for?"
              maxLength={80}
              style={{
                width: '100%', padding: '14px 16px',
                fontSize: 16, color: Colors.textPrimary,
                background: Colors.card, borderRadius: 12,
                border: `1px solid ${errors.description ? Colors.danger : Colors.border}`,
              }}
            />
            {errors.description && <p style={{ fontSize: 12, color: Colors.danger, marginTop: 6 }}>{errors.description}</p>}
          </div>

          {/* Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: Colors.card, borderRadius: 12, border: `1px solid ${Colors.border}` }}>
            <Calendar size={16} color={Colors.textSecondary} />
            <span style={{ fontSize: 15, color: Colors.textSecondary }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>

          <PremiumButton label="Add Expense" onPress={handleAdd} disabled={!isValid} />
        </div>
      </div>
    </div>
  );
}
