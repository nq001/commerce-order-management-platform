import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Order } from './order.entity';

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column('int')
  discount_amount: number;

  @Column()
  discount_type: string; // 'PERCENTAGE' or 'FIXED'

  @Column('int', { nullable: true })
  usage_limit: number;

  @Column('int', { default: 0 })
  times_used: number;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  @OneToMany(() => Order, (order) => order.coupon)
  orders: Order[];
}
