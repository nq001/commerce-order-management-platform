import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Coupon } from './coupon.entity';
import { OrderItem } from './order-item.entity';
import { OrderAddressSnapshot } from './order-address-snapshot.entity';
import { PaymentEvent } from './payment-event.entity';
import { Shipment } from './shipment.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column({ type: 'uuid', nullable: true })
  coupon_id: string | null;

  @Column()
  status: string;

  @Column('int')
  total_amount: number;

  @Column('int')
  subtotal_amount: number;

  @Column('int')
  discount_amount: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Coupon, (coupon) => coupon.orders)
  @JoinColumn({ name: 'coupon_id' })
  coupon: Coupon | null;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItems: OrderItem[];

  @OneToOne(() => OrderAddressSnapshot, (snapshot) => snapshot.order)
  addressSnapshot: OrderAddressSnapshot;

  @OneToMany(() => PaymentEvent, (paymentEvent) => paymentEvent.order)
  paymentEvents: PaymentEvent[];

  @OneToOne(() => Shipment, (shipment) => shipment.order)
  shipment: Shipment;
}
