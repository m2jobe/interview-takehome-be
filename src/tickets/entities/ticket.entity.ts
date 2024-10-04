import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';

import { Material } from '../enums/material.enum';
import { Site } from 'src/site/entities/site.entity';
import { Truck } from 'src/truck/entities/truck.entity';

@Entity('tickets')
@Unique(['truckId', 'dispatchedAt'])
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  ticketNumber: string;

  @Index()
  @Column({ type: 'timestamp' })
  dispatchedAt: Date;

  @Column({
    type: 'enum',
    enum: Material,
    default: Material.SOIL,
  })
  material: Material;

  @ManyToOne(() => Site, (site) => site.tickets)
  @JoinColumn({ name: 'siteId' })
  site: Site;

  @Column()
  siteId: number;

  @ManyToOne(() => Truck, (truck) => truck.tickets)
  @JoinColumn({ name: 'truckId' })
  truck: Truck;

  @Column()
  truckId: number;
}
