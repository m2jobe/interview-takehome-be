import { Ticket } from 'src/tickets/entities/ticket.entity';
import { Truck } from 'src/truck/entities/truck.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity('sites')
export class Site {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => Truck, (truck) => truck.site)
  trucks: Truck[];

  @OneToMany(() => Ticket, (ticket) => ticket.site)
  tickets: Ticket[];
}
