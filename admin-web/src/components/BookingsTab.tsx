import React from 'react';
import { Booking } from '../types';
import { Search, MapPin, ArrowRight, Hash, Calendar, Shield } from 'lucide-react';

interface BookingsTabProps {
    allBookings: Booking[];
    bookingFilter: string;
    setBookingFilter: (filter: string) => void;
    bookingSearch: string;
    setBookingSearch: (search: string) => void;
    setSelectedBooking: (booking: Booking) => void;
    statusBadge: (status: string) => React.ReactNode;
}

export default function BookingsTab({
    allBookings, bookingFilter, setBookingFilter, bookingSearch, setBookingSearch,
    setSelectedBooking, statusBadge
}: BookingsTabProps) {
    const filteredBookings = allBookings
        .filter(b => bookingFilter === 'all' || b.status === bookingFilter)
        .filter(b => !bookingSearch || b.customerName?.toLowerCase().includes(bookingSearch.toLowerCase()) || b.id.includes(bookingSearch));

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-admin-surface border border-admin-border p-5 rounded-2xl shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <h3 className="text-xl font-bold text-white">Bookings</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text3" size={18} />
                        <input
                            className="bg-admin-bg border border-admin-border rounded-xl py-2 pl-10 pr-4 text-sm w-full sm:w-[320px] focus:border-admin-primary focus:ring-2 focus:ring-admin-primary/20 outline-none transition-all placeholder:text-admin-text3"
                            type="text"
                            placeholder="Search by ID or customer name..."
                            value={bookingSearch}
                            onChange={e => setBookingSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-1.5 p-1 bg-admin-bg rounded-xl border border-admin-border overflow-x-auto no-scrollbar max-w-full">
                    {['all', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'].map(f => (
                        <button key={f}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-all whitespace-nowrap ${bookingFilter === f ? 'bg-admin-primary text-white shadow-lg shadow-admin-primary/20' : 'text-admin-text3 hover:text-white hover:bg-white/5'}`}
                            onClick={() => setBookingFilter(f)}
                        >
                            {f.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-admin-surface border border-admin-border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02] text-admin-text3 text-[11px] font-bold uppercase tracking-wider">
                                <th className="p-4">Booking ID</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Route</th>
                                <th className="p-4">Driver / Vehicle</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-admin-border">
                            {filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center text-admin-text3">No records match your criteria</td>
                                </tr>
                            ) : (
                                filteredBookings.map(b => (
                                    <tr
                                        key={b.id}
                                        className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                                        onClick={() => setSelectedBooking(b)}
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Hash size={14} className="text-admin-primary opacity-60" />
                                                <span className="text-xs font-mono font-bold text-admin-primary">{b.id.slice(-8).toUpperCase()}</span>
                                            </div>
                                            <div className="text-[10px] text-admin-text3 mt-0.5 flex items-center gap-1.5 font-medium">
                                                <Calendar size={10} />
                                                {new Date(b.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold">{b.customerName}</span>
                                                <span className="text-[10px] text-admin-text3 font-medium uppercase">{b.customerPhone}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-xs font-bold max-w-[240px]">
                                                <span className="truncate">{b.pickup?.area || 'Origin'}</span>
                                                <ArrowRight size={14} className="text-admin-text3 shrink-0" />
                                                <span className="truncate">{b.delivery?.area || 'Destination'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold">{b.driverName || <span className="text-admin-yellow opacity-70">Unassigned</span>}</span>
                                                <span className="text-[10px] text-admin-text3 font-semibold uppercase">{b.vehicleType}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm font-bold text-admin-green">Rs. {b.totalPrice}</div>
                                        </td>
                                        <td className="p-4 text-center">
                                            {statusBadge(b.status)}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                className="p-2 rounded-lg bg-white/5 text-admin-text3 hover:bg-admin-primary hover:text-white transition-all"
                                                onClick={() => setSelectedBooking(b)}
                                            >
                                                <Search size={16} />
                                            </button>
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
