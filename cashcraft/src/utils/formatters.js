export const formatCurrency = (amount, compact = false) => {
  if (amount === undefined || amount === null) return '$0.00';
  if (compact && Math.abs(amount) >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`;
  }
  return `$${Math.abs(amount).toFixed(2)}`;
};

export const formatCurrencySigned = (amount) => {
  if (amount >= 0) return `+$${amount.toFixed(2)}`;
  return `-$${Math.abs(amount).toFixed(2)}`;
};

export const formatDate = (date) => {
  const d = new Date(date);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === now.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';

  const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diff < 7) return d.toLocaleDateString('en-US', { weekday: 'long' });

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const formatDateFull = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatTime = (date) => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

export const formatPercentage = (value, total) => {
  if (!total || total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export const getDaysRemainingInMonth = () => {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return lastDay.getDate() - now.getDate();
};

export const getCurrentMonth = () => {
  return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export const groupExpensesByDate = (expenses) => {
  const groups = {};
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  expenses.forEach((expense) => {
    const d = new Date(expense.date);
    let key;

    if (d.toDateString() === now.toDateString()) {
      key = 'Today';
    } else if (d.toDateString() === yesterday.toDateString()) {
      key = 'Yesterday';
    } else {
      const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
      if (diff < 7) {
        key = 'This Week';
      } else if (diff < 14) {
        key = 'Last Week';
      } else {
        key = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }
    }

    if (!groups[key]) groups[key] = [];
    groups[key].push(expense);
  });

  return groups;
};
