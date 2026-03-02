import React from 'react';
import { Driver } from '../types';
import { User, MapPin, Star, RefreshCw } from 'lucide-react';

interface DriversTabProps {
    liveDrivers: Driver[];
    loadDrivers: () => void;
}

export default function DriversTab({ liveDrivers, loadDrivers }: DriversTabProps) {
    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-admin-surface border border-admin-border p-5 rounded-2xl shadow-sm">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-3">
                        Live Tracking
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-widest bg-admin-green/10 text-admin-green border border-admin-green/20 animate-pulse">
                            {liveDrivers.length} Online
                        </span>
                    </h3>
                    <p className="text-xs text-admin-text3 font-medium mt-1">Real-time driver location and status monitor</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[10px] text-admin-text3 font-bold uppercase tracking-widest bg-white/5 px-2 py-1 rounded">Auto-refresh: 10s</span>
                    <button
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-admin-primary text-white text-sm font-bold shadow-lg shadow-admin-primary/20 hover:brightness-110 active:scale-95 transition-all"
                        onClick={loadDrivers}
                    >
                        <RefreshCw size={16} />
                        Sync Now
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {liveDrivers.length === 0 ? (
                    <div className="p-16 text-center text-admin-text3 col-span-full bg-admin-surface/50 border border-admin-border border-dashed rounded-3xl">
                        <User size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="font-bold">No active drivers currently detected</p>
                    </div>
                ) : (
                    liveDrivers.map(d => (
                        <div key={d.id} className="flex items-center gap-4 bg-admin-surface border border-admin-border rounded-2xl p-4 transition-all hover:border-admin-primary/30 hover:bg-white/[0.02] shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-admin-primary/20 to-admin-purple/20 border border-white/5 flex items-center justify-center font-black text-xl text-admin-text">
                                {d.name?.charAt(0).toUpperCase() || 'D'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold truncate text-white">{d.name || 'Driver'}</h4>
                                <p className="text-[10px] font-bold text-admin-text3 uppercase tracking-wider truncate mb-1">
                                    {d.vehicleType || 'Unknown'}
                                    {d.vehicleNumber ? ` \u2022 ${d.vehicleNumber}` : ''}
                                </p>
                                <div className="flex items-center gap-1.5 text-[10px] text-admin-teal font-bold truncate">
                                    <MapPin size={10} />
                                    <span>{d.location ? `${d.location.lat.toFixed(4)}, ${d.location.lng.toFixed(4)}` : 'Waitings for fix...'}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                                <div className="w-2.5 h-2.5 rounded-full bg-admin-green shadow-[0_0_8px_#10B981]"></div>
                                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-admin-yellow/10 text-admin-yellow text-[10px] font-bold">
                                    {d.rating ? d.rating.toFixed(1) : '5.0'}
                                    <Star size={10} fill="currentColor" />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
