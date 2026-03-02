import React from 'react';
import { User, Booking } from '../types';
import { X, Phone, Calendar, User as UserIcon, Shield, History, MapPin, Star, Clock } from 'lucide-react';

interface UserModalProps {
    user: User;
    userBookings: Booking[];
    loading: boolean;
    onClose: () => void;
    statusBadge: (status: string) => React.ReactNode;
}

export default function UserModal({ user, userBookings, loading, onClose, statusBadge }: UserModalProps) {
    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-admin-surface border border-admin-border rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-5 flex justify-between items-center border-b border-admin-border bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${user.role === 'driver' ? 'bg-admin-blue/10 text-admin-blue' : 'bg-admin-teal/10 text-admin-teal'}`}>
                            {user.role === 'driver' ? <Shield size={18} /> : <UserIcon size={18} />}
                        </div>
                        <h3 className="text-lg font-bold text-white capitalize">{user.role} Profile</h3>
                    </div>
                    <button
                        className="p-2 rounded-full hover:bg-white/10 text-admin-text3 hover:text-white transition-colors"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8">
                    <div className="flex flex-col md:flex-row gap-8 mb-10">
                        <div className="flex flex-col items-center gap-4 text-center md:text-left md:items-start md:border-r md:border-admin-border md:pr-12">
                            <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br flex items-center justify-center text-4xl font-black text-white shadow-xl ${user.role === 'driver' ? 'from-admin-primary/40 to-admin-purple/40 shadow-admin-primary/10' : 'from-admin-teal/40 to-admin-green/40 shadow-admin-teal/10'}`}>
                                {(user.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black text-white">{user.name || 'Unnamed'}</h3>
                                <div className="flex items-center justify-center md:justify-start gap-2 text-admin-text3 text-sm font-bold">
                                    <Phone size={14} />
                                    {user.phone}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 grid grid-cols-2 gap-6">
                            <StatCard label="Account Role" value={user.role} color={user.role === 'driver' ? 'blue' : 'teal'} />
                            <StatCard label="Rating" value={user.rating ? `${user.rating.toFixed(1)} ★` : '5.0 ★'} color="yellow" />
                            <StatCard label="Member Since" value={new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })} color="purple" icon={<Calendar size={12} />} />
                            <StatCard label="Total Ops" value={user.totalTrips || '0'} color="primary" />
                            {user.role === 'driver' && (
                                <>
                                    <StatCard label="Vehicle" value={user.vehicleType || '-'} color="teal" />
                                    <StatCard label="Number" value={user.vehicleNumber || '-'} color="teal" />
                                </>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 border-b border-admin-border pb-3">
                            <History size={18} className="text-admin-primary" />
                            <h4 className="text-sm font-black uppercase tracking-widest text-admin-text2">Transaction History</h4>
                        </div>

                        <div className="bg-admin-bg/30 rounded-2xl border border-admin-border overflow-hidden max-h-[300px] overflow-y-auto no-scrollbar">
                            {loading ? (
                                <div className="p-12 text-center text-admin-text3 flex flex-col items-center gap-4">
                                    <div className="w-8 h-8 border-4 border-admin-primary border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-xs font-bold uppercase tracking-widest">Retrieving node data...</span>
                                </div>
                            ) : userBookings.length === 0 ? (
                                <div className="p-12 text-center text-admin-text3">
                                    <p className="text-sm font-bold">No active history found in vault</p>
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="sticky top-0 bg-admin-surface border-b border-admin-border">
                                        <tr className="text-[10px] font-black text-admin-text3 uppercase tracking-widest">
                                            <th className="p-4">Timestamp</th>
                                            <th className="p-4">Vector</th>
                                            <th className="p-4">Volume</th>
                                            <th className="p-4 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-admin-border">
                                        {userBookings.map(b => (
                                            <tr key={b.id} className="text-xs group hover:bg-white/[0.02] transition-colors">
                                                <td className="p-4 font-bold text-admin-text3">{new Date(b.createdAt).toLocaleDateString()}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2 font-bold text-white max-w-[200px] truncate">
                                                        <span>{b.pickup?.area || 'OR'}</span>
                                                        <Clock size={12} className="opacity-30" />
                                                        <span>{b.delivery?.area || 'DS'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 font-black text-admin-green">₹{b.totalPrice}</td>
                                                <td className="p-4 text-right">{statusBadge(b.status)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, color, icon }: { label: string, value: string | number, color: string, icon?: React.ReactNode }) {
    const colors: any = {
        blue: 'text-admin-blue bg-admin-blue/5',
        teal: 'text-admin-teal bg-admin-teal/5',
        yellow: 'text-admin-yellow bg-admin-yellow/5',
        purple: 'text-admin-purple bg-admin-purple/5',
        primary: 'text-admin-primary bg-admin-primary/5',
    };
    return (
        <div className="bg-white/[0.02] border border-admin-border rounded-2xl p-4 transition-all hover:bg-white/[0.04]">
            <div className="text-[10px] font-black text-admin-text3 uppercase tracking-widest mb-1 pl-0.5">{label}</div>
            <div className={`text-sm font-black flex items-center gap-1.5 ${colors[color] || 'text-white'} px-2 py-0.5 rounded-lg w-fit`}>
                {icon}
                {value}
            </div>
        </div>
    );
}
