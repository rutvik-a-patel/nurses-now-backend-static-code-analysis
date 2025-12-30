import { Injectable } from '@nestjs/common';
import axios from 'axios';
import logger from './logger';

@Injectable()
export class DistanceMatrixService {
  constructor() {}

  async getDistanceAndETA(
    providerLat: number,
    providerLng: number,
    facilityLat: number,
    facilityLng: number,
    distanceDuration: number,
  ): Promise<any> {
    const url = `${process.env.GOOGLE_MAPS_URL}?origins=${providerLat},${providerLng}&destinations=${facilityLat},${facilityLng}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    try {
      const response = await axios.get(url);
      const data = response.data;

      if (data.rows.length > 0 && data.rows[0].elements.length > 0) {
        const distanceData = data.rows[0].elements[0];

        if (distanceData.status === 'OK') {
          const durationInSeconds = distanceData.duration.value; // Duration in seconds
          const durationInMinutes = durationInSeconds / 60;

          if (durationInMinutes >= distanceDuration) {
            return true;
          }
        }
        return false;
      }
      return false;
    } catch (error) {
      logger.error(`${new Date().toLocaleString('es-CL')} ${error.message}`);
    }
  }
}
