import { Controller } from '@nestjs/common';
import { DisbursementService } from './disbursement.service';

@Controller('disbursement')
export class DisbursementController {
  constructor(private readonly disbursementService: DisbursementService) {}
}
