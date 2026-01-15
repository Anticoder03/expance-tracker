'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCalendar,
    faUser,
    faDollarSign,
    faUtensils,
    faCar,
    faShoppingBag,
    faFilm,
    faBolt,
    faHome,
    faShoppingCart,
    faHeartbeat,
    faEllipsisH
} from '@fortawesome/free-solid-svg-icons';
import { Expense, Member, DEFAULT_CATEGORIES } from '@/types';

interface ExpenseCardProps {
    expense: Expense;
    members: Member[];
}

// Map icon names to FontAwesome icon objects
const iconMap: Record<string, any> = {
    'utensils': faUtensils,
    'car': faCar,
    'shopping-bag': faShoppingBag,
    'film': faFilm,
    'bolt': faBolt,
    'home': faHome,
    'shopping-cart': faShoppingCart,
    'heartbeat': faHeartbeat,
    'ellipsis-h': faEllipsisH,
};

export default function ExpenseCard({ expense, members }: ExpenseCardProps) {
    const payer = members.find(m => m.id === expense.paidBy);
    const category = DEFAULT_CATEGORIES.find(c => c.id === expense.category);

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).format(date);
    };

    // Get the icon for the category
    const getCategoryIcon = () => {
        if (!category) return faDollarSign;
        return iconMap[category.icon] || faDollarSign;
    };

    return (
        <div className="glass-card p-6 hover:scale-102 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        {category && (
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: `${category.color}20` }}
                            >
                                <FontAwesomeIcon
                                    icon={getCategoryIcon()}
                                    style={{ color: category.color }}
                                />
                            </div>
                        )}
                        <div>
                            <h3 className="text-lg font-bold">{expense.description}</h3>
                            <p className="text-sm text-gray-400">{category?.name || 'Other'}</p>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-primary">${expense.amount.toFixed(2)}</p>
                </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-400 border-t border-white/10 pt-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faUser} />
                        <span>Paid by {payer?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faCalendar} />
                        <span>{formatDate(expense.date)}</span>
                    </div>
                </div>
                <div className="text-xs px-3 py-1 bg-white/5 rounded-full">
                    {expense.splitType === 'equal' ? 'Split equally' : expense.splitType}
                </div>
            </div>

            {/* Split Details */}
            <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-gray-500 mb-2">Split among {expense.splits.length} members:</p>
                <div className="grid grid-cols-2 gap-2">
                    {expense.splits.slice(0, 4).map((split) => {
                        const member = members.find(m => m.id === split.memberId);
                        return (
                            <div key={split.memberId} className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">{member?.name || 'Unknown'}</span>
                                <span className="font-medium">${split.amount.toFixed(2)}</span>
                            </div>
                        );
                    })}
                    {expense.splits.length > 4 && (
                        <div className="text-xs text-gray-500 col-span-2">
                            +{expense.splits.length - 4} more...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
