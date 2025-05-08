# Bottle Water Delivery - Backend

Project UTS Rekayasa Perangkat Lunak - Backend API for Bottle Water Delivery System

## Overview

This is the backend API for the Bottle Water Delivery system, providing a robust set of endpoints to manage users, products, orders, deliveries, and more. The API is built using Express.js and PostgreSQL for data storage.

## Features

- **User Management**
  - User registration and authentication
  - Role-based access control (admin, customer)
  - JWT-based authentication
  - User profile management

- **Product Management**
  - CRUD operations for water bottle products
  - Stock management
  - Product categorization

- **Order Processing**
  - Order creation and management
  - Order status tracking
  - Order history

- **Cart System**
  - Add/remove items
  - Update quantities
  - Cart persistence

- **Delivery Management**
  - Delivery scheduling
  - Delivery status tracking
  - Driver assignment

- **Payment Processing**
  - Payment status tracking
  - Multiple payment methods support

- **Organization Management**
  - Business customer profiles
  - Multiple delivery locations
  - Organization-specific pricing

- **Replenishment System**
  - Stock level monitoring
  - Automatic replenishment orders
  - Inventory management

- **Notification System**
  - Email notifications for order status
  - Delivery alerts

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create a new product (admin)
- `PUT /api/products/:id` - Update a product (admin)
- `DELETE /api/products/:id` - Delete a product (admin)

### Customers
- `GET /api/customers` - Get all customers (admin)
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create a customer profile
- `PUT /api/customers/:id` - Update a customer profile

### Organizations
- `GET /api/organizations` - Get all organizations (admin)
- `GET /api/organizations/:id` - Get organization by ID
- `POST /api/organizations` - Create an organization
- `PUT /api/organizations/:id` - Update an organization

### Orders
- `GET /api/orders` - Get all orders (admin) or user orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create a new order
- `PUT /api/orders/:id` - Update an order status

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove item from cart

### Deliveries
- `GET /api/deliveries` - Get all deliveries (admin)
- `GET /api/deliveries/:id` - Get delivery by ID
- `POST /api/deliveries` - Create a delivery
- `PUT /api/deliveries/:id` - Update delivery status

### Replenishments
- `GET /api/replenishments` - Get all replenishment orders
- `POST /api/replenishments` - Create a replenishment order
- `PUT /api/replenishments/:id` - Update replenishment status

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Send a notification

### Payments
- `GET /api/payments` - Get all payments (admin)
- `GET /api/payments/:id` - Get payment by ID
- `POST /api/payments` - Process a payment
- `PUT /api/payments/:id` - Update payment status

## Technology Stack

- **Express.js** (v5.1.0) - Web framework
- **PostgreSQL** (via pg v8.15.5) - Database
- **JSON Web Token** (v9.0.2) - Authentication
- **bcrypt** (v5.1.1) - Password hashing
- **nodemailer** (v6.10.1) - Email notifications
- **express-validator** (v7.2.1) - Input validation
- **cors** (v2.8.5) - Cross-Origin Resource Sharing
- **dotenv** (v16.5.0) - Environment variables

## Project Structure

```
backend/
├── config/             # Configuration files
├── controller/         # Request handlers
├── middleware/         # Custom middleware
├── migrations/         # Database migrations
├── models/             # Data models
├── routes/             # API routes
├── server.js           # Entry point
└── README.md           # Project documentation
```

## Database Schema

The application uses PostgreSQL with the following main tables:
- users - User accounts
- products - Water bottle products
- order_item - Order information
- order_details - Order line items
- payment - Payment information
- delivery_order - Delivery information
- cart - Shopping cart items
- customer_profile - Customer information
- organizations - Business customer information
- org_locations - Organization delivery locations
- replenishment_order - Stock replenishment orders
- email_notifications - Email notification records

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:
   ```
   npm install
   ```
4. Set up environment variables in a `.env` file:
   ```
   PORT=8000
   PGUSER=postgres
   PGHOST=localhost
   PGDATABASE=bottlewaterdelivery
   PGPASSWORD=yourpassword
   PGPORT=5432
   JWT_SECRET=your_jwt_secret
   ```
5. Run database migrations:
   ```
   psql -U postgres -d bottlewaterdelivery -f migrations/001_create_order_tables.sql
   psql -U postgres -d bottlewaterdelivery -f migrations/004_create_replenishment_tables.sql
   psql -U postgres -d bottlewaterdelivery -f migrations/005_create_cart_tables.sql
   psql -U postgres -d bottlewaterdelivery -f migrations/006_create_email_notifications_table.sql
   ```
6. Start the server:
   ```
   node server.js
   ```
7. The API will be available at `http://localhost:8000`

## Dependencies

### Main Dependencies
- express: ^5.1.0
- pg: ^8.15.5
- bcrypt: ^5.1.1
- jsonwebtoken: ^9.0.2
- nodemailer: ^6.10.1
- express-validator: ^7.2.1
- await: ^0.2.6

### Development Dependencies
- cors: ^2.8.5
- dotenv: ^16.5.0
- nodemon: ^3.1.10

## License

This project is licensed under the terms included in the LICENSE file.
