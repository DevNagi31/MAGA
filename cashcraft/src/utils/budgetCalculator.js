import { BudgetBuckets } from '../constants/theme';
import { getDaysRemainingInMonth } from './formatters';

export const getBudgetAllocations = (salary, budgetRule) => {
  if (!salary || !budgetRule) return { needs: 0, wants: 0, savings: 0 };

  return {
    needs: (salary * budgetRule.needs) / 100,
    wants: (salary * budgetRule.wants) / 100,
    savings: (salary * budgetRule.savings) / 100,
  };
};

export const getCategoryBucket = (category) => {
  if (BudgetBuckets.needs.includes(category)) return 'needs';
  if (BudgetBuckets.wants.includes(category)) return 'wants';
  return 'wants';
};

export const getSpendingByBucket = (expenses) => {
  const buckets = { needs: 0, wants: 0, savings: 0 };

  expenses.forEach((expense) => {
    const bucket = getCategoryBucket(expense.category);
    buckets[bucket] += expense.amount;
  });

  return buckets;
};

export const getSpendingByCategory = (expenses) => {
  const categories = {};
  expenses.forEach((expense) => {
    if (!categories[expense.category]) categories[expense.category] = 0;
    categories[expense.category] += expense.amount;
  });
  return categories;
};

export const generateInsights = (expenses, salary, budgetRule) => {
  const insights = [];
  const allocations = getBudgetAllocations(salary, budgetRule);
  const spending = getSpendingByBucket(expenses);
  const daysLeft = getDaysRemainingInMonth();
  const now = new Date();
  const dayOfMonth = now.getDate();
  const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthProgress = dayOfMonth / totalDays;

  // Needs insight
  if (allocations.needs > 0) {
    const needsUsed = (spending.needs / allocations.needs) * 100;
    if (needsUsed > monthProgress * 100 + 15) {
      insights.push({
        type: 'warning',
        text: `You've used ${Math.round(needsUsed)}% of your essentials budget by day ${dayOfMonth}.`,
      });
    } else if (needsUsed < monthProgress * 100 - 20) {
      insights.push({
        type: 'success',
        text: `Great! You're under budget on essentials — ${Math.round(100 - needsUsed)}% remaining.`,
      });
    }
  }

  // Wants insight
  if (allocations.wants > 0) {
    const wantsUsed = (spending.wants / allocations.wants) * 100;
    if (wantsUsed > 85) {
      insights.push({
        type: 'danger',
        text: `Discretionary spending at ${Math.round(wantsUsed)}% — only $${(allocations.wants - spending.wants).toFixed(0)} left.`,
      });
    }
  }

  // Days left insight
  const totalSpent = spending.needs + spending.wants;
  const remaining = salary - totalSpent;
  if (remaining > 0 && daysLeft > 0) {
    const dailyBudget = remaining / daysLeft;
    insights.push({
      type: 'info',
      text: `$${dailyBudget.toFixed(0)}/day to stay on track with ${daysLeft} days left.`,
    });
  }

  return insights;
};
