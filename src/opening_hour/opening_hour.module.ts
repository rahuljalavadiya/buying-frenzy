import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpeningHour } from './opening_hour.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OpeningHour])],
  exports: [TypeOrmModule],
})
export class OpeningHourModule {}
