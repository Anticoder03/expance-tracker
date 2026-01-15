import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot, Timestamp, serverTimestamp, getDoc, orderBy, limit } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Group, Expense, Activity, Member } from '@/types';

// Your Firebase configuration
// Replace these values with your actual Firebase project credentials
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

// Test Firebase connection
export const testFirebaseConnection = async () => {
    try {
        // Check if Firebase is initialized
        if (!app) {
            throw new Error('Firebase app not initialized');
        }

        // Check if all required config values are present
        const missingConfig = [];
        if (!firebaseConfig.apiKey) missingConfig.push('API Key');
        if (!firebaseConfig.authDomain) missingConfig.push('Auth Domain');
        if (!firebaseConfig.projectId) missingConfig.push('Project ID');
        if (!firebaseConfig.storageBucket) missingConfig.push('Storage Bucket');
        if (!firebaseConfig.messagingSenderId) missingConfig.push('Messaging Sender ID');
        if (!firebaseConfig.appId) missingConfig.push('App ID');

        if (missingConfig.length > 0) {
            console.error('❌ Firebase Configuration Error: Missing values for:', missingConfig.join(', '));
            console.log('Please check your .env.local file and ensure all Firebase credentials are set.');
            return false;
        }

        // Try to access Firestore to verify connection
        const testCollection = collection(db, 'test');
        await getDocs(testCollection);

        console.log('✅ Firebase connected successfully!');
        console.log('📊 Firebase Project ID:', firebaseConfig.projectId);
        console.log('🔥 Firestore database is accessible');
        console.log('🔐 Authentication is configured');

        return true;
    } catch (error: any) {
        console.error('❌ Firebase connection failed:', error.message);

        if (error.code === 'permission-denied') {
            console.log('💡 Tip: Make sure Firestore security rules allow read access, or enable test mode in Firebase Console.');
        } else if (error.message.includes('API key not valid')) {
            console.log('💡 Tip: Check that your Firebase API key is correct in .env.local');
        } else {
            console.log('💡 Tip: Verify your Firebase configuration in .env.local and ensure the project exists in Firebase Console.');
        }

        return false;
    }
};

// Group Management Functions

/**
 * Create a new group
 */
export const createGroup = async (groupData: {
    name: string;
    description?: string;
    members: Member[];
    createdBy: string;
}) => {
    try {
        const groupRef = await addDoc(collection(db, 'groups'), {
            ...groupData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        console.log('✅ Group created successfully:', groupRef.id);
        return groupRef.id;
    } catch (error: any) {
        console.error('❌ Error creating group:', error.message);
        throw error;
    }
};

/**
 * Get a single group by ID
 */
export const getGroup = async (groupId: string): Promise<Group | null> => {
    try {
        const groupDoc = await getDoc(doc(db, 'groups', groupId));
        if (!groupDoc.exists()) {
            return null;
        }

        return {
            id: groupDoc.id,
            ...groupDoc.data(),
            createdAt: groupDoc.data().createdAt?.toDate() || new Date(),
            updatedAt: groupDoc.data().updatedAt?.toDate() || new Date(),
        } as Group;
    } catch (error: any) {
        console.error('❌ Error fetching group:', error.message);
        throw error;
    }
};

/**
 * Get all groups for a user
 */
export const getUserGroups = async (userEmail: string): Promise<Group[]> => {
    try {
        const groupsRef = collection(db, 'groups');
        const querySnapshot = await getDocs(groupsRef);

        const groups: Group[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Check if user is in members array
            const members = data.members || [];
            const isMember = members.some((m: Member) => m.email === userEmail);

            if (isMember) {
                groups.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                } as Group);
            }
        });

        return groups;
    } catch (error: any) {
        console.error('❌ Error fetching groups:', error.message);
        throw error;
    }
};

/**
 * Update a group
 */
export const updateGroup = async (groupId: string, data: Partial<Group>) => {
    try {
        const groupRef = doc(db, 'groups', groupId);
        await updateDoc(groupRef, {
            ...data,
            updatedAt: serverTimestamp(),
        });

        console.log('✅ Group updated successfully');
    } catch (error: any) {
        console.error('❌ Error updating group:', error.message);
        throw error;
    }
};

/**
 * Delete a group
 */
export const deleteGroup = async (groupId: string) => {
    try {
        await deleteDoc(doc(db, 'groups', groupId));
        console.log('✅ Group deleted successfully');
    } catch (error: any) {
        console.error('❌ Error deleting group:', error.message);
        throw error;
    }
};

