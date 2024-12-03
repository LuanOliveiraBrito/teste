import axios from 'axios';
import { Vehicle, Driver, VehicleHistory, AuthResponse, User } from '../types';

const baseURL = import.meta.env.PROD 
  ? 'https://your-render-app.onrender.com/api'  // This will be updated after deploying to Render
  : '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const auth = localStorage.getItem('auth');
  if (auth) {
    const { token } = JSON.parse(auth);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (username: string, password: string) => 
  api.post<AuthResponse>('/auth/login', { username, password });

export const createUser = (userData: Partial<User>) => 
  api.post<User>('/auth/users', userData);

export const deleteUser = (userId: string) => 
  api.delete(`/auth/users/${userId}`);

export const getUsers = () => 
  api.get<User[]>('/auth/users');

export const getVehicles = () => api.get<Vehicle[]>('/vehicles');
export const getDrivers = () => api.get<Driver[]>('/drivers');
export const getHistory = () => api.get<VehicleHistory[]>('/history');

export const checkoutVehicle = async (vehicleId: string, driverId: string) => {
  return api.post('/vehicles/checkout', { vehicleId, driverId });
};

export const returnVehicle = async (vehicleId: string) => {
  return api.post('/vehicles/return', { vehicleId });
};