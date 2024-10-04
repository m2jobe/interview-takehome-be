import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { TrucksService } from 'src/truck/trucks.service';
import { Truck } from 'src/truck/entities/truck.entity';

describe('TrucksService', () => {
  let service: TrucksService;
  let repository: jest.Mocked<Repository<Truck>>;

  beforeEach(async () => {
    const mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrucksService,
        {
          provide: getRepositoryToken(Truck),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TrucksService>(TrucksService);
    repository = module.get<jest.Mocked<Repository<Truck>>>(
      getRepositoryToken(Truck),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a truck with site relation if found', async () => {
      const expectedResult = {
        id: 1,
        name: 'Truck 1',
        site: { id: 1, name: 'Site 1' },
      };
      repository.findOne.mockResolvedValue(expectedResult as unknown as Truck);

      const result = await service.findOne(1);
      expect(result).toEqual(expectedResult);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException if truck is not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
