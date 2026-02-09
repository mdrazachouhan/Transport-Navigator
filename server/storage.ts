import * as crypto from 'crypto';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: 'customer' | 'driver' | 'admin';
  password?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  licenseNumber?: string;
  isOnline?: boolean;
  isApproved?: boolean;
  rating?: number;
  totalTrips?: number;
  totalEarnings?: number;
  location?: { lat: number; lng: number };
  createdAt: string;
}

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverVehicleNumber?: string;
  pickup: { name: string; area: string; lat: number; lng: number };
  delivery: { name: string; area: string; lat: number; lng: number };
  vehicleType: string;
  distance: number;
  basePrice: number;
  distanceCharge: number;
  totalPrice: number;
  estimatedTime: number;
  paymentMethod: 'cash' | 'upi';
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  otp: string;
  rating?: number;
  ratingComment?: string;
  cancelReason?: string;
  createdAt: string;
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
}

export interface VehiclePricing {
  id: string;
  type: string;
  name: string;
  baseFare: number;
  perKmCharge: number;
  capacity: string;
  icon: string;
  isActive: boolean;
}

export interface OtpRecord {
  phone: string;
  otp: string;
  expiresAt: number;
  verified: boolean;
}

const defaultVehicles: VehiclePricing[] = [
  { id: '1', type: 'auto', name: 'Auto', baseFare: 50, perKmCharge: 12, capacity: 'Up to 200kg', icon: 'rickshaw', isActive: true },
  { id: '2', type: 'tempo', name: 'Tempo', baseFare: 150, perKmCharge: 18, capacity: 'Up to 1000kg', icon: 'van-utility', isActive: true },
  { id: '3', type: 'truck', name: 'Truck', baseFare: 300, perKmCharge: 25, capacity: '1000kg+', icon: 'truck', isActive: true },
];

const defaultAdmin: User = {
  id: 'admin-1',
  name: 'Admin',
  phone: '9999999999',
  role: 'admin',
  password: 'admin123',
  createdAt: new Date().toISOString(),
};

class InMemoryStorage {
  private users: Map<string, User> = new Map();
  private bookings: Map<string, Booking> = new Map();
  private vehicles: Map<string, VehiclePricing> = new Map();
  private otps: Map<string, OtpRecord> = new Map();

  constructor() {
    this.users.set(defaultAdmin.id, defaultAdmin);
    defaultVehicles.forEach(v => this.vehicles.set(v.id, v));
  }

  generateId(): string {
    return crypto.randomUUID();
  }

  createUser(data: Omit<User, 'id' | 'createdAt'>): User {
    const user: User = { ...data, id: this.generateId(), createdAt: new Date().toISOString() };
    this.users.set(user.id, user);
    return user;
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserByPhone(phone: string): User | undefined {
    return Array.from(this.users.values()).find(u => u.phone === phone);
  }

  getUsersByRole(role: string): User[] {
    return Array.from(this.users.values()).filter(u => u.role === role);
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  updateUser(id: string, data: Partial<User>): User | undefined {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...data };
    this.users.set(id, updated);
    return updated;
  }

  deleteUser(id: string): boolean {
    return this.users.delete(id);
  }

  getOnlineDrivers(vehicleType?: string): User[] {
    return Array.from(this.users.values()).filter(u =>
      u.role === 'driver' && u.isOnline && u.isApproved !== false &&
      (!vehicleType || u.vehicleType === vehicleType)
    );
  }

  createBooking(data: Omit<Booking, 'id' | 'createdAt'>): Booking {
    const booking: Booking = { ...data, id: this.generateId(), createdAt: new Date().toISOString() };
    this.bookings.set(booking.id, booking);
    return booking;
  }

  getBookingById(id: string): Booking | undefined {
    return this.bookings.get(id);
  }

  getBookingsByCustomer(customerId: string): Booking[] {
    return Array.from(this.bookings.values())
      .filter(b => b.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getBookingsByDriver(driverId: string): Booking[] {
    return Array.from(this.bookings.values())
      .filter(b => b.driverId === driverId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getPendingBookings(vehicleType?: string): Booking[] {
    return Array.from(this.bookings.values())
      .filter(b => b.status === 'pending' && (!vehicleType || b.vehicleType === vehicleType));
  }

  getAllBookings(): Booking[] {
    return Array.from(this.bookings.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  updateBooking(id: string, data: Partial<Booking>): Booking | undefined {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    const updated = { ...booking, ...data };
    this.bookings.set(id, updated);
    return updated;
  }

  getVehicles(): VehiclePricing[] {
    return Array.from(this.vehicles.values());
  }

  getVehicleByType(type: string): VehiclePricing | undefined {
    return Array.from(this.vehicles.values()).find(v => v.type === type);
  }

  updateVehicle(id: string, data: Partial<VehiclePricing>): VehiclePricing | undefined {
    const vehicle = this.vehicles.get(id);
    if (!vehicle) return undefined;
    const updated = { ...vehicle, ...data };
    this.vehicles.set(id, updated);
    return updated;
  }

  saveOtp(phone: string, otp: string): void {
    this.otps.set(phone, { phone, otp, expiresAt: Date.now() + 5 * 60 * 1000, verified: false });
  }

  verifyOtp(phone: string, otp: string): boolean {
    const record = this.otps.get(phone);
    if (!record) return false;
    if (Date.now() > record.expiresAt) return false;
    if (record.otp !== otp) return false;
    record.verified = true;
    this.otps.set(phone, record);
    return true;
  }

  getStats() {
    const allBookings = this.getAllBookings();
    const users = this.getAllUsers();
    return {
      totalUsers: users.filter(u => u.role !== 'admin').length,
      totalCustomers: users.filter(u => u.role === 'customer').length,
      totalDrivers: users.filter(u => u.role === 'driver').length,
      onlineDrivers: users.filter(u => u.role === 'driver' && u.isOnline).length,
      totalBookings: allBookings.length,
      completedBookings: allBookings.filter(b => b.status === 'completed').length,
      activeBookings: allBookings.filter(b => ['pending', 'accepted', 'in_progress'].includes(b.status)).length,
      cancelledBookings: allBookings.filter(b => b.status === 'cancelled').length,
      totalRevenue: allBookings.filter(b => b.status === 'completed').reduce((s, b) => s + b.totalPrice, 0),
    };
  }
}

export const storage = new InMemoryStorage();
