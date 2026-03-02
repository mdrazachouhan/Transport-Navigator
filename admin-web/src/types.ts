export interface User {
    id: string;
    name: string;
    phone: string;
    role: 'customer' | 'driver';
    isOnline?: boolean;
    isApproved?: boolean;
    rating?: number;
    totalTrips?: number;
    totalEarnings?: number;
    vehicleType?: string;
    vehicleNumber?: string;
    licenseNumber?: string;
    createdAt: string;
    location?: { lat: number; lng: number };
}

export interface Booking {
    id: string;
    customerName: string;
    customerPhone: string;
    customerId: string;
    driverName?: string;
    driverPhone?: string;
    driverId?: string;
    pickup: { area: string; lat: number; lng: number };
    delivery: { area: string; lat: number; lng: number };
    vehicleType: string;
    driverVehicleNumber?: string;
    totalPrice: number;
    status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
    paymentMethod: string;
    otp?: string;
    rating?: number;
    ratingComment?: string;
    cancelReason?: string;
    createdAt: string;
    basePrice?: number;
    distanceCharge?: number;
    distance?: number;
    estimatedTime?: number;
    acceptedAt?: string;
    startedAt?: string;
    completedAt?: string;
    cancelledAt?: string;
}

export interface Vehicle {
    id: string;
    name: string;
    type: string;
    capacity: string;
    baseFare: number;
    perKmCharge: number;
    isActive: boolean;
}

export interface Stats {
    totalUsers: number;
    totalBookings: number;
    activeBookings: number;
    totalRevenue: number;
}

export interface Driver extends User { }
