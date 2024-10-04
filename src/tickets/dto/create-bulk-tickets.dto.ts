import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { CreateTicketDto } from './create-ticket.dto';

export class CreateBulkTicketsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => CreateTicketDto)
  tickets: CreateTicketDto[];
}
