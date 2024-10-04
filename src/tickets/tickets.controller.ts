import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateBulkTicketsDto } from './dto/create-bulk-tickets.dto';
import { FilterTicketsDto } from './dto/filter-tickets.dto';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post('bulk')
  createBulk(@Body() createBulkTicketsDto: CreateBulkTicketsDto) {
    return this.ticketsService.createBulkTickets(createBulkTicketsDto);
  }

  @Get()
  findAll(@Query() filterTicketsDto: FilterTicketsDto) {
    return this.ticketsService.findAll(filterTicketsDto);
  }
}
