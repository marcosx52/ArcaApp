import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseDecimalPipe implements PipeTransform {
  transform(value: unknown) {
    if (typeof value !== 'string' && typeof value !== 'number') {
      throw new BadRequestException('Decimal inválido');
    }
    if (Number.isNaN(Number(value))) {
      throw new BadRequestException('Decimal inválido');
    }
    return String(value);
  }
}
