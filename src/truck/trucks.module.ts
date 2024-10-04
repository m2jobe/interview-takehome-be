// src/site/site.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TruckRepository } from './repositories/truck.repository';
import { Truck } from './entities/truck.entity';
import { TrucksService } from './trucks.service';

@Module({
  imports: [TypeOrmModule.forFeature([Truck])],
  providers: [TruckRepository, TrucksService],
  exports: [TruckRepository, TrucksService],
})
export class TrucksModule {}
