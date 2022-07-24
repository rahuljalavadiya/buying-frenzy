import { Dish } from '../dish/dish.entity';
import { Restaurant } from '../restaurant/restaurant.entity';
import { User } from '../user/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 1000 })
  dish_name: string;

  @Column('decimal', { precision: 10, scale: 2, unsigned: true })
  transaction_amount: number;

  @Column({ type: 'timestamp' })
  transaction_date: Date;

  @Column('varchar', { length: 200 })
  restaurant_name: string;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.purchase_orders)
  restaurant: Restaurant;

  @ManyToOne(() => Dish, (dish) => dish.purchase_orders, { eager: true })
  @JoinColumn()
  dish: Dish;

  @ManyToOne(() => User, (user) => user.purchase_orders)
  user: User;

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
