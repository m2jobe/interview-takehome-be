import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FilterTicketsDto } from 'src/tickets/dto/filter-tickets.dto';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { TicketRepository } from 'src/tickets/repositories/ticket.repository';
import { Repository, SelectQueryBuilder } from 'typeorm';

describe('TicketRepository', () => {
  let ticketRepository: TicketRepository;
  let mockQueryBuilder: Partial<SelectQueryBuilder<Ticket>>;

  beforeEach(async () => {
    mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]),
    };

    const mockRepository: Partial<Repository<Ticket>> = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      findOne: jest.fn(),
      manager: {} as any,
      metadata: {
        connection: { options: { type: null } } as any,
        columns: [],
        relations: [],
      } as any,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketRepository,
        {
          provide: getRepositoryToken(Ticket),
          useValue: mockRepository,
        },
      ],
    }).compile();

    ticketRepository = module.get<TicketRepository>(TicketRepository);
  });

  describe('findAll', () => {
    it('should return an array of tickets', async () => {
      const filterDto: FilterTicketsDto = {
        siteIds: [1, 2],
        startDate: '2023-01-01',
        endDate: '2023-12-31',
      };

      jest
        .spyOn(ticketRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await ticketRepository.findAll(filterDto);

      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledTimes(2);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(2);
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
    });
  });

  describe('findExistingTicket', () => {
    it('should return a ticket if found', async () => {
      const mockTicket = { id: 1, truckId: 123, dispatchedAt: new Date() };
      jest
        .spyOn(ticketRepository, 'findOne')
        .mockResolvedValue(mockTicket as Ticket);

      const result = await ticketRepository.findExistingTicket(123, new Date());

      expect(result).toEqual(mockTicket);
      expect(ticketRepository.findOne).toHaveBeenCalledWith({
        where: {
          truckId: 123,
          dispatchedAt: expect.any(Date),
        },
      });
    });

    it('should return undefined if no ticket found', async () => {
      jest.spyOn(ticketRepository, 'findOne').mockResolvedValue(undefined);

      const result = await ticketRepository.findExistingTicket(123, new Date());

      expect(result).toBeUndefined();
    });
  });

  describe('generateTicketNumber', () => {
    it('should generate a new ticket number when no tickets exist', async () => {
      jest.spyOn(ticketRepository, 'findOne').mockResolvedValue(undefined);

      const result = await ticketRepository.generateTicketNumber(1);

      expect(result).toBe('1-000001');
    });

    it('should generate the next ticket number based on the latest ticket', async () => {
      jest
        .spyOn(ticketRepository, 'findOne')
        .mockResolvedValue({ ticketNumber: '1-000005' } as Ticket);

      const result = await ticketRepository.generateTicketNumber(1);

      expect(result).toBe('1-000006');
    });
  });
});
