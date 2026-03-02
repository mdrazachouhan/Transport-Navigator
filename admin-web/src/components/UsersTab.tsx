import React from 'react';
import { User } from '../types';
import { Search, Filter, ShieldCheck, Trash2, UserCheck, UserX } from 'lucide-react';

interface UsersTabProps {
    allUsers: User[];
    userFilter: string;
    setUserFilter: (filter: string) => void;
    userSearch: string;
    setUserSearch: (search: string) => void;
    viewUserDetail: (user: User) => void;
    approveUser: (id: string) => void;
    deleteUser: (id: string, name: string) => void;
}

export default function UsersTab({
    allUsers, userFilter, setUserFilter, userSearch, setUserSearch,
    viewUserDetail, approveUser, deleteUser
}: UsersTabProps) {
    const filteredUsers = allUsers
        .filter(u => userFilter === 'all' || u.role === userFilter)
        .filter(u => !userSearch || u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.phone.includes(userSearch));

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-admin-surface border border-admin-border p-5 rounded-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <h3 className="text-xl font-bold">Users</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text3" size={18} />
                        <input
                            className="bg-admin-bg border border-admin-border rounded-xl py-2 pl-10 pr-4 text-sm w-full sm:w-[300px] focus:border-admin-primary focus:ring-2 focus:ring-admin-primary/20 outline-none transition-all placeholder:text-admin-text3"
                            type="text"
                            placeholder="Search users..."
                            value={userSearch}
                            onChange={e => setUserSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2 p-1 bg-admin-bg rounded-xl border border-admin-border overflow-x-auto no-scrollbar">
                    {['all', 'customer', 'driver'].map(f => (
                        <button
                            key={f}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${userFilter === f ? 'bg-admin-primary text-white shadow-lg shadow-admin-primary/20' : 'text-admin-text3 hover:text-white hover:bg-white/5'}`}
                            onClick={() => setUserFilter(f)}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}s
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-admin-surface border border-admin-border rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02] text-admin-text3 text-[11px] font-bold uppercase tracking-wider">
                                <th className="p-4">Name</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Vehicle / Device</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Approved</th>
                                <th className="p-4 text-center">Rating</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-admin-border">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center text-admin-text3">No users found</td>
                                </tr>
                            ) : (
                                filteredUsers.map(u => (
                                    <tr
                                        key={u.id}
                                        className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                                        onClick={() => viewUserDetail(u)}
                                    >
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold">{u.name || 'Unnamed'}</span>
                                                <span className="text-xs text-admin-text3">{u.phone}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${u.role === 'driver' ? 'bg-admin-blue/10 text-admin-blue border border-admin-blue/20' : 'bg-admin-teal/10 text-admin-teal border border-admin-teal/20'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-xs text-admin-text2">
                                            {u.role === 'driver' ? (
                                                <div className="flex flex-col">
                                                    <span>{u.vehicleType || '-'}</span>
                                                    <span className="text-[10px] text-admin-text3 font-medium uppercase">{u.vehicleNumber || ''}</span>
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="p-4 text-xs">
                                            <div className="flex items-center gap-2 font-medium">
                                                <div className={`w-2 h-2 rounded-full ${u.isOnline ? 'bg-admin-green animate-pulse' : 'bg-white/20'}`}></div>
                                                <span className={u.isOnline ? 'text-admin-green' : 'text-admin-text3'}>{u.isOnline ? 'Active' : 'Offline'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {u.role === 'driver' ? (
                                                u.isApproved ?
                                                    <span className="text-admin-green flex items-center gap-1.5 text-xs font-bold"><ShieldCheck size={14} /> Yes</span> :
                                                    <span className="text-admin-yellow flex items-center gap-1.5 text-xs font-bold"><UserX size={14} /> Pending</span>
                                            ) : '-'}
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-admin-yellow/10 text-admin-yellow text-xs font-bold">
                                                <span>{u.rating?.toFixed(1) || 0}</span>
                                                <span className="text-[10px] pb-0.5">★</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2">
                                                {u.role === 'driver' && !u.isApproved && (
                                                    <button
                                                        className="p-2 rounded-lg bg-admin-green/10 text-admin-green hover:bg-admin-green hover:text-white transition-all shadow-lg shadow-admin-green/5"
                                                        onClick={() => approveUser(u.id)}
                                                        title="Approve Driver"
                                                    >
                                                        <UserCheck size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    className="p-2 rounded-lg bg-admin-red/10 text-admin-red hover:bg-admin-red hover:text-white transition-all shadow-lg shadow-admin-red/5"
                                                    onClick={() => deleteUser(u.id, u.name)}
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
