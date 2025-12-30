import { CreateDisbursement, CreateEmployee } from '@/shared/constants/types';
import logger from '@/shared/helpers/logger';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class BranchAppService {
  private axiosInstance: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    this.axiosInstance = axios.create({
      baseURL: this.configService.get<string>('BRANCH_API_BASE_URL'),
      headers: {
        'Content-Type': 'application/json',
        apikey: this.configService.get<string>('BRANCH_API_KEY'),
      },
    });
  }

  async createEmployee(id: string, createEmployee: CreateEmployee) {
    try {
      const orgId = this.configService.get<string>('BRANCH_ORG_ID');

      const response: any = await this.axiosInstance.post(
        `/v1/organizations/${orgId}/employees/${id}`,
        createEmployee,
      );

      if (response.status === HttpStatus.BAD_REQUEST) {
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      logger.error(
        `${new Date().toLocaleString('es-CL')} Branch Error: ${error.message}`,
      );
    }
  }

  async updateEmployee(id: string, updateEmployee: Partial<CreateEmployee>) {
    try {
      const orgId = this.configService.get<string>('BRANCH_ORG_ID');

      const response: any = await this.axiosInstance.put(
        `/v1/organizations/${orgId}/employees/${id}`,
        updateEmployee,
      );

      if (response.status === HttpStatus.BAD_REQUEST) {
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      logger.error(
        `${new Date().toLocaleString('es-CL')} Branch Error: ${error.message}`,
      );
    }
  }

  async getEmployeeDetails(id: string) {
    try {
      const orgId = this.configService.get<string>('BRANCH_ORG_ID');

      const response: any = await this.axiosInstance.get(
        `/v1/organizations/${orgId}/employees/${id}`,
      );

      if (response.status === HttpStatus.BAD_REQUEST) {
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      logger.error(
        `${new Date().toLocaleString('es-CL')} Branch Error: ${error.message}`,
      );
    }
  }

  async createDisburement(id: string, createDisbursement: CreateDisbursement) {
    try {
      const orgId = this.configService.get<string>('BRANCH_ORG_ID');

      const response: any = await this.axiosInstance.post(
        `v2/organizations/${orgId}/workers/${id}/disbursements`,
        createDisbursement,
      );

      if (response.status === HttpStatus.BAD_REQUEST) {
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      logger.error(
        `${new Date().toLocaleString('es-CL')} Branch Error: ${error.message}`,
      );
    }
  }
}
