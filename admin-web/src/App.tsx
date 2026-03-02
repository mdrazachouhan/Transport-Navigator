import React, { useState, useEffect } from 'react';
import { User, Booking, Vehicle, Driver, Stats } from './types';

// Components
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardTab from './components/DashboardTab';
import UsersTab from './components/UsersTab';
import BookingsTab from './components/BookingsTab';
import VehiclesTab from './components/VehiclesTab';
import DriversTab from './components/DriversTab';
import SettingsTab from './components/SettingsTab';
import BookingModal from './components/BookingModal';
import UserModal from './components/UserModal';

export default function App() {
    const [token, setToken] = useState<string | null>(null);
    const [adminUser, setAdminUser] = useState<any>(null);
    const [currentTab, setCurrentTab] = useState('dashboard');
    const [loading, setLoading] = useState(false);

    // Data States
    const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalBookings: 0, activeBookings: 0, totalRevenue: 0 });
    const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [liveDrivers, setLiveDrivers] = useState<Driver[]>([]);

    // Filter States
    const [userFilter, setUserFilter] = useState('all');
    const [userSearch, setUserSearch] = useState('');
    const [bookingFilter, setBookingFilter] = useState('all');
    const [bookingSearch, setBookingSearch] = useState('');

    // Modal States
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [userBookings, setUserBookings] = useState<Booking[]>([]);
    const [modalLoading, setModalLoading] = useState(false);

    // Login Form State
    const [loginPhone, setLoginPhone] = useState('9999999999');
    const [loginPassword, setLoginPassword] = useState('admin123');
    const [loginError, setLoginError] = useState('');

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // --- Effects ---

    useEffect(() => {
        if (typeof localStorage !== 'undefined') {
            const storedToken = localStorage.getItem('admin_token');
            if (storedToken) {
                setToken(storedToken);
            }
        }
    }, []);

    useEffect(() => {
        if (token) {
            loadAdminInfo();
            loadDashboard(); // Initial load

            const interval = setInterval(() => {
                const now = new Date();
                const timeEl = document.getElementById('topbarTime');
                if (timeEl) {
                    timeEl.textContent = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [token]);

    useEffect(() => {
        if (!token) return;

        if (currentTab === 'dashboard') loadDashboard();
        else if (currentTab === 'users') loadUsers();
        else if (currentTab === 'bookings') loadBookings();
        else if (currentTab === 'vehicles') loadVehicles();
        else if (currentTab === 'drivers') {
            loadDrivers();
            const interval = setInterval(loadDrivers, 10000);
            return () => clearInterval(interval);
        }
    }, [currentTab, token]);


    // --- API Helper ---
    // In production, this would be an environment variable
    const API_URL = window.location.origin; // Dynamically use the current server's URL

    async function apiCall(endpoint: string, options: RequestInit = {}) {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        };

        try {
            const res = await fetch(endpoint, { ...options, headers });

            if (res.status === 401) {
                doLogout();
                return null;
            }

            const text = await res.text();
            try {
                const data = JSON.parse(text);
                if (!res.ok) throw new Error(data.error || 'Request failed');
                return data;
            } catch (e) {
                console.error("API Error (Non-JSON):", text);
                const snippet = text.slice(0, 100);
                throw new Error(`Server returned non-JSON response from ${endpoint}: ${snippet}`);
            }
        } catch (e: any) {
            alert('Error: ' + e.message);
            return null;
        }
    }


    // --- Actions ---

    async function doLogin() {
        if (!loginPhone || !loginPassword) {
            setLoginError('Please fill in all fields');
            return;
        }
        setLoading(true);
        setLoginError('');

        try {
            const res = await fetch('/api/auth/admin-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: loginPhone, password: loginPassword })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Login failed');

            setToken(data.token);
            setAdminUser(data.user);
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('admin_token', data.token);
            }
        } catch (e: any) {
            setLoginError(e.message);
        } finally {
            setLoading(false);
        }
    }

    function doLogout() {
        setToken(null);
        setAdminUser(null);
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('admin_token');
        }
    }

    async function loadAdminInfo() {
        if (!adminUser) {
            const data = await apiCall('/api/users/me');
            if (data) setAdminUser(data.user);
        }
    }

    async function loadDashboard() {
        const statsData = await apiCall('/api/admin/stats');
        if (statsData) {
            setStats({
                totalUsers: statsData.totalUsers || 0,
                totalBookings: statsData.totalBookings || 0,
                activeBookings: statsData.activeBookings || 0,
                totalRevenue: statsData.totalRevenue || 0
            });
        }

        const bookingsData = await apiCall('/api/admin/bookings');
        if (bookingsData && bookingsData.bookings) {
            setRecentBookings(bookingsData.bookings.slice(0, 5));
        }
    }

    async function loadUsers() {
        setLoading(true);
        const data = await apiCall('/api/admin/users');
        setLoading(false);
        if (data) setAllUsers(data.users || []);
    }

    async function loadBookings() {
        setLoading(true);
        const data = await apiCall('/api/admin/bookings');
        setLoading(false);
        if (data) setAllBookings(data.bookings || []);
    }

    async function loadVehicles() {
        setLoading(true);
        const data = await apiCall('/api/admin/vehicles');
        setLoading(false);
        if (data) setVehicles(data.vehicles || []);
    }

    async function loadDrivers() {
        const data = await apiCall('/api/admin/drivers/online');
        if (data) setLiveDrivers(data.drivers || []);
    }

    async function approveUser(id: string) {
        const data = await apiCall(`/api/admin/users/${id}/approve`, { method: 'PUT' });
        if (data) {
            alert('User approved successfully');
            loadUsers();
            if (selectedUser && selectedUser.id === id) {
                setSelectedUser({ ...selectedUser, isApproved: true });
            }
        }
    }

    async function deleteUser(id: string, name: string) {
        if (!confirm(`Are you sure you want to delete user "${name}"?`)) return;
        const data = await apiCall(`/api/admin/users/${id}`, { method: 'DELETE' });
        if (data) {
            alert('User deleted successfully');
            loadUsers();
        }
    }

    async function approveAllPending() {
        let usersToApprove = allUsers;
        if (usersToApprove.length === 0) {
            const data = await apiCall('/api/admin/users');
            if (data) usersToApprove = data.users || [];
        }

        const pending = usersToApprove.filter(u => u.role === 'driver' && !u.isApproved);
        if (pending.length === 0) {
            alert('No pending drivers to approve');
            return;
        }

        let count = 0;
        for (const u of pending) {
            await apiCall(`/api/admin/users/${u.id}/approve`, { method: 'PUT' });
            count++;
        }
        alert(`Approved ${count} driver(s)`);
        loadUsers();
        if (currentTab === 'dashboard') loadDashboard();
    }

    async function saveVehicle(v: Vehicle) {
        const newBaseFare = (document.getElementById(`bf-${v.id}`) as HTMLInputElement)?.value;
        const newPerKm = (document.getElementById(`pk-${v.id}`) as HTMLInputElement)?.value;

        const data = await apiCall(`/api/admin/vehicles/${v.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                baseFare: parseFloat(newBaseFare),
                perKmCharge: parseFloat(newPerKm),
                isActive: v.isActive
            })
        });
        if (data) alert('Vehicle updated successfully');
    }

    async function toggleVehicle(id: string, isActive: boolean) {
        setVehicles(prev => prev.map(v => v.id === id ? { ...v, isActive } : v));
    }

    async function viewUserDetail(user: User) {
        setSelectedUser(user);
        setModalLoading(true);

        const bData = await apiCall('/api/admin/bookings');
        setModalLoading(false);

        if (bData && bData.bookings) {
            const userB = user.role === 'driver'
                ? bData.bookings.filter((b: Booking) => b.driverId === user.id)
                : bData.bookings.filter((b: Booking) => b.customerId === user.id);
            setUserBookings(userB);
        } else {
            setUserBookings([]);
        }
    }


    const statusBadge = (status: string) => {
        const map: any = { pending: 'bg-yellow-500/20 text-yellow-500', accepted: 'bg-blue-500/20 text-blue-500', in_progress: 'bg-purple-500/20 text-purple-500', completed: 'bg-green-500/20 text-green-500', cancelled: 'bg-red-500/20 text-red-500' };
        const labels: any = { pending: 'Pending', accepted: 'Accepted', in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled' };
        return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || 'bg-gray-500/20 text-gray-500'}`}>{labels[status] || status}</span>;
    };


    if (!token) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-900 font-sans p-4">
                <div className="bg-slate-800 p-10 rounded-2xl w-full max-w-[400px] text-center shadow-2xl border border-slate-700">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mx-auto mb-6 flex items-center justify-center text-2xl font-bold text-white shadow-lg">ML</div>
                    <h1 className="text-2xl font-bold mb-2 text-white">Admin Login</h1>
                    <p className="text-slate-400 mb-8 text-sm">My Load 24 Management Console</p>
                    {loginError ? <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg mb-5">{loginError}</div> : null}
                    <div className="mb-5 text-left">
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Phone Number</label>
                        <input className="w-full py-3 px-4 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-[15px] transition-all focus:border-blue-500 focus:outline-none placeholder:text-slate-600" type="text" value={loginPhone} onChange={e => setLoginPhone(e.target.value)} placeholder="Enter phone number" />
                    </div>
                    <div className="mb-6 text-left">
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Password</label>
                        <input className="w-full py-3 px-4 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-[15px] transition-all focus:border-blue-500 focus:outline-none placeholder:text-slate-600" type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="Enter password" />
                    </div>
                    <button className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold rounded-lg text-[15px] transition-all hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 disabled:opacity-70" onClick={doLogin} disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-900 min-h-screen text-white font-sans flex">
            <Sidebar
                currentTab={currentTab}
                setCurrentTab={setCurrentTab}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ml-0 lg:ml-[260px]">
                <Topbar
                    title={currentTab.charAt(0).toUpperCase() + currentTab.slice(1)}
                    doLogout={doLogout}
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                />

                <main className="flex-1 overflow-y-auto p-4 md:p-7">
                    {currentTab === 'dashboard' && (
                        <DashboardTab
                            stats={stats}
                            recentBookings={recentBookings}
                            loadDashboard={loadDashboard}
                            approveAllPending={approveAllPending}
                            statusBadge={statusBadge}
                        />
                    )}

                    {currentTab === 'users' && (
                        <UsersTab
                            allUsers={allUsers}
                            userFilter={userFilter}
                            setUserFilter={setUserFilter}
                            userSearch={userSearch}
                            setUserSearch={setUserSearch}
                            viewUserDetail={viewUserDetail}
                            approveUser={approveUser}
                            deleteUser={deleteUser}
                        />
                    )}

                    {currentTab === 'bookings' && (
                        <BookingsTab
                            allBookings={allBookings}
                            bookingFilter={bookingFilter}
                            setBookingFilter={setBookingFilter}
                            bookingSearch={bookingSearch}
                            setBookingSearch={setBookingSearch}
                            setSelectedBooking={setSelectedBooking}
                            statusBadge={statusBadge}
                        />
                    )}

                    {currentTab === 'vehicles' && (
                        <VehiclesTab
                            vehicles={vehicles}
                            loadVehicles={loadVehicles}
                            toggleVehicle={toggleVehicle}
                            saveVehicle={saveVehicle}
                        />
                    )}

                    {currentTab === 'drivers' && (
                        <DriversTab
                            liveDrivers={liveDrivers}
                            loadDrivers={loadDrivers}
                        />
                    )}

                    {currentTab === 'settings' && (
                        <SettingsTab adminUser={adminUser} />
                    )}
                </main>
            </div>

            {/* Modals */}
            {selectedBooking && (
                <BookingModal
                    booking={selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                    statusBadge={statusBadge}
                />
            )}

            {selectedUser && (
                <UserModal
                    user={selectedUser}
                    userBookings={userBookings}
                    loading={modalLoading}
                    onClose={() => setSelectedUser(null)}
                    statusBadge={statusBadge}
                />
            )}
        </div>
    );
}
