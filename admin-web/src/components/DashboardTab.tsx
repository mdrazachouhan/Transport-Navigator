import React, { useEffect, useState } from 'react';
import { Stats, Booking } from '../types';
import {
    Users,
    CalendarCheck,
    Clock,
    Banknote,
    CheckCircle,
    RefreshCw,
    BarChart3
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface DashboardTabProps {
    stats: Stats;
    recentBookings: Booking[];
    loadDashboard: () => void;
    approveAllPending: () => void;
    statusBadge: (status: string) => React.ReactNode;
}

export default function DashboardTab({ stats, recentBookings, loadDashboard, approveAllPending, statusBadge }: DashboardTabProps) {
    const counts = { pending: 0, accepted: 0, in_progress: 0, completed: 0, cancelled: 0 };
    recentBookings.forEach(b => {
        if (counts.hasOwnProperty(b.status)) {
            (counts as any)[b.status]++;
        }
    });

    const chartData = {
        labels: ['Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled'],
        datasets: [{
            label: 'Bookings',
            data: [counts.pending, counts.accepted, counts.in_progress, counts.completed, counts.cancelled],
            backgroundColor: [
                'rgba(245, 158, 11, 0.5)',
                'rgba(59, 130, 246, 0.5)',
                'rgba(139, 92, 246, 0.5)',
                'rgba(16, 185, 129, 0.5)',
                'rgba(239, 68, 68, 0.5)'
            ],
            borderColor: ['#F59E0B', '#3B82F6', '#8B5CF6', '#10B981', '#EF4444'],
            borderWidth: 1,
            borderRadius: 6,
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: 'rgba(255, 255, 255, 0.5)', stepSize: 1 }
            },
            x: {
                grid: { display: false },
                ticks: { color: 'rgba(255, 255, 255, 0.5)' }
            }
        }
    };

    return (
        <div className="animate-fade-in space-y-7">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-admin-primary', bg: 'bg-admin-primary/10' },
                    { label: 'Total Bookings', value: stats.totalBookings, icon: CalendarCheck, color: 'text-admin-teal', bg: 'bg-admin-teal/10' },
                    { label: 'Active Bookings', value: stats.activeBookings, icon: Clock, color: 'text-admin-purple', bg: 'bg-admin-purple/10' },
                    { label: 'Total Revenue', value: `Rs. ${stats.totalRevenue.toLocaleString()}`, icon: Banknote, color: 'text-admin-green', bg: 'bg-admin-green/10' },
                ].map((stat, i) => (
                    <div key={i} className="bg-admin-surface border border-admin-border rounded-2xl p-6 transition-all hover:border-admin-border2">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.bg} ${stat.color}`}>
                            <stat.icon size={22} />
                        </div>
                        <div className="text-sm text-admin-text3 font-medium mb-1">{stat.label}</div>
                        <div className={`text-2xl font-bold tabular-nums ${stat.color}`}>{stat.value}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Bookings */}
                <div className="lg:col-span-2 bg-admin-surface border border-admin-border rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-admin-text">Recent Bookings</h3>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-admin-primary/10 text-admin-primary">
                            {recentBookings.length} Total
                        </span>
                    </div>
                    {recentBookings.length === 0 ? (
                        <div className="py-12 text-center text-admin-text3">No bookings yet</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-admin-text3 text-xs uppercase tracking-wider">
                                        <th className="pb-4 font-semibold">Customer</th>
                                        <th className="pb-4 font-semibold">Vehicle</th>
                                        <th className="pb-4 font-semibold">Price</th>
                                        <th className="pb-4 font-semibold">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-admin-border">
                                    {recentBookings.map(b => (
                                        <tr key={b.id} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="py-4 text-sm font-medium">{b.customerName}</td>
                                            <td className="py-4 text-sm text-admin-text2">{b.vehicleType}</td>
                                            <td className="py-4 text-sm font-semibold">Rs. {b.totalPrice}</td>
                                            <td className="py-4 text-sm">{statusBadge(b.status)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="bg-admin-surface border border-admin-border rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-admin-text mb-6">Quick Actions</h3>
                    <div className="space-y-3">
                        <button
                            className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/5 text-sm font-semibold transition-all hover:bg-white/10 text-left border border-white/5 active:scale-[0.98]"
                            onClick={approveAllPending}
                        >
                            <CheckCircle size={20} className="text-admin-green" />
                            Approve All Drivers
                        </button>
                        <button
                            className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/5 text-sm font-semibold transition-all hover:bg-white/10 text-left border border-white/5 active:scale-[0.98]"
                            onClick={loadDashboard}
                        >
                            <RefreshCw size={20} className="text-admin-primary" />
                            Refresh Stats
                        </button>
                    </div>
                </div>
            </div>

            {/* Distribution Chart */}
            <div className="bg-admin-surface border border-admin-border rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-admin-purple/10 text-admin-purple">
                        <BarChart3 size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-admin-text">Booking Distribution</h3>
                </div>
                <div className="h-[300px]">
                    <Bar data={chartData} options={chartOptions} />
                </div>
            </div>
        </div>
    );
}
