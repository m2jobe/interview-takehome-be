import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Site } from '../entities/site.entity';

@Injectable()
export class SiteRepository extends Repository<Site> {
  constructor(
    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,
  ) {
    super(
      siteRepository.target,
      siteRepository.manager,
      siteRepository.queryRunner,
    );
  }
}
