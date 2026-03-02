import React from 'react';

interface SidebarProps {
    currentTab: string;
    setCurrentTab: (tab: string) => void;
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ currentTab, setCurrentTab, isOpen, onClose }: SidebarProps) {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <rect x="3" y="3" width="7" height="7" rx="1" /> },
        { id: 'users', label: 'Users', icon: <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /> },
        { id: 'bookings', label: 'Bookings', icon: <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /> },
        { id: 'vehicles', label: 'Vehicles', icon: <rect x="1" y="3" width="15" height="13" rx="2" /> },
        { id: 'drivers', label: 'Live Drivers', icon: <circle cx="12" cy="12" r="10" /> },
        { id: 'settings', label: 'Settings', icon: <circle cx="12" cy="12" r="3" /> },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
                onClick={onClose}
            ></div>

            {/* Sidebar */}
            <aside className={`fixed left-0 top-0 bottom-0 w-[260px] bg-admin-surface border-r border-admin-border flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-5 flex items-center justify-between border-b border-admin-border h-[60px] shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 text-white bg-gradient-to-br from-admin-primary to-admin-purple">ML</div>
                        <span className="text-base font-bold whitespace-nowrap overflow-hidden text-admin-text">My Load 24</span>
                    </div>
                    <button className="lg:hidden text-admin-text3 hover:text-white transition-colors" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <nav className="flex-1 py-3 overflow-y-auto">
                    {menuItems.map(item => (
                        <div
                            key={item.id}
                            className={`flex items-center gap-3.5 px-5 py-2.5 text-sm font-medium cursor-pointer transition-all border-l-[3px] my-[1px]
                                ${currentTab === item.id
                                    ? 'text-admin-primary bg-admin-primary/10 border-admin-primary'
                                    : 'text-admin-text3 border-transparent hover:text-admin-text2 hover:bg-white/5'}`}
                            onClick={() => {
                                setCurrentTab(item.id);
                                if (window.innerWidth < 1024) onClose();
                            }}
                        >
                            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                {item.icon}
                            </svg>
                            <span className="whitespace-nowrap overflow-hidden">{item.label}</span>
                        </div>
                    ))}
                </nav>
                <div className="p-4 border-t border-admin-border shrink-0">
                    <a
                        href="/"
                        className="flex items-center gap-2.5 text-admin-text3 text-sm font-medium cursor-pointer transition-colors py-1.5 hover:text-admin-teal"
                    >
                        <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12,19 5,12 12,5" />
                        </svg>
                        <span>Back to Home</span>
                    </a>
                </div>
            </aside>
        </>
    );
}
