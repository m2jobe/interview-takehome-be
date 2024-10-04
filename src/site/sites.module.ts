// src/site/site.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Site } from './entities/site.entity';
import { SiteRepository } from './repositories/site.repository';
import { SitesService } from './sites.service';

@Module({
  imports: [TypeOrmModule.forFeature([Site])],
  providers: [SiteRepository, SitesService],
  exports: [SiteRepository, SitesService],
})
export class SitesModule {}
