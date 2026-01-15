'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft,
    faPlus,
    faUsers,
    faReceipt,
    faBalanceScale,
    faHistory,
    faChartLine,
    faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { Group, Expense, Activity } from '@/types';
import { getGroup, subscribeToGroupExpenses, subscribeToGroupActivities } from '@/lib/firebase';
import AddExpenseModal from '@/components/AddExpenseModal';
import ExpenseCard from '@/components/ExpenseCard';
import BalanceView from '@/components/BalanceView';
import ExpenseCharts from '@/components/ExpenseCharts';

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap async params in Next.js 15
    const { id: groupId } = use(params);

    const { user } = useAuth();
    const router = useRouter();
    const [group, setGroup] = useState<Group | null>(null);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'expenses' | 'balances' | 'analytics' | 'activity'>('expenses');
    const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        const loadGroup = async () => {
            try {
                const groupData = await getGroup(groupId);
                if (!groupData) {
                    router.push('/dashboard');
                    return;
                }
                setGroup(groupData);
                setLoading(false);
            } catch (error) {
                console.error('Error loading group:', error);
                router.push('/dashboard');
            }
        };

        loadGroup();

        // Subscribe to expenses
        const unsubscribeExpenses = subscribeToGroupExpenses(groupId, (updatedExpenses) => {
            setExpenses(updatedExpenses);
        });

        // Subscribe to activities
        const unsubscribeActivities = subscribeToGroupActivities(groupId, 20, (updatedActivities) => {
            setActivities(updatedActivities);
        });

        return () => {
            unsubscribeExpenses();
            unsubscribeActivities();
        };
    }, [user, groupId, router]);

    if (loading || !group) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <FontAwesomeIcon icon={faSpinner} className="text-4xl text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Content */}
            <div className="relative z-10">
                {/* Header */}
                <header className="glass border-b border-white/10">
                    <div className="container mx-auto px-4 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => router.push('/dashboard')}
                                    className="glass-card px-4 py-2 hover:bg-white/10 transition-all"
                                >
                                    <FontAwesomeIcon icon={faArrowLeft} />
                                </button>
                                <div>
                                    <h1 className="text-3xl font-bold gradient-text">{group.name}</h1>
                                    {group.description && (
                                        <p className="text-gray-400 mt-1">{group.description}</p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setIsAddExpenseOpen(true)}
                                className="glass-card px-6 py-3 bg-gradient-to-r from-primary/20 to-primary-dark/20 hover:from-primary/30 hover:to-primary-dark/30 transition-all duration-300 flex items-center gap-3 font-semibold animate-pulse-glow"
                            >
                                <FontAwesomeIcon icon={faPlus} />
                                Add Expense
                            </button>
                        </div>

                        {/* Members */}
                        <div className="mt-4 flex items-center gap-2 flex-wrap">
                            <FontAwesomeIcon icon={faUsers} className="text-gray-400" />
                            {group.members.map((member, index) => (
                                <span key={member.id} className="px-3 py-1 bg-white/5 rounded-full text-sm">
                                    {member.name}
                                    {index < group.members.length - 1 && ','}
                                </span>
                            ))}
                        </div>
                    </div>
                </header>

                {/* Tabs */}
                <div className="container mx-auto px-4 py-6">
                    <div className="flex gap-4 mb-6 border-b border-white/10 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('expenses')}
                            className={`px-6 py-3 font-semibold transition-all border-b-2 whitespace-nowrap ${activeTab === 'expenses'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-400 hover:text-white'
                                }`}
                        >
                            <FontAwesomeIcon icon={faReceipt} className="mr-2" />
                            Expenses ({expenses.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('balances')}
                            className={`px-6 py-3 font-semibold transition-all border-b-2 whitespace-nowrap ${activeTab === 'balances'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-400 hover:text-white'
                                }`}
                        >
                            <FontAwesomeIcon icon={faBalanceScale} className="mr-2" />
                            Balances
                        </button>
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`px-6 py-3 font-semibold transition-all border-b-2 whitespace-nowrap ${activeTab === 'analytics'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-400 hover:text-white'
                                }`}
                        >
                            <FontAwesomeIcon icon={faChartLine} className="mr-2" />
                            Analytics
                        </button>
                        <button
                            onClick={() => setActiveTab('activity')}
                            className={`px-6 py-3 font-semibold transition-all border-b-2 whitespace-nowrap ${activeTab === 'activity'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-400 hover:text-white'
                                }`}
                        >
                            <FontAwesomeIcon icon={faHistory} className="mr-2" />
                            Activity ({activities.length})
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div>
                        {activeTab === 'expenses' && (
                            <div>
                                {expenses.length === 0 ? (
                                    <div className="glass-card p-12 text-center">
                                        <FontAwesomeIcon icon={faReceipt} className="text-6xl text-gray-600 mb-4" />
                                        <h3 className="text-2xl font-bold mb-2">No Expenses Yet</h3>
                                        <p className="text-gray-400 mb-6">
                                            Start tracking expenses by adding your first one
                                        </p>
                                        <button
                                            onClick={() => setIsAddExpenseOpen(true)}
                                            className="glass-card px-8 py-4 bg-gradient-to-r from-primary/20 to-primary-dark/20 hover:from-primary/30 hover:to-primary-dark/30 transition-all duration-300 inline-flex items-center gap-3 font-semibold"
                                        >
                                            <FontAwesomeIcon icon={faPlus} />
                                            Add First Expense
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {expenses.map((expense) => (
                                            <ExpenseCard key={expense.id} expense={expense} members={group.members} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'balances' && (
                            <BalanceView expenses={expenses} members={group.members} />
                        )}

                        {activeTab === 'analytics' && (
                            <ExpenseCharts expenses={expenses} members={group.members} />
                        )}

                        {activeTab === 'activity' && (
                            <div>
                                {activities.length === 0 ? (
                                    <div className="glass-card p-12 text-center">
                                        <FontAwesomeIcon icon={faHistory} className="text-6xl text-gray-600 mb-4" />
                                        <h3 className="text-2xl font-bold mb-2">No Activity Yet</h3>
                                        <p className="text-gray-400">
                                            Activity will appear here as you add expenses and make changes
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {activities.map((activity) => (
                                            <div key={activity.id} className="glass-card p-4 flex items-start gap-4">
                                                <div className="flex-1">
                                                    <p className="font-medium">{activity.description}</p>
                                                    <p className="text-sm text-gray-400 mt-1">
                                                        {new Intl.DateTimeFormat('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: 'numeric',
                                                            minute: 'numeric',
                                                        }).format(activity.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Expense Modal */}
            <AddExpenseModal
                isOpen={isAddExpenseOpen}
                onClose={() => setIsAddExpenseOpen(false)}
                groupId={group.id}
                members={group.members}
                onExpenseAdded={() => {
                    // Expenses will update automatically via the real-time listener
                }}
            />
        </div>
    );
}
