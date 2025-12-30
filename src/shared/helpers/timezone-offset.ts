import { find } from 'geo-tz';
import logger from './logger';

export function getTimezone(lat: number, lon: number): string | null {
  try {
    const [tz] = find(lat, lon); // returns array, we just need the first
    return tz;
  } catch (error) {
    logger.error(`${new Date().toLocaleString('es-CL')} ${error.message}`);
    return null;
  }
}
