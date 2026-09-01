import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { ShipmentEvent } from './shipment-event.entity';

@Entity('shipments')
export class Shipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  order_id: string;

  @Column({ type: 'varchar', nullable: true })
  tracking_number: string | null;

  @Column({ type: 'varchar', nullable: true })
  provider: string | null;

  @Column({ default: 'PENDING' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => Order, (order) => order.shipment)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @OneToMany(() => ShipmentEvent, (event) => event.shipment, { cascade: true })
  events: ShipmentEvent[];
}
