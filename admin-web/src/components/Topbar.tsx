import React from 'react';

interface TopbarProps {
    title: string;
    doLogout: () => void;
    onToggleSidebar: () => void;
}

export default function Topbar({ title, doLogout, onToggleSidebar }: TopbarProps) {
    return (
        <header className="h-[60px] border-b border-admin-border flex items-center justify-between px-4 lg:px-7 shrink-0 sticky top-0 z-40 bg-admin-bg/80 backdrop-blur-md">
            <div className="flex items-center gap-4">
                <button
                    className="lg:hidden p-1.5 rounded-lg bg-white/5 text-admin-text3 hover:text-white transition-colors"
                    onClick={onToggleSidebar}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
                <div className="text-lg font-bold flex items-center gap-2 text-admin-text">
                    {title}
                </div>
            </div>
            <div className="flex items-center gap-6">
                <span className="text-sm font-medium text-admin-text3 tabular-nums hidden sm:inline" id="topbarTime"></span>
                <button
                    className="bg-admin-red/10 text-admin-red border border-admin-red/20 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all hover:bg-admin-red hover:text-white"
                    onClick={doLogout}
                >
                    Logout
                </button>
            </div>
        </header>
    );
}
