'use client';

import { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes, faUsers, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { createGroup } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Member } from '@/types';

interface CreateGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGroupCreated: () => void;
}

export default function CreateGroupModal({ isOpen, onClose, onGroupCreated }: CreateGroupModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [memberName, setMemberName] = useState('');
    const [memberEmail, setMemberEmail] = useState('');
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth();

    // Use a counter for stable ID generation (no hydration issues)
    const memberCounterRef = useRef(0);

    const handleAddMember = () => {
        if (memberName.trim() && memberEmail.trim()) {
            // Check if email already exists
            if (members.some(m => m.email === memberEmail.trim())) {
                setError('Member with this email already exists');
                return;
            }

            // Generate stable ID using counter (no Date.now() or Math.random())
            memberCounterRef.current += 1;
            const newMember: Member = {
                id: `temp_member_${memberCounterRef.current}`,
                name: memberName.trim(),
                email: memberEmail.trim(),
                addedAt: new Date(),
            };

            setMembers([...members, newMember]);
            setMemberName('');
            setMemberEmail('');
            setError('');
        } else {
            setError('Please enter both name and email');
        }
    };

    const handleRemoveMember = (memberId: string) => {
        setMembers(members.filter(m => m.id !== memberId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Group name is required');
            return;
        }

        if (!user) {
            setError('You must be logged in to create a group');
            return;
        }

        setLoading(true);

        try {
            // Include the current user as a member
            const currentUserMember: Member = {
                id: user.uid,
                name: user.displayName || user.email!.split('@')[0],
                email: user.email!,
                userId: user.uid,
                addedAt: new Date(),
            };

            // Check if current user is already in members list
            const allMembers = members.some(m => m.email === user.email)
                ? members
                : [currentUserMember, ...members];

            await createGroup({
                name: name.trim(),
                description: description.trim(),
                members: allMembers,
                createdBy: user.uid,
            });

            // Reset form
            setName('');
            setDescription('');
            setMembers([]);
            setMemberName('');
            setMemberEmail('');

            onGroupCreated();
            onClose();
        } catch (err: any) {
            console.error('Error creating group:', err);
            setError('Failed to create group. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="glass-card p-8 max-w-lg w-full relative z-10 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold gradient-text">Create New Group</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <FontAwesomeIcon icon={faTimes} className="text-xl" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Group Name */}
                    <div>
                        <label htmlFor="groupName" className="block text-sm font-medium mb-2">
                            Group Name *
                        </label>
                        <input
                            id="groupName"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            placeholder="e.g., Roommates, Trip to Paris"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium mb-2">
                            Description (Optional)
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                            placeholder="What is this group for?"
                        />
                    </div>

                    {/* Add Members */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Add Members
                        </label>
                        <div className="space-y-3">
                            <input
                                type="text"
                                value={memberName}
                                onChange={(e) => setMemberName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault())}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                placeholder="Member name"
                            />
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    value={memberEmail}
                                    onChange={(e) => setMemberEmail(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMember())}
                                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    placeholder="member@example.com"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddMember}
                                    className="px-4 py-3 bg-primary/20 hover:bg-primary/30 rounded-lg transition-colors"
                                >
                                    <FontAwesomeIcon icon={faPlus} />
                                </button>
                            </div>
                        </div>

                        {/* Member List */}
                        {members.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {members.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-lg"
                                    >
                                        <div>
                                            <p className="font-medium">{member.name}</p>
                                            <p className="text-sm text-gray-400">{member.email}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveMember(member.id)}
                                            className="text-danger hover:text-danger/80 transition-colors"
                                        >
                                            <FontAwesomeIcon icon={faTimes} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
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
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faUsers} />
                                    Create Group
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
