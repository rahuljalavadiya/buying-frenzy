import { Restaurant } from '../restaurant/restaurant.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

const WeekDays = ['SUN', 'MON', 'TUES', 'WED', 'THUS', 'FRI', 'SAT'];
@Unique('opening_hours_unique_for_each_day', ['restaurant', 'weekday'])
@Entity()
export class OpeningHour extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: WeekDays })
  weekday: string;

  @Column('time')
  opens_at: Date;

  @Column('time')
  closes_at: Date;

  @Column('boolean')
  overnight: boolean;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.dishes)
  restaurant: Restaurant;

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
