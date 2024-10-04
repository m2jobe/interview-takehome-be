import { Injectable } from '@nestjs/common';
import { Between, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from '../entities/ticket.entity';
import { FilterTicketsDto } from '../dto/filter-tickets.dto';

@Injectable()
export class TicketRepository extends Repository<Ticket> {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {
    super(
      ticketRepository.target,
      ticketRepository.manager,
      ticketRepository.queryRunner,
    );
  }

  async findAll(filterTicketsDto: FilterTicketsDto): Promise<Ticket[]> {
    const { siteIds, startDate, endDate } = filterTicketsDto;
    const query = this.createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.site', 'site')
      .leftJoinAndSelect('ticket.truck', 'truck');

    if (siteIds) {
      const siteIdsArray = Array.isArray(siteIds) ? siteIds : [siteIds];
      query.andWhere('ticket.siteId IN (:...siteIds)', {
        siteIds: siteIdsArray,
      });
    }

    if (startDate && endDate) {
      query.andWhere({
        dispatchedAt: Between(new Date(startDate), new Date(endDate)),
      });
    } else if (startDate) {
      query.andWhere('ticket.dispatchedAt >= :startDate', {
        startDate: new Date(startDate),
      });
    } else if (endDate) {
      query.andWhere('ticket.dispatchedAt <= :endDate', {
        endDate: new Date(endDate),
      });
    }

    return query.getMany();
  }

  async findExistingTicket(
    truckId: number,
    dispatchedAt: Date,
  ): Promise<Ticket | undefined> {
    return this.findOne({
      where: {
        truckId,
        dispatchedAt,
      },
    });
  }

  async generateTicketNumber(siteId: number): Promise<string> {
    const latestTicket = await this.findOne({
      where: { siteId },
      order: { id: 'DESC' },
    });

    const nextNumber = latestTicket
      ? parseInt(latestTicket.ticketNumber.split('-')[1]) + 1
      : 1;
    return `${siteId}-${nextNumber.toString().padStart(6, '0')}`;
  }
}
