import React from 'react';
import { Vehicle } from '../types';
import { Truck, Info, Settings2, ShieldCheck, ShieldAlert, RefreshCcw, Save } from 'lucide-react';

interface VehiclesTabProps {
    vehicles: Vehicle[];
    loadVehicles: () => void;
    toggleVehicle: (id: string, isActive: boolean) => void;
    saveVehicle: (vehicle: Vehicle) => void;
}

export default function VehiclesTab({ vehicles, loadVehicles, toggleVehicle, saveVehicle }: VehiclesTabProps) {
    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-admin-surface border border-admin-border p-5 rounded-2xl">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-admin-primary/10 text-admin-primary">
                        <Truck size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Vehicle Management</h3>
                        <p className="text-xs text-admin-text3 font-medium">Configure pricing and availability for vehicle types</p>
                    </div>
                </div>
                <button
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-sm font-extrabold text-admin-text3 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                    onClick={loadVehicles}
                >
                    <RefreshCcw size={16} />
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {vehicles.map(v => (
                    <div key={v.id} className="bg-admin-surface border border-admin-border rounded-2xl p-6 transition-all hover:border-admin-border2 hover:shadow-2xl hover:shadow-admin-primary/5 group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold group-hover:text-admin-primary transition-colors">{v.name}</h3>
                                <div className="inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-white/5 text-admin-text3 border border-white/5">{v.type}</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={v.isActive} onChange={e => toggleVehicle(v.id, e.target.checked)} />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
                            </label>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-bold text-admin-text3 mb-6 bg-white/5 py-2 px-3 rounded-xl border border-white/5 w-fit">
                            <Info size={14} className="text-admin-primary" />
                            Capacity: {v.capacity}
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="relative">
                                <label className="block text-[10px] font-black text-admin-text3 mb-2 uppercase tracking-widest pl-1">Base Price (INR)</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text3 text-sm font-bold">₹</div>
                                    <input
                                        className="w-full py-3 pl-8 pr-4 bg-admin-bg border border-admin-border rounded-xl text-white text-sm font-bold focus:border-admin-primary focus:ring-2 focus:ring-admin-primary/20 outline-none transition-all"
                                        type="number"
                                        id={`bf-${v.id}`}
                                        defaultValue={v.baseFare}
                                        min="0"
                                    />
                                </div>
                            </div>
                            <div className="relative">
                                <label className="block text-[10px] font-black text-admin-text3 mb-2 uppercase tracking-widest pl-1">Per KM Rate (INR)</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text3 text-sm font-bold">₹</div>
                                    <input
                                        className="w-full py-3 pl-8 pr-4 bg-admin-bg border border-admin-border rounded-xl text-white text-sm font-bold focus:border-admin-primary focus:ring-2 focus:ring-admin-primary/20 outline-none transition-all"
                                        type="number"
                                        id={`pk-${v.id}`}
                                        defaultValue={v.perKmCharge}
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            className="w-full flex items-center justify-center gap-2 py-3.5 bg-admin-primary/10 text-admin-primary rounded-xl text-sm font-bold hover:bg-admin-primary hover:text-white transition-all shadow-lg shadow-admin-primary/5 active:scale-[0.98]"
                            onClick={() => saveVehicle(v)}
                        >
                            <Save size={18} />
                            Update Settings
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
