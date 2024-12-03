import React, { useState } from 'react';
import { Car, AlertCircle, User } from 'lucide-react';
import { Vehicle, Driver } from '../types';
import { useAuth } from '../context/AuthContext';

interface VehicleCardProps {
  vehicle: Vehicle;
  drivers: Driver[];
  onCheckout: (vehicleId: string, driverId: string) => void;
  onReturn: (vehicleId: string) => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  drivers,
  onCheckout,
  onReturn,
}) => {
  const { auth } = useAuth();
  const [selectedDriver, setSelectedDriver] = useState('');
  const isAdmin = auth?.user.role === 'admin';
  const isCurrentDriver = auth?.user.driverId === vehicle.currentDriver;
  const currentDriverName = drivers.find(d => d.id === vehicle.currentDriver)?.name;

  const handleCheckout = () => {
    const driverId = isAdmin ? selectedDriver : auth?.user.driverId!;
    onCheckout(vehicle.id, driverId);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Car className="w-6 h-6 mr-2 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold">{vehicle.id}</h3>
            <p className="text-gray-600">{vehicle.model}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full ${
          vehicle.isCheckedOut 
            ? 'bg-red-100 text-red-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {vehicle.isCheckedOut ? 'Em uso' : 'Disponível'}
        </div>
      </div>

      {!vehicle.isCheckedOut ? (
        <div className="space-y-4">
          {isAdmin && (
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-gray-600" />
              <select
                className="flex-1 p-2 border rounded-md"
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                required
              >
                <option value="">Selecione um motorista</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            onClick={handleCheckout}
            disabled={isAdmin && !selectedDriver}
          >
            Retirar Veículo
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center text-red-600">
            <AlertCircle className="w-5 h-5 mr-2" />
            <p>
              {isCurrentDriver
                ? 'Você está usando este veículo'
                : `Em uso por: ${currentDriverName}`}
            </p>
          </div>
          {(isCurrentDriver || isAdmin) && (
            <button
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
              onClick={() => onReturn(vehicle.id)}
            >
              Devolver Veículo
            </button>
          )}
        </div>
      )}
    </div>
  );
};