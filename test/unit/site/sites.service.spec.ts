import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { SitesService } from 'src/site/sites.service';
import { Site } from 'src/site/entities/site.entity';

describe('SitesService', () => {
  let service: SitesService;
  let repository: jest.Mocked<Repository<Site>>;

  beforeEach(async () => {
    const mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SitesService,
        {
          provide: getRepositoryToken(Site),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SitesService>(SitesService);
    repository = module.get<jest.Mocked<Repository<Site>>>(
      getRepositoryToken(Site),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a site if found', async () => {
      const expectedResult = { id: 1, name: 'Site 1' };
      repository.findOne.mockResolvedValue(expectedResult as Site);

      const result = await service.findOne(1);
      expect(result).toEqual(expectedResult);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if site is not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
