'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSpinner, faDollarSign, faCalendar } from '@fortawesome/free-solid-svg-icons';
import { createExpense, createActivity } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Member, SplitType, DEFAULT_CATEGORIES } from '@/types';
import { calculateEqualSplit } from '@/lib/balanceCalculator';

interface AddExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupId: string;
    members: Member[];
    onExpenseAdded: () => void;
}

export default function AddExpenseModal({ isOpen, onClose, groupId, members, onExpenseAdded }: AddExpenseModalProps) {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [paidBy, setPaidBy] = useState('');
    const [splitType, setSplitType] = useState<SplitType>('equal');
    const [category, setCategory] = useState('other');
    const [date, setDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth();

    // Set initial date on client side only to avoid hydration mismatch
    useEffect(() => {
        if (!date) {
            setDate(new Date().toISOString().split('T')[0]);
        }
    }, [date]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!description.trim()) {
            setError('Description is required');
            return;
        }

        const expenseAmount = parseFloat(amount);
        if (isNaN(expenseAmount) || expenseAmount <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        if (!paidBy) {
            setError('Please select who paid');
            return;
        }

        if (!user) {
            setError('You must be logged in');
            return;
        }

        setLoading(true);

        try {
            // Calculate equal splits for all members
            const memberIds = members.map(m => m.id);
            const splitAmounts = calculateEqualSplit(expenseAmount, memberIds);

            const splits = splitAmounts.map(s => ({
                memberId: s.memberId,
                amount: s.amount,
                paid: s.memberId === paidBy, // Mark as paid if they're the payer
            }));

            await createExpense({
                groupId,
                description: description.trim(),
                amount: expenseAmount,
                currency: 'USD',
                paidBy,
                splitType,
                splits,
                category,
                date: new Date(date),
                createdBy: user.uid,
                settled: false,
            });

            // Create activity
            const payer = members.find(m => m.id === paidBy);
            await createActivity({
                groupId,
                type: 'expense_added',
                description: `${user.displayName || user.email} added expense: ${description} ($${expenseAmount})`,
                performedBy: user.uid,
                performedByName: user.displayName || user.email!,
                metadata: {
                    expenseAmount,
                    paidBy: payer?.name,
                },
            });

            // Reset form
            setDescription('');
            setAmount('');
            setPaidBy('');
            setCategory('other');
            setDate('');

            onExpenseAdded();
            onClose();
        } catch (err: any) {
            console.error('Error creating expense:', err);
            setError('Failed to create expense. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            <div className="glass-card p-8 max-w-lg w-full relative z-10 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold gradient-text">Add Expense</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <FontAwesomeIcon icon={faTimes} className="text-xl" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium mb-2">
                            Description *
                        </label>
                        <input
                            id="description"
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            placeholder="e.g., Dinner at restaurant"
                        />
                    </div>

                    {/* Amount */}
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium mb-2">
                            Amount ($) *
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FontAwesomeIcon icon={faDollarSign} className="text-gray-400" />
                            </div>
                            <input
                                id="amount"
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* Paid By */}
                    <div>
                        <label htmlFor="paidBy" className="block text-sm font-medium mb-2">
                            Paid By *
                        </label>
                        <select
                            id="paidBy"
                            value={paidBy}
                            onChange={(e) => setPaidBy(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-black/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all "
                        >
                            <option value="">Select member</option>
                            {members.map((member) => (
                                <option className="text-black" key={member.id} value={member.id}>
                                    {member.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Category */}
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium mb-2">
                            Category
                        </label>
                        <select
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-3 bg-black/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all "
                        >
                            {DEFAULT_CATEGORIES.map((cat) => (
                                <option className='text-black' key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium mb-2">
                            Date
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FontAwesomeIcon icon={faCalendar} className="text-gray-400" />
                            </div>
                            <input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Split Type Info */}
                    <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                        <p className="text-sm text-gray-300">
                            <strong>Split Type:</strong> Equal split among all {members.length} members
                            {amount && !isNaN(parseFloat(amount)) && (
                                <span className="block mt-1">
                                    Each person owes: ${(parseFloat(amount) / members.length).toFixed(2)}
                                </span>
                            )}
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-danger/10 border border-danger/30 rounded-lg">
                            <p className="text-danger text-sm">{error}</p>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg font-semibold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                'Add Expense'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
