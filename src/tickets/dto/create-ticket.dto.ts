import { IsNotEmpty, IsDateString, IsNumber, IsEnum } from 'class-validator';
import { Material } from 'src/tickets/enums/material.enum';
import { IsNotInFuture } from 'src/validators/is-not-in-future.decorator';

export class CreateTicketDto {
  @IsNotEmpty()
  @IsNumber()
  siteId: number;

  @IsNotEmpty()
  @IsNumber()
  truckId: number;

  @IsNotEmpty()
  @IsDateString()
  @IsNotInFuture()
  dispatchedAt: string;

  @IsEnum(Material)
  material: Material = Material.SOIL;
}
