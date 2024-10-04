import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Truck } from 'src/truck/entities/truck.entity';

@Injectable()
export class TruckRepository extends Repository<Truck> {
  constructor(
    @InjectRepository(Truck)
    private readonly truckRepository: Repository<Truck>,
  ) {
    super(
      truckRepository.target,
      truckRepository.manager,
      truckRepository.queryRunner,
    );
  }
}
