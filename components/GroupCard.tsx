'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faCalendar, faEllipsisV, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';
import { Group } from '@/types';
import { useState } from 'react';
import Link from 'next/link';

interface GroupCardProps {
    group: Group;
    onDelete: (groupId: string) => void;
}

export default function GroupCard({ group, onDelete }: GroupCardProps) {
    const [showMenu, setShowMenu] = useState(false);

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).format(date);
    };

    return (
        <Link href={`/groups/${group.id}`}>
            <div className="glass-card p-6 hover:scale-105 transition-all duration-300 relative group cursor-pointer">
                {/* Menu Button */}
                <div className="absolute top-4 right-4">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            setShowMenu(!showMenu);
                        }}
                        className="text-gray-400 hover:text-white transition-colors p-2"
                    >
                        <FontAwesomeIcon icon={faEllipsisV} />
                    </button>

                    {/* Dropdown Menu */}
                    {showMenu && (
                        <div className="absolute right-0 mt-2 w-48 glass-card py-2 z-10">
                            <Link
                                href={`/groups/${group.id}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMenu(false);
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-white/10 transition-colors flex items-center gap-3 block"
                            >
                                <FontAwesomeIcon icon={faEye} className="text-primary" />
                                View Details
                            </Link>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (confirm('Are you sure you want to delete this group?')) {
                                        onDelete(group.id);
                                    }
                                    setShowMenu(false);
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-white/10 transition-colors flex items-center gap-3"
                            >
                                <FontAwesomeIcon icon={faTrash} className="text-danger" />
                                Delete Group
                            </button>
                        </div>
                    )}
                </div>

                {/* Group Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center mb-4">
                    <FontAwesomeIcon icon={faUsers} className="text-2xl text-white" />
                </div>

                {/* Group Info */}
                <h3 className="text-xl font-bold mb-2">{group.name}</h3>

                {group.description && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{group.description}</p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faUsers} />
                        <span>{group.members.length} members</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faCalendar} />
                        <span>{formatDate(group.createdAt)}</span>
                    </div>
                </div>

                {/* Members Preview */}
                <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-gray-500 mb-2">Members:</p>
                    <div className="flex flex-wrap gap-2">
                        {group.members.slice(0, 3).map((member, index) => (
                            <span
                                key={member.id}
                                className="px-2 py-1 bg-white/5 rounded text-xs"
                            >
                                {member.name}
                            </span>
                        ))}
                        {group.members.length > 3 && (
                            <span className="px-2 py-1 bg-white/5 rounded text-xs">
                                +{group.members.length - 3} more
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
