## Description

Backend for a food delivery platform

Technologies used: 
Language: Node Js - nestjs framework
Database: Mysql 
Api Tool: Swagger

## Installation

```bash
$ npm install
```

SET restaurant & user data url in .env file.

RESTAURANT_DATA_URL=
USER_DATA_URL=

## Change mysql connection detail in src/config/ormconfig.ts

```bash
const ormConfig: MysqlConnectionOptions = {
  type: 'mysql',
  database: 'buyingfrenzy',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'pwd',
  synchronize: false, // Set to false when deploy to production
  logging: true,
  entities: ['dist/**/**.entity{.ts,.js}'],
};
```
## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
## API Documentation
```javascript
Open Swagger: http://localhost:3000/api
```
### 1. Import restaurant and user data.
  ```http
GET /app/import-database
```
#### Responses
```javascript
{
  true
}
```
### 2.List all restaurants that are open at a certain datetime
```http
GET /restaurant/all?opens_at=2022-07-23%2020%3A00%3A00
```

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `opens_at` | `Date` | **Required**. Datetime |

## Responses
Restaurant list will be return or empty array.
```javascript
[{
    "id": "022de251-cc6c-464a-9ffd-b5bc2cbce5bc",
    "name": "024 Grille",
    "cash_balance": "4882.81"
  }...
]
```

### 3.List top y restaurants that have more or less than x number of dishes within a price range, ranked alphabetically. More or less (than x) is a parameter that the API allows the consumer to enter.

```http
GET restaurant/filter-by-price?from_price=15&to_price=25&dishes=3&operation=min
```

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `from_price` | `number` | **Required**. |
| `to_price` | `number` | **Required**. |
| `dishes` | `number` | **Required**. |
| `operation` | `string` | **Required**. Either "min" or "max" |
## Responses
Restaurant list will be return or empty array.
```javascript
[{
    "id": "022de251-cc6c-464a-9ffd-b5bc2cbce5bc",
    "name": "024 Grille",
    "cash_balance": "4882.81"
  }...
]
```

### 4.Search for restaurants or dishes by name, ranked by relevance to search term.

```http
GET restaurant/search-by-keyword?keyword=La&type=restaurant
```

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `keyword` | `string` | **Required**. |
| `type` | `string` | **Required**. Either "restaurant" or "dish" |
## Responses

Base on seach type Restaurant or Dish list will be return.
If Search type is restaurant then will return list of restaurants or empty array.
```javascript
[{
    "id": "022de251-cc6c-464a-9ffd-b5bc2cbce5bc",
    "name": "024 Grille",
    "cash_balance": "4882.81"
  }...
]
```

If Search type is dish then will return list of dishes or empty array.
```javascript
[ {
    "Dish_id": "00003270-2282-4f7c-83c7-42eba025f71c",
    "Dish_name": "Hammelcarré",
    "Dish_price": "12.73",
    "Dish_created_at": "2022-07-23T13:28:30.576Z",
    "Dish_updated_at": "2022-07-23T13:28:30.576Z",
    "Dish_restaurantId": "53bd581c-7d14-44d3-901e-853e086d953b"
  }...
]
```

### 5.Process a user purchasing a dish from a restaurant, handling all relevant data changes in an atomic transaction. Do watch out for potential race conditions that can arise from concurrent transactions!

```http
POST purchase-order/place-order
```

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `user_id` | `string` | **Required**. |
| `dish_id` | `string` | **Required** |
## Responses

| Status Code | Description |
| :--- | :--- |
| 200 | `OK` |
| 400 | `BAD REQUEST` |
| 404 | `NOT FOUND` |
| 500 | `INTERNAL SERVER ERROR` |

If successfully ordered placed.
```javascript
{
  "id": "5998da79-bdf8-48d5-83b3-51531ad96b09",
  "dish_name": "Ochsenrippe und Ochsenrücken mit verschiedenen Gemüsen",
  "transaction_amount": "10.76",
  "transaction_date": "2022-07-23T13:44:19.407Z",
  "restaurant_name": "Rooftoop at E11EVEN"
}
```

If user or dish not exist in database.
```javascript
User does not exist!
```

```javascript
Dish does not exist!
```

If user has unsufficent balance.
```javascript
You have unsufficent balance!
```