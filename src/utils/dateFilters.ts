import { VehicleHistory } from '../types';
import { isWithinInterval, subDays, parseISO } from 'date-fns';

export const filterHistoryByDays = (history: VehicleHistory[], days: number) => {
  const now = new Date();
  const startDate = subDays(now, days);

  return history.filter((record) => {
    const checkoutDate = parseISO(record.checkoutTime);
    return isWithinInterval(checkoutDate, { start: startDate, end: now });
  });
};

export const filterLast24Hours = (history: VehicleHistory[]) => {
  return filterHistoryByDays(history, 1);
};