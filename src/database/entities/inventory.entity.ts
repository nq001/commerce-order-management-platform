import {
  Entity,
  PrimaryColumn,
  Column,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Check,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('inventories')
@Check(`"available_quantity" >= 0`)
export class Inventory {
  @PrimaryColumn('uuid')
  product_id: string;

  @Column('int', { default: 0 })
  available_quantity: number;

  @Column('int', { default: 0 })
  reserved_quantity: number;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => Product, (product) => product.inventory)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
