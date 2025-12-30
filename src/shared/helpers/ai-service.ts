import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import logger from './logger';

@Injectable()
export class AIService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: process.env.AI_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.AI_TOKEN}`,
      },
    });
  }

  async getAIRecommendations(
    facility: string,
    speciality: string,
    certificate: string,
  ): Promise<any> {
    try {
      const response = await this.axiosInstance.get(
        `/v1/recommend/temp?facility=${facility}&speciality=${speciality}&certificate=${certificate}`,
      ); // Replace '/endpoint' with the correct endpoint
      return response.data;
    } catch (error) {
      logger.error(`${new Date().toLocaleString('es-CL')} ${error.message}`);
    }
  }
}
