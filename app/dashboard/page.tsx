'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus,
    faSignOutAlt,
    faUsers,
    faSpinner
} from '@fortawesome/free-solid-svg-icons';
import CreateGroupModal from '@/components/CreateGroupModal';
import GroupCard from '@/components/GroupCard';
import { Group } from '@/types';
import { subscribeToUserGroups, deleteGroup } from '@/lib/firebase';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        // Subscribe to real-time group updates
        const unsubscribe = subscribeToUserGroups(user.email!, (updatedGroups) => {
            setGroups(updatedGroups);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, router]);

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleDeleteGroup = async (groupId: string) => {
        try {
            await deleteGroup(groupId);
        } catch (error: any) {
            console.error('Delete error:', error);
            setError('Failed to delete group');
        }
    };

    const handleGroupCreated = () => {
        // Groups will update automatically via the real-time listener
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <FontAwesomeIcon icon={faSpinner} className="text-4xl text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Animated background elements */}
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
                            <div>
                                <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
                                <p className="text-gray-400 mt-1">Welcome back, {user?.displayName || user?.email}!</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="glass-card px-6 py-3 hover:bg-danger/20 transition-all duration-300 flex items-center gap-2"
                            >
                                <FontAwesomeIcon icon={faSignOutAlt} />
                                Logout
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="container mx-auto px-4 py-12">
                    {/* Create Group Button */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Your Groups</h2>
                            <p className="text-gray-400">Manage your expense groups</p>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="glass-card px-6 py-3 bg-gradient-to-r from-primary/20 to-primary-dark/20 hover:from-primary/30 hover:to-primary-dark/30 transition-all duration-300 flex items-center gap-3 font-semibold animate-pulse-glow"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            Create New Group
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-danger/10 border border-danger/30 rounded-lg">
                            <p className="text-danger">{error}</p>
                        </div>
                    )}

                    {/* Groups Grid */}
                    {groups.length === 0 ? (
                        <div className="glass-card p-12 text-center">
                            <FontAwesomeIcon icon={faUsers} className="text-6xl text-gray-600 mb-4" />
                            <h3 className="text-2xl font-bold mb-2">No Groups Yet</h3>
                            <p className="text-gray-400 mb-6">
                                Create your first group to start tracking shared expenses
                            </p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="glass-card px-8 py-4 bg-gradient-to-r from-primary/20 to-primary-dark/20 hover:from-primary/30 hover:to-primary-dark/30 transition-all duration-300 inline-flex items-center gap-3 font-semibold"
                            >
                                <FontAwesomeIcon icon={faPlus} />
                                Create Your First Group
                            </button>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {groups.map((group) => (
                                <GroupCard
                                    key={group.id}
                                    group={group}
                                    onDelete={handleDeleteGroup}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {/* Create Group Modal */}
            <CreateGroupModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onGroupCreated={handleGroupCreated}
            />
        </div>
    );
}
