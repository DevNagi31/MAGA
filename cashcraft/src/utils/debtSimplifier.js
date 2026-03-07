/**
 * Simplifies debts within a group using a greedy algorithm.
 * Minimizes the number of transactions needed to settle all debts.
 */
export const simplifyDebts = (members, bills) => {
  // Calculate net balance per member
  const balances = {};
  members.forEach((m) => {
    balances[m.id] = 0;
  });

  bills.forEach((bill) => {
    const payer = bill.paidBy;
    if (balances[payer] === undefined) balances[payer] = 0;
    balances[payer] += bill.amount;

    bill.splits.forEach((split) => {
      if (balances[split.memberId] === undefined) balances[split.memberId] = 0;
      balances[split.memberId] -= split.amount;
    });
  });

  // Separate into debtors (negative balance) and creditors (positive balance)
  const debtors = [];
  const creditors = [];

  Object.entries(balances).forEach(([id, balance]) => {
    const member = members.find((m) => m.id === id);
    if (!member) return;
    if (balance < -0.01) {
      debtors.push({ id, name: member.name, amount: Math.abs(balance) });
    } else if (balance > 0.01) {
      creditors.push({ id, name: member.name, amount: balance });
    }
  });

  // Greedy simplification
  const transactions = [];

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  let di = 0;
  let ci = 0;

  while (di < debtors.length && ci < creditors.length) {
    const debtor = debtors[di];
    const creditor = creditors[ci];
    const amount = Math.min(debtor.amount, creditor.amount);

    if (amount > 0.01) {
      transactions.push({
        from: debtor.id,
        fromName: debtor.name,
        to: creditor.id,
        toName: creditor.name,
        amount: parseFloat(amount.toFixed(2)),
      });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) di++;
    if (creditor.amount < 0.01) ci++;
  }

  return transactions;
};

export const getMemberBalance = (memberId, members, bills) => {
  let balance = 0;

  bills.forEach((bill) => {
    if (bill.paidBy === memberId) {
      balance += bill.amount;
    }
    const split = bill.splits.find((s) => s.memberId === memberId);
    if (split) {
      balance -= split.amount;
    }
  });

  return parseFloat(balance.toFixed(2));
};
