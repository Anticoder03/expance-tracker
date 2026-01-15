'use client';

import { useMemo } from 'react';
import {
    LineChart,
    Line,
    PieChart,
    Pie,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { Expense, Member, DEFAULT_CATEGORIES } from '@/types';

interface ExpenseChartsProps {
    expenses: Expense[];
    members: Member[];
}

export default function ExpenseCharts({ expenses, members }: ExpenseChartsProps) {
    // Monthly expense data
    const monthlyData = useMemo(() => {
        const monthMap = new Map<string, number>();

        expenses.forEach((expense) => {
            const monthKey = new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'short',
            }).format(expense.date);

            monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + expense.amount);
        });

        return Array.from(monthMap.entries())
            .map(([month, amount]) => ({ month, amount }))
            .sort((a, b) => {
                const dateA = new Date(a.month);
                const dateB = new Date(b.month);
                return dateA.getTime() - dateB.getTime();
            });
    }, [expenses]);

    // Category breakdown data
    const categoryData = useMemo(() => {
        const categoryMap = new Map<string, number>();

        expenses.forEach((expense) => {
            const category = expense.category || 'other';
            categoryMap.set(category, (categoryMap.get(category) || 0) + expense.amount);
        });

        return Array.from(categoryMap.entries()).map(([id, value]) => {
            const category = DEFAULT_CATEGORIES.find((c) => c.id === id);
            return {
                name: category?.name || 'Other',
                value: Math.round(value * 100) / 100,
                color: category?.color || '#95A5A6',
            };
        });
    }, [expenses]);

    // Member spending data
    const memberSpendingData = useMemo(() => {
        const memberMap = new Map<string, { paid: number; owed: number }>();

        members.forEach((member) => {
            memberMap.set(member.id, { paid: 0, owed: 0 });
        });

        expenses.forEach((expense) => {
            const payer = memberMap.get(expense.paidBy);
            if (payer) {
                payer.paid += expense.amount;
            }

            expense.splits.forEach((split) => {
                const member = memberMap.get(split.memberId);
                if (member) {
                    member.owed += split.amount;
                }
            });
        });

        return members.map((member) => {
            const data = memberMap.get(member.id) || { paid: 0, owed: 0 };
            return {
                name: member.name,
                paid: Math.round(data.paid * 100) / 100,
                owed: Math.round(data.owed * 100) / 100,
            };
        });
    }, [expenses, members]);

    // Calculate total expenses
    const totalExpenses = useMemo(() => {
        return expenses.reduce((sum, expense) => sum + expense.amount, 0);
    }, [expenses]);

    if (expenses.length === 0) {
        return (
            <div className="glass-card p-12 text-center">
                <p className="text-gray-400">Add expenses to see analytics and charts</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Summary Stats */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="glass-card p-6">
                    <p className="text-sm text-gray-400 mb-2">Total Expenses</p>
                    <p className="text-3xl font-bold text-primary">${totalExpenses.toFixed(2)}</p>
                </div>
                <div className="glass-card p-6">
                    <p className="text-sm text-gray-400 mb-2">Number of Expenses</p>
                    <p className="text-3xl font-bold text-secondary">{expenses.length}</p>
                </div>
                <div className="glass-card p-6">
                    <p className="text-sm text-gray-400 mb-2">Average Expense</p>
                    <p className="text-3xl font-bold text-success">
                        ${(totalExpenses / expenses.length).toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Monthly Expense Trend */}
            {monthlyData.length > 0 && (
                <div className="glass-card p-6">
                    <h3 className="text-xl font-bold mb-6">Monthly Expense Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                            <XAxis dataKey="month" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1F2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px',
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="amount"
                                stroke="#6366F1"
                                strokeWidth={3}
                                dot={{ fill: '#6366F1', r: 6 }}
                                activeDot={{ r: 8 }}
                                name="Amount ($)"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Category Breakdown */}
            {categoryData.length > 0 && (
                <div className="glass-card p-6">
                    <h3 className="text-xl font-bold mb-6">Expense Breakdown by Category</h3>
                    <div className="grid md:grid-cols-2 gap-8">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1F2937',
                                        border: '1px solid #374151',
                                        borderRadius: '8px',
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Category List */}
                        <div className="space-y-3">
                            {categoryData
                                .sort((a, b) => b.value - a.value)
                                .map((category, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-4 h-4 rounded"
                                                style={{ backgroundColor: category.color }}
                                            ></div>
                                            <span className="font-medium">{category.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">${category.value.toFixed(2)}</p>
                                            <p className="text-xs text-gray-400">
                                                {((category.value / totalExpenses) * 100).toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Member Spending Comparison */}
            {memberSpendingData.length > 0 && (
                <div className="glass-card p-6">
                    <h3 className="text-xl font-bold mb-6">Member Spending Comparison</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={memberSpendingData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1F2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px',
                                }}
                            />
                            <Legend />
                            <Bar dataKey="paid" fill="#10B981" name="Paid ($)" />
                            <Bar dataKey="owed" fill="#F59E0B" name="Owed ($)" />
                        </BarChart>
                    </ResponsiveContainer>

                    {/* Member Stats Table */}
                    <div className="mt-6 overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-3 px-4">Member</th>
                                    <th className="text-right py-3 px-4">Total Paid</th>
                                    <th className="text-right py-3 px-4">Total Owed</th>
                                    <th className="text-right py-3 px-4">Net Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {memberSpendingData.map((member, index) => {
                                    const netBalance = member.paid - member.owed;
                                    return (
                                        <tr key={index} className="border-b border-white/5">
                                            <td className="py-3 px-4 font-medium">{member.name}</td>
                                            <td className="text-right py-3 px-4 text-success">${member.paid.toFixed(2)}</td>
                                            <td className="text-right py-3 px-4 text-warning">${member.owed.toFixed(2)}</td>
                                            <td
                                                className={`text-right py-3 px-4 font-bold ${netBalance > 0
                                                    ? 'text-success'
                                                    : netBalance < 0
                                                        ? 'text-danger'
                                                        : 'text-gray-400'
                                                    }`}
                                            >
                                                {netBalance > 0 ? '+' : ''}${netBalance.toFixed(2)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
