import { IsOptional, IsArray, IsDateString, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class FilterTicketsDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((v) => parseInt(v.trim(), 10));
    }
    if (Array.isArray(value)) {
      return value.map((v) => parseInt(v, 10));
    }
    return [parseInt(value, 10)];
  })
  @IsArray()
  @IsNumber({}, { each: true })
  siteIds?: number[];

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
