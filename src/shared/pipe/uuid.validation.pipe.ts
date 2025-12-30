import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { validateSync, IsUUID, IsNotEmpty } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class UUIDValidationPipe implements PipeTransform {
  transform(value: any) {
    class CheckUUID {
      @IsUUID()
      @IsNotEmpty()
      id: string;
    }

    const obj = plainToClass(CheckUUID, { id: value });
    const errors = validateSync(obj);

    if (errors.length > 0) {
      throw new BadRequestException('Validation failed: Invalid UUID');
    }

    return value;
  }
}
