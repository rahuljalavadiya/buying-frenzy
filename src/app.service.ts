import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import { firstValueFrom } from 'rxjs';
import { Connection } from 'typeorm';
import { Dish } from './dish/dish.entity';
import { OpeningHour } from './opening_hour/opening_hour.entity';
import { PurchaseOrder } from './purchase_order/purchase_order.entity';
import { Restaurant } from './restaurant/restaurant.entity';
import { User } from './user/user.entity';
import * as moment from 'moment';

export type restaurantMenu = {
  dishName: string;
  price: number;
};

export type dish = {
  name: string;
  restaurantId: string;
  price: number;
};

export type timeSpan = {
  opens_at: Date;
  closes_at: Date;
  overnight: boolean;
};

export type purchaseHistory = {
  dishName: string;
  restaurantName: string;
  transactionAmount: number;
  transactionDate: string;
};
@Injectable()
export class AppService {
  constructor(
    private httpService: HttpService,
    private connection: Connection,
  ) {}
  async importDatabase(): Promise<void> {
    console.log('in side import database');
    await this.importRestaurants();
    this.importUsers();
  }

  /**
   * Import restaurant from api and store it into database.
   * Restaurant data will be store in database like restaurant cash balance, menu items (dishes), opening hours;
   */
  async importRestaurants() {
    const response = await firstValueFrom(
      this.httpService.get(process.env.RESTAURANT_DATA_URL),
    );
    if (response.status === 200) {
      const restaurants = response.data;
      if (restaurants.length > 0) {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
          for (const restaurant of restaurants) {
            const record = new Restaurant();
            record.name = restaurant.restaurantName;
            record.cash_balance = restaurant.cashBalance;
            await queryRunner.manager.save(record);

            if (restaurant.menu) {
              const menuRecords = await this.getMenuItems(
                restaurant.menu,
                record,
              );
              await queryRunner.manager
                .createQueryBuilder()
                .insert()
                .into(Dish)
                .values(menuRecords)
                .execute();
            }

            if (restaurant.openingHours) {
              const openingHours = await this.renderOpeningHours(
                restaurant.openingHours,
                record,
              );
              await queryRunner.manager
                .createQueryBuilder()
                .insert()
                .into(OpeningHour)
                .values(openingHours)
                .execute();
            }
          }
          await queryRunner.commitTransaction();
        } catch (err) {
          await queryRunner.rollbackTransaction();
        } finally {
          await queryRunner.release();
        }
      }
    } else {
      console.log(
        'Something went wrong while fetch records for database',
        response.statusText,
      );
    }
  }

  /**
   * Import users data form api.
   * Users data will be store in database with purchase history, cash balance.
   */
  async importUsers() {
    const response = await firstValueFrom(
      this.httpService.get(process.env.USER_DATA_URL),
    );
    if (response.status === 200) {
      const users = response.data;
      if (users.length > 0) {
        const dishes = await Dish.find();
        const dishesObjects = await this.generateObjectsFromArray(
          dishes,
          'name',
        );
        const restaurants = await Restaurant.find();
        const restaurantsObjects = await this.generateObjectsFromArray(
          restaurants,
          'name',
        );
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
          for (const user of users) {
            const record = new User();
            record.name = user.name;
            record.cash_balance = user.cashBalance;
            await queryRunner.manager.save(record);

            if (user.purchaseHistory) {
              const purchaseOrders = await this.renderPurchaseHistory(
                user.purchaseHistory,
                record,
                restaurantsObjects,
                dishesObjects,
              );
              await queryRunner.manager
                .createQueryBuilder()
                .insert()
                .into(PurchaseOrder)
                .values(purchaseOrders)
                .execute();
            }
          }
          await queryRunner.commitTransaction();
        } catch (err) {
          await queryRunner.rollbackTransaction();
        } finally {
          await queryRunner.release();
        }
      }
    } else {
      console.log(
        'Something went wrong while fetch records for database',
        response.statusText,
      );
    }
  }

  /**
   * Function to generate object from array with provided key.
   * @param array object array
   * @param key key of sub array
   * @returns object
   *
   * For example: Input array:[ {name: "Jone" , "age": 20},
   *                {name: "Kattie" , "age": 21}
   *              ];
   *              Input key: 'name'
   * Output: {
   *                "Jone": {name: "Jone" , "age": 20},
   *                "Kattie": {name: "Kattie" , "age": 21}
   *         }
   *
   */
  generateObjectsFromArray(array: object[], key: string): object {
    const objects = {};
    array.map((entity) => {
      objects[entity[key]] = entity;
    });
    return objects;
  }

  /**
   * Function to generate Dish record from menu items for store it into database.
   * @param menuItems array or menu items
   * @param restaurant resturant record for which we want to store dishes records
   * @returns Dish array
   */
  getMenuItems(menuItems: restaurantMenu[], restaurant: Restaurant): Dish[] {
    const dishes = menuItems.map((item) => {
      const dish = new Dish();
      dish.name = item.dishName;
      dish.price = item.price;
      dish.restaurant = restaurant;
      return dish;
    });
    return dishes;
  }

  /**
   * Function to render opening hour string into OpeningHour object array for store it into database.
   * @param openingHour string like Mon - Tues, Wed-Fri 10 am - 11:45 am / Sat 7:45 am - 2:15 pm / Sun 11:15 am - 3 pm
   * @param restaurant resturant record for which we want to store opening hours records
   * @returns OpeningHour array
   */
  renderOpeningHours(
    openingHour: string,
    restaurant: Restaurant,
  ): OpeningHour[] {
    const days = openingHour.split('/');
    const weekDays = {};
    for (const day of days) {
      const d = day.trim().split(' ');
      const time_string = d.slice(-5).join('').trim();
      const { opens_at, closes_at, overnight } =
        this.parseTimeSpan(time_string);
      const weekday_part = d.slice(0, -5).join('');
      const groups = weekday_part.split(',');

      for (const group of groups) {
        if (group.includes('-')) {
          const splittedDays = this.gatDayRange(group);
          console.log(group, splittedDays);
          splittedDays.forEach((splitedDay) => {
            const openingHour = new OpeningHour();
            openingHour.weekday = splitedDay;
            openingHour.opens_at = opens_at;
            openingHour.closes_at = closes_at;
            openingHour.overnight = overnight;
            openingHour.restaurant = restaurant;
            weekDays[splitedDay] = openingHour;
          });
        } else {
          const weekday = this.parseWeekDaytoInt(group);
          const weekdaystring = this.parseWeekDaytoString(weekday);
          const openingHour = new OpeningHour();
          openingHour.weekday = weekdaystring;
          openingHour.opens_at = opens_at;
          openingHour.closes_at = closes_at;
          openingHour.overnight = overnight;
          openingHour.restaurant = restaurant;
          weekDays[weekdaystring] = openingHour;
        }
      }
    }
    return Object.values(weekDays);
  }

  /**
   * Function to generate days range from start and end day
   * @param range string like Mon - Tues
   * @returns array like ['MON','TUES']
   */
  gatDayRange(range: string): string[] {
    const [weekday_start, weekday_end] = range.split('-');
    let weekday_start_number = this.parseWeekDaytoInt(weekday_start.trim());
    const weekday_end_number = this.parseWeekDaytoInt(weekday_end.trim());
    let diff = (weekday_end_number - weekday_start_number) % 7;
    diff = diff < 0 ? 7 + (weekday_end_number - weekday_start_number) : diff;

    const days = [];
    for (let step = 0; step <= diff; step++) {
      days.push(this.parseWeekDaytoString(weekday_start_number % 7));
      weekday_start_number = weekday_start_number + 1;
      days.push();
    }
    return days;
  }

  /**
   * function to convert day string name to integer
   * @param day string like "MON"
   * @returns number
   */
  parseWeekDaytoInt(day: string): number {
    return {
      MON: 0,
      TUES: 1,
      WEDS: 2,
      WED: 2,
      THU: 3,
      THURS: 3,
      FRI: 4,
      SAT: 5,
      SUN: 6,
    }[day.toUpperCase()];
  }

  /**
   * Function to convert day number into string for store it into database
   * @param day number like 0,1
   * @returns string
   */
  parseWeekDaytoString(day: number): string {
    return {
      6: 'SUN',
      0: 'MON',
      1: 'TUES',
      2: 'WED',
      3: 'THUS',
      4: 'FRI',
      5: 'SAT',
    }[day];
  }

  /**
   * Funtion to render time span and get openes and closes time from it.
   * If the closing time is lesser than opening time, `overnight` is
    returned as `True`. This would tell that time spans more than a day.
   * @param timeString string like 10 am - 11:45 am
   * @returns object { openes_at: Date , closes_at: Date, overnight: boolean}
   */
  parseTimeSpan(timeString: string): timeSpan {
    const [opensAt, closesAt] = timeString.split('-');
    const opensAtDate = this.convertTime12to24(opensAt);
    const closesAtDate = this.convertTime12to24(closesAt);
    const overnight = closesAtDate < opensAtDate;
    return {
      opens_at: opensAtDate,
      closes_at: closesAtDate,
      overnight,
    };
  }

  /**
   * Function to convert 12 hours format time string into Date object
   * @param time string like 12 pm
   * @returns Date
   */
  convertTime12to24 = (time: string): Date => {
    let hours = parseInt(time.match(/^(\d+)/)[1]);
    const minuteParsed = time.match(/:(\d+)/);
    const minutes = minuteParsed != null ? parseInt(minuteParsed[1]) : 0;
    const AMPM = time.match(/([a-z]+)/)[1];
    if (AMPM.toLocaleLowerCase() == 'pm' && hours < 12) hours = hours + 12;
    if (AMPM.toLocaleLowerCase() == 'am' && hours == 12) hours = hours - 12;
    let sHours = hours.toString();
    let sMinutes = minutes.toString();
    if (hours < 10) sHours = '0' + sHours;
    if (minutes < 10) sMinutes = '0' + sMinutes;
    return new Date('2022-01-01 ' + sHours + ':' + sMinutes + ':' + '00');
  };

  /**
   * Function to render purchase history into purchaseorder object for store it into database.
   * @param purchaseHistories array of purchaseHistory object
   * @param user user record for which we want to store purchase orders.
   * @param restaurants object in which key is restaurant name so we can easily take resturant object from resturant name
   * @param dishes object in which key is dish name so we can easily take dish object from dish name
   * @returns PurchaseOrder array
   */
  renderPurchaseHistory(
    purchaseHistories: purchaseHistory[],
    user: User,
    restaurants: object,
    dishes: object,
  ): PurchaseOrder[] {
    const purchaseOrders = purchaseHistories.map((purchaseHistory) => {
      const purchaseOrder = new PurchaseOrder();
      purchaseOrder.dish_name = purchaseHistory.dishName;
      purchaseOrder.restaurant_name = purchaseHistory.restaurantName;
      purchaseOrder.restaurant = restaurants[purchaseHistory.restaurantName]
        ? restaurants[purchaseHistory.restaurantName]
        : null;
      purchaseOrder.dish = dishes[purchaseHistory.dishName]
        ? dishes[purchaseHistory.dishName]
        : null;
      purchaseOrder.transaction_date = moment(
        purchaseHistory.transactionDate,
        'MM/DD/YYYY hh:mm A',
      ).toDate();
      purchaseOrder.transaction_amount = purchaseHistory.transactionAmount;
      purchaseOrder.user = user;
      return purchaseOrder;
    });
    return purchaseOrders;
  }
}
