import React from 'react';
import { format } from 'date-fns';
import { VehicleHistory, Driver } from '../types';
import { History } from 'lucide-react';

interface VehicleHistoryProps {
  history: VehicleHistory[];
  drivers: Driver[];
  vehicleId: string;
}

export const VehicleHistoryList: React.FC<VehicleHistoryProps> = ({
  history,
  drivers,
  vehicleId,
}) => {
  const vehicleHistory = history.filter((h) => h.vehicleId === vehicleId);

  if (vehicleHistory.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-4">
        <div className="flex items-center justify-center text-gray-500">
          <History className="w-5 h-5 mr-2" />
          <span>Nenhum histórico disponível</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 bg-gray-50 p-4 rounded-md border border-gray-200">
      <div className="flex items-center mb-3">
        <History className="w-5 h-5 mr-2 text-blue-600" />
        <h4 className="text-lg font-semibold">Histórico de Uso</h4>
      </div>
      <div className="space-y-2">
        {vehicleHistory.map((record) => {
          const driver = drivers.find((d) => d.id === record.driverId);
          return (
            <div
              key={record.id}
              className="bg-white p-3 rounded-md border border-gray-200"
            >
              <p className="font-medium">{driver?.name}</p>
              <div className="text-sm text-gray-600">
                <p>
                  Retirada: {format(new Date(record.checkoutTime), 'dd/MM/yyyy HH:mm')}
                </p>
                {record.returnTime && (
                  <p>
                    Devolução: {format(new Date(record.returnTime), 'dd/MM/yyyy HH:mm')}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};