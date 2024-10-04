import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CreateBulkTicketsDto } from './dto/create-bulk-tickets.dto';
import { FilterTicketsDto } from './dto/filter-tickets.dto';

import { Material } from './enums/material.enum';
import { TicketRepository } from './repositories/ticket.repository';
import { SitesService } from 'src/site/sites.service';
import { TrucksService } from 'src/truck/trucks.service';
import { DataSource } from 'typeorm';
import parseDate from 'src/utils/parse-date';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(TicketRepository)
    private ticketRepository: TicketRepository,
    private sitesService: SitesService,
    private trucksService: TrucksService,
    private dataSource: DataSource,
  ) {}

  async createTicket(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const { siteId, truckId, dispatchedAt, material } = createTicketDto;
    await this.validateTicketCreation(siteId, truckId, dispatchedAt);

    const ticket = this.ticketRepository.create({
      ...createTicketDto,
      material: material ?? Material.SOIL,
    });
    ticket.ticketNumber =
      await this.ticketRepository.generateTicketNumber(siteId);

    return this.ticketRepository.save(ticket);
  }

  async createBulkTickets(
    createBulkTicketsDto: CreateBulkTicketsDto,
  ): Promise<Ticket[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const createdTickets: Ticket[] = [];

      for (const ticketDto of createBulkTicketsDto.tickets) {
        const ticket = await this.createTicketWithinTransaction(
          ticketDto,
          queryRunner,
        );
        createdTickets.push(ticket);
      }

      await queryRunner.commitTransaction();
      return createdTickets;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        `Failed to create bulk tickets: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  private async createTicketWithinTransaction(
    createTicketDto: CreateTicketDto,
    queryRunner: any,
  ): Promise<Ticket> {
    const { siteId, truckId, dispatchedAt, material } = createTicketDto;
    await this.validateTicketCreation(siteId, truckId, dispatchedAt);

    const ticket = this.ticketRepository.create({
      ...createTicketDto,
      material: material ?? Material.SOIL,
    });
    ticket.ticketNumber =
      await this.ticketRepository.generateTicketNumber(siteId);

    return queryRunner.manager.save(Ticket, ticket);
  }

  async findAll(filterTicketsDto: FilterTicketsDto): Promise<Ticket[]> {
    return this.ticketRepository.findAll(filterTicketsDto);
  }

  private async validateTicketCreation(
    siteId: number,
    truckId: number,
    dispatchedAt: string,
  ): Promise<void> {
    const site = await this.sitesService.findOne(siteId);
    if (!site) {
      throw new BadRequestException(`Site with id ${siteId} not found`);
    }

    const truck = await this.trucksService.findOne(truckId);
    if (!truck) {
      throw new BadRequestException(`Truck with id ${truckId} not found`);
    }

    const parsedDate = parseDate(dispatchedAt);
    if (!parsedDate) {
      throw new BadRequestException(`Invalid date format: ${dispatchedAt}`);
    }

    // Check for existing ticket with the same truckId and dispatchedAt
    const existingTicket = await this.ticketRepository.findExistingTicket(
      truckId,
      parsedDate,
    );

    if (existingTicket) {
      throw new ConflictException(
        `A ticket already exists for truck ${truckId} on ${parsedDate}`,
      );
    }
  }
}
