'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Balance, Settlement } from '@/types';
import { calculateMemberBalances, getSettlementSuggestions } from '@/lib/balanceCalculator';
import { Expense, Member } from '@/types';

interface BalanceViewProps {
    expenses: Expense[];
    members: Member[];
}

export default function BalanceView({ expenses, members }: BalanceViewProps) {
    const balances = calculateMemberBalances(expenses, members);
    const settlements = getSettlementSuggestions(balances);

    return (
        <div className="space-y-6">
            {/* Member Balances */}
            <div>
                <h3 className="text-xl font-bold mb-4">Member Balances</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    {balances.map((balance) => (
                        <div key={balance.memberId} className="glass-card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold">{balance.memberName}</p>
                                    <p className="text-sm text-gray-400">
                                        Paid: ${balance.totalPaid.toFixed(2)} | Owes: ${balance.totalOwed.toFixed(2)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p
                                        className={`text-2xl font-bold ${balance.netBalance > 0
                                                ? 'text-success'
                                                : balance.netBalance < 0
                                                    ? 'text-danger'
                                                    : 'text-gray-400'
                                            }`}
                                    >
                                        {balance.netBalance > 0 ? '+' : ''}${balance.netBalance.toFixed(2)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {balance.netBalance > 0
                                            ? 'gets back'
                                            : balance.netBalance < 0
                                                ? 'owes'
                                                : 'settled up'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Settlement Suggestions */}
            {settlements.length > 0 && (
                <div>
                    <h3 className="text-xl font-bold mb-4">Settlement Suggestions</h3>
                    <div className="glass-card p-6">
                        <p className="text-sm text-gray-400 mb-4">
                            Simplified to {settlements.length} transaction{settlements.length > 1 ? 's' : ''}:
                        </p>
                        <div className="space-y-3">
                            {settlements.map((settlement, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="text-right flex-1">
                                            <p className="font-semibold">{settlement.fromName}</p>
                                            <p className="text-sm text-gray-400">pays</p>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <FontAwesomeIcon icon={faArrowRight} className="text-primary" />
                                            <p className="text-lg font-bold text-primary mt-1">
                                                ${settlement.amount.toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold">{settlement.toName}</p>
                                            <p className="text-sm text-gray-400">receives</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* No Settlements Needed */}
            {settlements.length === 0 && expenses.length > 0 && (
                <div className="glass-card p-8 text-center">
                    <p className="text-xl font-semibold text-success mb-2">✓ All Settled Up!</p>
                    <p className="text-gray-400">No outstanding balances in this group.</p>
                </div>
            )}

            {/* No Expenses Yet */}
            {expenses.length === 0 && (
                <div className="glass-card p-8 text-center">
                    <p className="text-gray-400">No expenses yet. Add an expense to see balances.</p>
                </div>
            )}
        </div>
    );
}
