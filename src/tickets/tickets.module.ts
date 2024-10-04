import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { Ticket } from './entities/ticket.entity';
import { SitesModule } from 'src/site/sites.module';
import { TrucksModule } from 'src/truck/trucks.module';
import { TicketRepository } from './repositories/ticket.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket]), SitesModule, TrucksModule],
  controllers: [TicketsController],
  providers: [TicketsService, TicketRepository],
})
export class TicketsModule {}
