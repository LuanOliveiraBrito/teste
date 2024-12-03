import React, { useEffect, useState } from 'react';
import { Vehicle, Driver, VehicleHistory } from '../types';
import { VehicleCard } from '../components/VehicleCard';
import { VehicleHistoryList } from '../components/VehicleHistory';
import { getVehicles, getDrivers, getHistory, checkoutVehicle, returnVehicle } from '../services/api';
import { filterLast24Hours } from '../utils/dateFilters';

export const HomePage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [history, setHistory] = useState<VehicleHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [vehiclesRes, driversRes, historyRes] = await Promise.all([
        getVehicles(),
        getDrivers(),
        getHistory()
      ]);

      setVehicles(vehiclesRes.data);
      setDrivers(driversRes.data);
      setHistory(historyRes.data);
      setError('');
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckout = async (vehicleId: string, driverId: string) => {
    try {
      await checkoutVehicle(vehicleId, driverId);
      await fetchData();
      setError('');
    } catch (error: any) {
      console.error('Error checking out vehicle:', error);
      setError(error.response?.data?.error || 'Erro ao retirar veículo');
    }
  };

  const handleReturn = async (vehicleId: string) => {
    try {
      await returnVehicle(vehicleId);
      await fetchData();
      setError('');
    } catch (error: any) {
      console.error('Error returning vehicle:', error);
      setError(error.response?.data?.error || 'Erro ao devolver veículo');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <div className="grid gap-6">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id}>
            <VehicleCard
              vehicle={vehicle}
              drivers={drivers}
              onCheckout={handleCheckout}
              onReturn={handleReturn}
            />
            <VehicleHistoryList
              history={filterLast24Hours(history)}
              drivers={drivers}
              vehicleId={vehicle.id}
            />
          </div>
        ))}
      </div>
    </div>
  );
};