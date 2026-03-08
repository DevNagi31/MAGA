import { BudgetBuckets } from '../constants/theme';
import { getDaysRemainingInMonth } from './formatters';

export const getCategoryBucket = (category) => {
  if (BudgetBuckets.needs.includes(category)) return 'needs';
  return 'wants';
};

export const getSpendingByBucket = (expenses) => {
  const buckets = { needs: 0, wants: 0, savings: 0 };
  expenses.forEach((e) => { buckets[getCategoryBucket(e.category)] += e.amount; });
  return buckets;
};

export const getSpendingByCategory = (expenses) => {
  const categories = {};
  expenses.forEach((e) => {
    if (!categories[e.category]) categories[e.category] = 0;
    categories[e.category] += e.amount;
  });
  return categories;
};

export const generateInsights = (expenses, salary, budgetRule) => {
  const insights = [];
  if (!budgetRule) return insights;

  const allocations = {
    needs: (salary * budgetRule.needs) / 100,
    wants: (salary * budgetRule.wants) / 100,
    savings: (salary * budgetRule.savings) / 100,
  };
  const spending = getSpendingByBucket(expenses);
  const daysLeft = getDaysRemainingInMonth();
  const now = new Date();
  const dayOfMonth = now.getDate();
  const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthProgress = dayOfMonth / totalDays;

  if (allocations.needs > 0) {
    const needsUsed = (spending.needs / allocations.needs) * 100;
    if (needsUsed > monthProgress * 100 + 15) {
      insights.push({ type: 'warning', text: `You've used ${Math.round(needsUsed)}% of your essentials budget by day ${dayOfMonth}.` });
    } else if (needsUsed < monthProgress * 100 - 20) {
      insights.push({ type: 'success', text: `Great! You're under budget on essentials — ${Math.round(100 - needsUsed)}% remaining.` });
    }
  }

  if (allocations.wants > 0) {
    const wantsUsed = (spending.wants / allocations.wants) * 100;
    if (wantsUsed > 85) {
      insights.push({ type: 'danger', text: `Discretionary spending at ${Math.round(wantsUsed)}% — only $${(allocations.wants - spending.wants).toFixed(0)} left.` });
    }
  }

  const totalSpent = spending.needs + spending.wants;
  const remaining = salary - totalSpent;
  if (remaining > 0 && daysLeft > 0) {
    insights.push({ type: 'info', text: `$${(remaining / daysLeft).toFixed(0)}/day to stay on track with ${daysLeft} days left.` });
  }

  return insights;
};
