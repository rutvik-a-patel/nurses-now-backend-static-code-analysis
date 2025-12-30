import { Module } from '@nestjs/common';
import { ProviderEvaluationsService } from './provider-evaluations.service';
import { ProviderEvaluationsController } from './provider-evaluations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluationResponse } from './entities/evaluation-response.entity';
import { ProviderEvaluation } from './entities/provider-evaluation.entity';
import { FacilityProvider } from '@/facility-provider/entities/facility-provider.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EvaluationResponse,
      ProviderEvaluation,
      FacilityProvider,
    ]),
  ],
  controllers: [ProviderEvaluationsController],
  providers: [ProviderEvaluationsService],
})
export class ProviderEvaluationsModule {}
