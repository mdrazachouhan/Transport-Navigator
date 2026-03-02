import React from 'react';
import { Booking } from '../types';
import { X, Hash, User, Phone, MapPin, ArrowRight, CreditCard, Clock } from 'lucide-react';

interface BookingModalProps {
    booking: Booking;
    onClose: () => void;
    statusBadge: (status: string) => React.ReactNode;
}

export default function BookingModal({ booking, onClose, statusBadge }: BookingModalProps) {
    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 transition-all animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-admin-surface border border-admin-border rounded-3xl w-full max-w-[500px] overflow-hidden shadow-2xl animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-5 flex justify-between items-center border-b border-admin-border bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-admin-primary/10 text-admin-primary">
                            <Hash size={18} />
                        </div>
                        <h3 className="text-lg font-bold text-white">Booking Details</h3>
                    </div>
                    <button
                        className="p-2 rounded-full hover:bg-white/10 text-admin-text3 hover:text-white transition-colors"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-8">
                        <div className="space-y-1">
                            <div className="text-[10px] text-admin-text3 uppercase font-black tracking-widest pl-0.5">Booking ID</div>
                            <div className="text-sm font-bold font-mono text-admin-primary">{booking.id}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-[10px] text-admin-text3 uppercase font-black tracking-widest pl-0.5">Status</div>
                            <div className="inline-block">{statusBadge(booking.status)}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-[10px] text-admin-text3 uppercase font-black tracking-widest pl-0.5">Customer</div>
                            <div className="flex items-center gap-2">
                                <User size={14} className="text-admin-text3" />
                                <span className="text-sm font-bold text-white">{booking.customerName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-admin-text3 font-medium pl-5">
                                <Phone size={10} />
                                {booking.customerPhone}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-[10px] text-admin-text3 uppercase font-black tracking-widest pl-0.5">Driver</div>
                            <div className="flex items-center gap-2">
                                <Shield size={14} className="text-admin-text3" />
                                <span className="text-sm font-bold text-white">{booking.driverName || 'Looking for driver...'}</span>
                            </div>
                            {booking.driverPhone && (
                                <div className="flex items-center gap-2 text-xs text-admin-text3 font-medium pl-5">
                                    <Phone size={10} />
                                    {booking.driverPhone}
                                </div>
                            )}
                        </div>
                        <div className="col-span-2 space-y-2">
                            <div className="text-[10px] text-admin-text3 uppercase font-black tracking-widest pl-0.5">Route Information</div>
                            <div className="bg-admin-bg/50 border border-admin-border p-4 rounded-xl flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <MapPin size={16} className="text-admin-primary shrink-0" />
                                    <span className="text-sm font-bold truncate">{booking.pickup?.area || 'Origin'}</span>
                                </div>
                                <ArrowRight size={16} className="text-admin-text3 shrink-0" />
                                <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
                                    <span className="text-sm font-bold truncate">{booking.delivery?.area || 'Destination'}</span>
                                    <MapPin size={16} className="text-admin-teal shrink-0" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-[10px] text-admin-text3 uppercase font-black tracking-widest pl-0.5">Service Type</div>
                            <div className="flex items-center gap-2 text-sm font-bold text-white uppercase italic tracking-widest">
                                <Truck size={14} className="text-admin-purple" />
                                {booking.vehicleType}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-[10px] text-admin-text3 uppercase font-black tracking-widest pl-0.5">Payment Amount</div>
                            <div className="text-xl font-black text-admin-green drop-shadow-sm">₹{booking.totalPrice}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Minimal missing component for the Truck icon used above
function Truck({ size, className }: { size: number, className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
            <path d="M16 8h4l3 3v5h-7V8z" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
    );
}

function Shield({ size, className }: { size: number, className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    );
}
