import React from 'react';
import { ShieldCheck, Info, User, Phone, Globe, Cpu } from 'lucide-react';

interface SettingsTabProps {
    adminUser: any;
}

export default function SettingsTab({ adminUser }: SettingsTabProps) {
    const infoItems = [
        { label: 'Admin Name', value: adminUser?.name || 'Authorized Administrator', icon: User },
        { label: 'Registered Phone', value: adminUser?.phone || 'Loading...', icon: Phone },
        { label: 'System Platform', value: 'My Load 24 - Core', icon: Globe },
        { label: 'Software Version', value: 'v1.0.0 (Web Console)', icon: Cpu },
        { label: 'Security Level', value: 'Level 10 (Encrypted)', icon: ShieldCheck },
    ];

    return (
        <div className="animate-fade-in flex items-center justify-center p-4">
            <div className="w-full max-w-xl">
                <div className="bg-admin-surface border border-admin-border rounded-3xl overflow-hidden shadow-2xl">
                    <div className="bg-gradient-to-r from-admin-primary/10 to-admin-purple/10 p-8 border-b border-admin-border text-center">
                        <div className="w-20 h-20 bg-admin-surface rounded-3xl mx-auto mb-4 border border-admin-border flex items-center justify-center shadow-inner">
                            <ShieldCheck size={40} className="text-admin-primary" />
                        </div>
                        <h3 className="text-2xl font-black text-white">System Profile</h3>
                        <p className="text-admin-text3 text-sm font-medium mt-1">Operational Environment & Access Details</p>
                    </div>

                    <div className="p-6 divide-y divide-admin-border">
                        {infoItems.map((item, i) => (
                            <div key={i} className="flex items-center justify-between py-5 group transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-lg bg-white/5 text-admin-text3 group-hover:text-admin-primary transition-colors">
                                        <item.icon size={18} />
                                    </div>
                                    <span className="text-sm font-bold text-admin-text3 uppercase tracking-widest">{item.label}</span>
                                </div>
                                <span className="text-sm font-black text-white">{item.value}</span>
                            </div>
                        ))}
                    </div>

                    <div className="p-8 bg-white/[0.02] border-t border-admin-border text-center">
                        <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-admin-text3">
                            <Info size={12} className="text-admin-teal" />
                            Node Operational Status: Optimal
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
