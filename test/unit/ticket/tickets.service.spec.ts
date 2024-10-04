import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { BadRequestException, ConflictException } from '@nestjs/common';

import { SitesService } from 'src/site/sites.service';
import { TrucksService } from 'src/truck/trucks.service';

import { Material } from 'src/tickets/enums/material.enum';
import { FilterTicketsDto } from 'src/tickets/dto/filter-tickets.dto';
import { Truck } from 'src/truck/entities/truck.entity';
import { Site } from 'src/site/entities/site.entity';
import { TicketRepository } from 'src/tickets/repositories/ticket.repository';
import { TicketsService } from 'src/tickets/tickets.service';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { CreateTicketDto } from 'src/tickets/dto/create-ticket.dto';
import { CreateBulkTicketsDto } from 'src/tickets/dto/create-bulk-tickets.dto';

// Define constants for complex objects
const createTicketDto: CreateTicketDto = {
  siteId: 1,
  truckId: 1,
  dispatchedAt: '2023-05-01 10:00:00',
  material: Material.SOIL,
};

const createBulkTicketsDto: CreateBulkTicketsDto = {
  tickets: [
    {
      siteId: 1,
      truckId: 1,
      dispatchedAt: '2023-05-01 10:00:00',
      material: Material.SOIL,
    },
    {
      siteId: 1,
      truckId: 2,
      dispatchedAt: '2023-05-01 11:00:00',
      material: Material.SOIL,
    },
  ],
};

// Define a mock class for TicketRepository
class MockTicketRepository extends Repository<Ticket> {
  generateTicketNumber = jest.fn();
  findAll = jest.fn();
  findExistingTicket = jest.fn();
  create = jest.fn();
  save = jest.fn();
}

describe('TicketsService', () => {
  let service: TicketsService;
  let ticketRepository: jest.Mocked<TicketRepository>;
  let sitesService: jest.Mocked<SitesService>;
  let trucksService: jest.Mocked<TrucksService>;
  let dataSource: jest.Mocked<DataSource>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: TicketRepository,
          useClass: MockTicketRepository,
        },
        {
          provide: SitesService,
          useValue: { findOne: jest.fn() },
        },
        {
          provide: TrucksService,
          useValue: { findOne: jest.fn() },
        },
        {
          provide: DataSource,
          useValue: { createQueryRunner: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    ticketRepository = module.get<TicketRepository>(
      TicketRepository,
    ) as jest.Mocked<TicketRepository>;
    sitesService = module.get(SitesService);
    trucksService = module.get(TrucksService);
    dataSource = module.get(DataSource);

    jest
      .spyOn(ticketRepository, 'generateTicketNumber')
      .mockResolvedValue('TICKET-001');
    jest.spyOn(ticketRepository, 'findExistingTicket').mockResolvedValue(null);
    jest
      .spyOn(ticketRepository, 'create')
      .mockImplementation((dto) => dto as Ticket);
    jest
      .spyOn(ticketRepository, 'save')
      .mockImplementation((ticket) =>
        Promise.resolve({ id: 1, ...ticket } as Ticket),
      );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTicket', () => {
    it('should create a ticket successfully', async () => {
      sitesService.findOne.mockResolvedValue({ id: 1 } as Site);
      trucksService.findOne.mockResolvedValue({ id: 1 } as Truck);

      const result = await service.createTicket(createTicketDto);

      expect(result).toEqual({
        id: 1,
        ...createTicketDto,
        ticketNumber: 'TICKET-001',
      });
      expect(ticketRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if site not found', async () => {
      sitesService.findOne.mockResolvedValue(null);

      await expect(service.createTicket(createTicketDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException if ticket already exists', async () => {
      sitesService.findOne.mockResolvedValue({ id: 1 } as Site);
      trucksService.findOne.mockResolvedValue({ id: 1 } as Truck);
      jest
        .spyOn(ticketRepository, 'findExistingTicket')
        .mockResolvedValue({ id: 1 } as Ticket);

      await expect(service.createTicket(createTicketDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('createBulkTickets', () => {
    it('should create multiple tickets successfully', async () => {
      const mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: {
          save: jest
            .fn()
            .mockImplementation((_, ticket) =>
              Promise.resolve({ id: 1, ...ticket } as Ticket),
            ),
        },
      };

      dataSource.createQueryRunner.mockReturnValue(mockQueryRunner as any);
      sitesService.findOne.mockResolvedValue({ id: 1 } as Site);
      trucksService.findOne.mockResolvedValue({ id: 1 } as Truck);

      const result = await service.createBulkTickets(createBulkTicketsDto);

      expect(result).toHaveLength(2);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
    });

    it('should rollback transaction if an error occurs', async () => {
      const mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: {
          save: jest.fn().mockRejectedValue(new Error('Save failed')),
        },
      };

      dataSource.createQueryRunner.mockReturnValue(mockQueryRunner as any);
      sitesService.findOne.mockResolvedValue({ id: 1 } as Site);
      trucksService.findOne.mockResolvedValue({ id: 1 } as Truck);

      await expect(
        service.createBulkTickets(createBulkTicketsDto),
      ).rejects.toThrow(BadRequestException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of tickets', async () => {
      const filterTicketsDto: FilterTicketsDto = { siteIds: [1] };
      const mockTickets = [{ id: 1, siteId: 1, truckId: 1 }];

      jest
        .spyOn(ticketRepository, 'findAll')
        .mockResolvedValue(mockTickets as Ticket[]);

      const result = await service.findAll(filterTicketsDto);

      expect(result).toEqual(mockTickets);
      expect(ticketRepository.findAll).toHaveBeenCalledWith(filterTicketsDto);
    });
  });
});
