// TypeScript types for the Split Expense Tracker

export interface User {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
}

export interface Member {
    id: string;              // Unique identifier
    name: string;            // Member's display name
    email: string;           // Member's email
    userId?: string;         // Firebase user ID (if registered)
    addedAt: Date;          // When added to group
}

export interface Group {
    id: string;
    name: string;
    description?: string;
    members: Member[];       // Array of Member objects
    createdBy: string;       // User ID
    createdAt: Date;
    updatedAt: Date;
}

export type SplitType = 'equal' | 'unequal' | 'percentage' | 'custom';

export interface Split {
    memberId: string;
    amount: number;          // Amount this member owes
    percentage?: number;     // For percentage splits
    paid: boolean;           // Whether this member has paid
}

export interface Expense {
    id: string;
    groupId: string;
    description: string;
    amount: number;
    currency: string;        // Default: USD
    paidBy: string;          // Member ID who paid
    splitType: SplitType;
    splits: Split[];         // How expense is split
    category?: string;       // Optional category
    date: Date;
    createdBy: string;       // User ID who created
    createdAt: Date;
    updatedAt: Date;
    paymentProof?: string;   // URL to payment screenshot
    settled: boolean;        // Whether expense is settled
}

export interface Balance {
    groupId: string;
    memberId: string;
    memberName: string;
    totalPaid: number;       // Total amount paid by member
    totalOwed: number;       // Total amount owed by member
    netBalance: number;      // Positive = owed to them, Negative = they owe
    lastUpdated: Date;
}

export interface Settlement {
    from: string;            // Member ID who owes
    fromName: string;        // Member name who owes
    to: string;              // Member ID who is owed
    toName: string;          // Member name who is owed
    amount: number;
}

export type ActivityType =
    | 'expense_added'
    | 'expense_edited'
    | 'expense_deleted'
    | 'expense_settled'
    | 'member_added'
    | 'member_removed'
    | 'group_created'
    | 'group_updated';

export interface Activity {
    id: string;
    groupId: string;
    type: ActivityType;
    description: string;
    performedBy: string;     // User ID
    performedByName: string; // User display name
    metadata?: any;          // Additional data
    createdAt: Date;
}

export interface ExpenseCategory {
    id: string;
    name: string;
    icon: string;            // Font Awesome icon name
    color: string;           // Hex color code
}

// Predefined expense categories
export const DEFAULT_CATEGORIES: ExpenseCategory[] = [
    { id: 'food', name: 'Food & Dining', icon: 'utensils', color: '#FF6B6B' },
    { id: 'transport', name: 'Transportation', icon: 'car', color: '#4ECDC4' },
    { id: 'shopping', name: 'Shopping', icon: 'shopping-bag', color: '#95E1D3' },
    { id: 'entertainment', name: 'Entertainment', icon: 'film', color: '#F38181' },
    { id: 'utilities', name: 'Utilities', icon: 'bolt', color: '#FFA07A' },
    { id: 'rent', name: 'Rent', icon: 'home', color: '#6C5CE7' },
    { id: 'groceries', name: 'Groceries', icon: 'shopping-cart', color: '#00B894' },
    { id: 'health', name: 'Health', icon: 'heartbeat', color: '#E74C3C' },
    { id: 'other', name: 'Other', icon: 'ellipsis-h', color: '#95A5A6' },
];

