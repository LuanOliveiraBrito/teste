export interface Vehicle {
  id: string;
  model: string;
  isCheckedOut: boolean;
  currentDriver: string | null;
}

export interface Driver {
  id: string;
  name: string;
  department: string;
}

export interface VehicleHistory {
  id: number;
  vehicleId: string;
  driverId: string;
  checkoutTime: string;
  returnTime: string | null;
  vehicleModel?: string;
  driverName?: string;
  driverDepartment?: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'driver';
  driverId?: string;
  driverName?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    role: string;
    driverId?: string;
    driverName?: string;
  };
}