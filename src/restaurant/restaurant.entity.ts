import { Dish } from '../dish/dish.entity';
import { PurchaseOrder } from '../purchase_order/purchase_order.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Restaurant extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 200 })
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  cash_balance: number;

  @OneToMany(() => Dish, (dish) => dish.restaurant)
  dishes: Dish[];

  @OneToMany(() => PurchaseOrder, (purchaseOrder) => purchaseOrder.restaurant)
  purchase_orders: PurchaseOrder[];

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updated_at: Date;
}
