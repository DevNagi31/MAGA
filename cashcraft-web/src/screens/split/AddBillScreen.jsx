import { useState, useMemo } from 'react';
import { Colors } from '../../constants/theme';
import { useGroupStore } from '../../store';
import { formatCurrency } from '../../utils/formatters';
import MemberAvatar from '../../components/MemberAvatar';
import PremiumButton from '../../components/PremiumButton';
import ScreenHeader from '../../components/ScreenHeader';
import GlassCard from '../../components/GlassCard';

const SPLIT_METHODS = ['Equal', 'Custom', 'Percentage'];

export default function AddBillScreen({ navigate, params }) {
  const { groupId, prefilledItems } = params || {};
  const group = useGroupStore((s) => s.groups.find((g) => g.id === groupId));
  const addBillToGroup = useGroupStore((s) => s.addBillToGroup);

  const [amount, setAmount] = useState(prefilledItems ? prefilledItems.reduce((s, i) => s + i.amount, 0).toFixed(2) : '');
  const [description, setDescription] = useState('');
  const [paidBy, setPaidBy] = useState(group?.members[0]?.id || '');
  const [splitMethod, setSplitMethod] = useState('Equal');
  const [customAmounts, setCustomAmounts] = useState({});
  const [errors, setErrors] = useState({});

  const splits = useMemo(() => {
    const val = parseFloat(amount) || 0;
    if (!group || val <= 0) return [];
    const members = group.members;
    if (splitMethod === 'Equal') {
      const each = parseFloat((val / members.length).toFixed(2));
      return members.map((m) => ({ memberId: m.id, amount: each }));
    }
    if (splitMethod === 'Custom') {
      return members.map((m) => ({ memberId: m.id, amount: parseFloat(customAmounts[m.id] || '0') }));
    }
    if (splitMethod === 'Percentage') {
      const equalPct = 100 / members.length;
      return members.map((m) => ({ memberId: m.id, amount: parseFloat(((val * parseFloat(customAmounts[m.id] || equalPct)) / 100).toFixed(2)) }));
    }
    return [];
  }, [amount, group, splitMethod, customAmounts]);

  const splitsTotal = splits.reduce((s, sp) => s + sp.amount, 0);
  const billAmount = parseFloat(amount) || 0;
  const isBalanced = Math.abs(splitsTotal - billAmount) < 0.02;

  const handleAmountChange = (e) => {
    const val = e.target.value;
    setAmount(val);
    const num = parseFloat(val);
    if (val && num <= 0) setErrors((p) => ({ ...p, amount: 'Amount must be greater than $0' }));
    else if (val && num > 999999) setErrors((p) => ({ ...p, amount: 'Amount cannot exceed $999,999' }));
    else setErrors((p) => ({ ...p, amount: null }));
  };

  const handleCustomAmountChange = (memberId, val) => {
    const num = parseFloat(val);
    if (val && num < 0) return; // block negative custom splits
    setCustomAmounts((p) => ({ ...p, [memberId]: val }));
  };

  const handleAdd = () => {
    const newErrors = {};
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!billAmount || billAmount <= 0) newErrors.amount = 'Amount must be greater than $0';
    else if (billAmount > 999999) newErrors.amount = 'Amount cannot exceed $999,999';
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    if (!isBalanced) return;
    addBillToGroup(groupId, { description: description.trim(), amount: billAmount, paidBy, splits });
    navigate('back');
  };

  if (!group) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: Colors.bg }}>
      <ScreenHeader title="Add Bill" onBack={() => navigate('back')} />
      <div className="screen" style={{ flex: 1 }}>
        <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
          {/* Amount */}
          <div style={{ textAlign: 'center', padding: '28px 20px', background: Colors.card, borderRadius: 16, border: `1px solid ${Colors.border}` }}>
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
                style={{ fontSize: 48, fontWeight: '800', color: errors.amount ? Colors.danger : Colors.textPrimary, background: 'none', border: 'none', width: 160, textAlign: 'center', letterSpacing: -1 }}
              />
            </div>
            {errors.amount && <p style={{ fontSize: 12, color: Colors.danger, marginTop: 8, textAlign: 'center' }}>{errors.amount}</p>}
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
              style={{ width: '100%', padding: '14px 16px', fontSize: 16, color: Colors.textPrimary, background: Colors.card, borderRadius: 12, border: `1px solid ${errors.description ? Colors.danger : Colors.border}` }}
            />
            {errors.description && <p style={{ fontSize: 12, color: Colors.danger, marginTop: 6 }}>{errors.description}</p>}
          </div>

          {/* Paid by */}
          <div>
            <p style={{ fontSize: 12, fontWeight: '600', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Paid by</p>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {group.members.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPaidBy(m.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 14px', borderRadius: 999, flexShrink: 0,
                    background: paidBy === m.id ? Colors.accentDim : Colors.card,
                    border: `1px solid ${paidBy === m.id ? Colors.accent : Colors.border}`,
                    cursor: 'pointer',
                  }}
                >
                  <MemberAvatar name={m.name} color={m.color} size={26} />
                  <span style={{ fontSize: 14, fontWeight: '500', color: paidBy === m.id ? Colors.accent : Colors.textSecondary }}>{m.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Split Method */}
          <div>
            <p style={{ fontSize: 12, fontWeight: '600', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Split</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {SPLIT_METHODS.map((m) => (
                <button
                  key={m}
                  onClick={() => setSplitMethod(m)}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 10,
                    background: splitMethod === m ? Colors.accentDim : Colors.card,
                    border: `1px solid ${splitMethod === m ? Colors.accent : Colors.border}`,
                    color: splitMethod === m ? Colors.accent : Colors.textSecondary,
                    fontSize: 14, fontWeight: '600', cursor: 'pointer',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Split Breakdown */}
          {billAmount > 0 && (
            <GlassCard padding={14}>
              {group.members.map((m) => {
                const split = splits.find((s) => s.memberId === m.id);
                const memberAmount = split?.amount || 0;
                return (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 10, marginBottom: 10, borderBottom: `1px solid ${Colors.border}` }}>
                    <MemberAvatar name={m.name} color={m.color} size={30} />
                    <span style={{ flex: 1, fontSize: 15, fontWeight: '500', color: Colors.textPrimary }}>{m.name}</span>
                    {splitMethod === 'Equal' ? (
                      <span style={{ fontSize: 15, fontWeight: '700', color: Colors.textPrimary }}>{formatCurrency(memberAmount)}</span>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: Colors.cardElevated, borderRadius: 8, padding: '4px 8px', border: `1px solid ${Colors.border}` }}>
                        <span style={{ fontSize: 14, color: Colors.textTertiary }}>{splitMethod === 'Percentage' ? '%' : '$'}</span>
                        <input
                          type="number"
                          value={customAmounts[m.id] || ''}
                          onChange={(e) => handleCustomAmountChange(m.id, e.target.value)}
                          placeholder="0"
                          style={{ fontSize: 14, color: Colors.textPrimary, background: 'none', border: 'none', width: 60 }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
              {splitMethod !== 'Equal' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
                  <span style={{ fontSize: 13, color: Colors.textTertiary }}>Total split</span>
                  <span style={{ fontSize: 14, fontWeight: '700', color: isBalanced ? Colors.success : Colors.danger }}>
                    {formatCurrency(splitsTotal)} / {formatCurrency(billAmount)}
                  </span>
                </div>
              )}
            </GlassCard>
          )}

          <PremiumButton label="Add Bill" onPress={handleAdd} disabled={!description.trim() || !billAmount || !isBalanced} />
        </div>
      </div>
    </div>
  );
}