/**
 * Subscribe to real-time group updates for a user
 */
export const subscribeToUserGroups = (
    userEmail: string,
    callback: (groups: Group[]) => void
) => {
    const groupsRef = collection(db, 'groups');

    return onSnapshot(groupsRef, (querySnapshot) => {
        const groups: Group[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const members = data.members || [];
            const isMember = members.some((m: Member) => m.email === userEmail);

            if (isMember) {
                groups.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                } as Group);
            }
        });

        callback(groups);
    });
};

// Expense Management Functions

/**
 * Create a new expense
 */
export const createExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
        const expenseRef = await addDoc(collection(db, 'expenses'), {
            ...expenseData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        console.log('✅ Expense created successfully:', expenseRef.id);
        return expenseRef.id;
    } catch (error: any) {
        console.error('❌ Error creating expense:', error.message);
        throw error;
    }
};

/**
 * Get all expenses for a group
 */
export const getGroupExpenses = async (groupId: string): Promise<Expense[]> => {
    try {
        const expensesRef = collection(db, 'expenses');
        const q = query(expensesRef, where('groupId', '==', groupId), orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);

        const expenses: Expense[] = [];
        querySnapshot.forEach((doc) => {
            expenses.push({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date?.toDate() || new Date(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate() || new Date(),
            } as Expense);
        });

        return expenses;
    } catch (error: any) {
        console.error('❌ Error fetching expenses:', error.message);
        throw error;
    }
};

/**
 * Update an expense
 */
export const updateExpense = async (expenseId: string, data: Partial<Expense>) => {
    try {
        const expenseRef = doc(db, 'expenses', expenseId);
        await updateDoc(expenseRef, {
            ...data,
            updatedAt: serverTimestamp(),
        });

        console.log('✅ Expense updated successfully');
    } catch (error: any) {
        console.error('❌ Error updating expense:', error.message);
        throw error;
    }
};

/**
 * Delete an expense
 */
export const deleteExpense = async (expenseId: string) => {
    try {
        await deleteDoc(doc(db, 'expenses', expenseId));
        console.log('✅ Expense deleted successfully');
    } catch (error: any) {
        console.error('❌ Error deleting expense:', error.message);
        throw error;
    }
};

/**
 * Subscribe to real-time expense updates for a group
 */
export const subscribeToGroupExpenses = (
    groupId: string,
    callback: (expenses: Expense[]) => void
) => {
    const expensesRef = collection(db, 'expenses');
    const q = query(expensesRef, where('groupId', '==', groupId), orderBy('date', 'desc'));

    return onSnapshot(q, (querySnapshot) => {
        const expenses: Expense[] = [];
        querySnapshot.forEach((doc) => {
            expenses.push({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date?.toDate() || new Date(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate() || new Date(),
            } as Expense);
        });

        callback(expenses);
    });
};

// Activity Management Functions

/**
 * Create a new activity
 */
export const createActivity = async (activityData: Omit<Activity, 'id' | 'createdAt'>) => {
    try {
        const activityRef = await addDoc(collection(db, 'activities'), {
            ...activityData,
            createdAt: serverTimestamp(),
        });

        console.log('✅ Activity created successfully:', activityRef.id);
        return activityRef.id;
    } catch (error: any) {
        console.error('❌ Error creating activity:', error.message);
        throw error;
    }
};

/**
 * Get recent activities for a group
 */
export const getGroupActivities = async (groupId: string, limitCount: number = 20): Promise<Activity[]> => {
    try {
        const activitiesRef = collection(db, 'activities');
        const q = query(
            activitiesRef,
            where('groupId', '==', groupId),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );
        const querySnapshot = await getDocs(q);

        const activities: Activity[] = [];
        querySnapshot.forEach((doc) => {
            activities.push({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
            } as Activity);
        });

        return activities;
    } catch (error: any) {
        console.error('❌ Error fetching activities:', error.message);
        throw error;
    }
};

/**
 * Subscribe to real-time activity updates for a group
 */
export const subscribeToGroupActivities = (
    groupId: string,
    limitCount: number = 20,
    callback: (activities: Activity[]) => void
) => {
    const activitiesRef = collection(db, 'activities');
    const q = query(
        activitiesRef,
        where('groupId', '==', groupId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
    );

    return onSnapshot(q, (querySnapshot) => {
        const activities: Activity[] = [];
        querySnapshot.forEach((doc) => {
            activities.push({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
            } as Activity);
        });

        callback(activities);
    });
};

export default app;
