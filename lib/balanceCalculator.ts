import { Balance, Expense, Member, Settlement } from '@/types';

/**
 * Calculate balances for all members in a group
 */
export const calculateMemberBalances = (
    expenses: Expense[],
    members: Member[]
): Balance[] => {
    const balances: Map<string, Balance> = new Map();

    // Initialize balances for all members
    members.forEach((member) => {
        balances.set(member.id, {
            groupId: expenses[0]?.groupId || '',
            memberId: member.id,
            memberName: member.name,
            totalPaid: 0,
            totalOwed: 0,
            netBalance: 0,
            lastUpdated: new Date(),
        });
    });

    // Calculate totals from expenses
    expenses.forEach((expense) => {
        // Add to payer's totalPaid
        const payerBalance = balances.get(expense.paidBy);
        if (payerBalance) {
            payerBalance.totalPaid += expense.amount;
        }

        // Add to each split member's totalOwed
        expense.splits.forEach((split) => {
            const memberBalance = balances.get(split.memberId);
            if (memberBalance) {
                memberBalance.totalOwed += split.amount;
            }
        });
    });

    // Calculate net balances
    balances.forEach((balance) => {
        balance.netBalance = balance.totalPaid - balance.totalOwed;
    });

    return Array.from(balances.values());
};

/**
 * Simplify debts using greedy algorithm
 * Minimizes the number of transactions needed
 */
export const simplifyDebts = (balances: Balance[]): Settlement[] => {
    const settlements: Settlement[] = [];

    // Separate creditors (positive balance) and debtors (negative balance)
    const creditors = balances
        .filter((b) => b.netBalance > 0.01) // Use small threshold for floating point
        .map((b) => ({ ...b }))
        .sort((a, b) => b.netBalance - a.netBalance);

    const debtors = balances
        .filter((b) => b.netBalance < -0.01)
        .map((b) => ({ ...b }))
        .sort((a, b) => a.netBalance - b.netBalance);

    let i = 0;
    let j = 0;

    while (i < creditors.length && j < debtors.length) {
        const creditor = creditors[i];
        const debtor = debtors[j];

        const amount = Math.min(creditor.netBalance, Math.abs(debtor.netBalance));

        if (amount > 0.01) {
            settlements.push({
                from: debtor.memberId,
                fromName: debtor.memberName,
                to: creditor.memberId,
                toName: creditor.memberName,
                amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
            });
        }

        creditor.netBalance -= amount;
        debtor.netBalance += amount;

        if (Math.abs(creditor.netBalance) < 0.01) i++;
        if (Math.abs(debtor.netBalance) < 0.01) j++;
    }

    return settlements;
};

/**
 * Get settlement suggestions for a group
 */
export const getSettlementSuggestions = (balances: Balance[]): Settlement[] => {
    return simplifyDebts(balances);
};

/**
 * Calculate equal split amounts for an expense
 */
export const calculateEqualSplit = (
    amount: number,
    memberIds: string[]
): { memberId: string; amount: number }[] => {
    const splitAmount = amount / memberIds.length;

    return memberIds.map((memberId) => ({
        memberId,
        amount: Math.round(splitAmount * 100) / 100,
    }));
};

/**
 * Validate that split amounts match the total expense amount
 */
export const validateSplits = (
    totalAmount: number,
    splits: { amount: number }[]
): boolean => {
    const splitTotal = splits.reduce((sum, split) => sum + split.amount, 0);
    return Math.abs(totalAmount - splitTotal) < 0.01; // Allow small floating point difference
};
