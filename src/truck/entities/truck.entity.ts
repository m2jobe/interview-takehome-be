import { Site } from 'src/site/entities/site.entity';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity('trucks')
export class Truck {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  license: string;

  @OneToMany(() => Ticket, (ticket) => ticket.truck)
  tickets: Ticket[];

  @ManyToOne(() => Site, (site) => site.trucks)
  @JoinColumn({ name: 'siteId' })
  site: Site;

  @Column()
  siteId: number;
}
