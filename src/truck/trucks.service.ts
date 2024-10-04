import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Truck } from './entities/truck.entity';

@Injectable()
export class TrucksService {
  constructor(
    @InjectRepository(Truck)
    private truckRepository: Repository<Truck>,
  ) {}

  async findOne(id: number): Promise<Truck> {
    const truck = await this.truckRepository.findOne({
      where: { id },
      relations: ['site'],
    });
    if (!truck) {
      throw new NotFoundException(`Truck with ID "${id}" not found`);
    }
    return truck;
  }
}
