# Ecommerce API

A RESTful e-commerce backend built with **Node.js**, **Express**, and **MongoDB (Mongoose)**. It implements authentication with access/refresh tokens, an admin dashboard for managing products and orders, and a customer-facing storefront with a cart, favorites, and checkout flow.

This project is a solution to the [Ecommerce API](https://roadmap.sh/projects/ecommerce-api) challenge on [roadmap.sh](https://roadmap.sh).

## Features

- **Authentication**
  - Register / login with hashed passwords (bcrypt)
  - JWT access tokens + HTTP-only refresh token cookie
  - Token refresh and logout endpoints
- **Role-based access control**
  - `customer` and `admin` roles
  - Admin-only middleware protecting product and order management routes
- **Product management (admin)**
  - Create, update, delete, and list products
  - Image upload handled with Multer (stored on disk, 5MB limit, images only)
- **Storefront (customer)**
  - Browse all products or filter by category
  - Add/remove favorite products
  - Manage a shopping cart (add, remove, increase/decrease quantity, clear)
  - Checkout: validates stock, creates an order, decrements product stock, and clears the cart
  - View order history, view a single order, and cancel a pending order (restores stock)
- **Validation** with `express-validator` on auth, product, and checkout routes
- **Automated tests** with Vitest, Supertest, and an in-memory MongoDB instance

## Tech Stack

| Layer          | Technology |
|----------------|------------|
| Runtime        | Node.js (ES Modules) |
| Framework      | Express 5 |
| Database       | MongoDB with Mongoose |
| Auth           | JSON Web Tokens (`jsonwebtoken`) + `bcrypt` |
| File uploads   | Multer |
| Validation     | express-validator |
| Testing        | Vitest, Supertest, mongodb-memory-server |

## Project Structure

```
Ecommerce-API/
├── app.js                     # Express app setup and route mounting
├── index.js                   # Entry point — starts the server & connects to DB
├── controllers/
│   ├── auth.controller.js     # login, register, logout, refresh token
│   ├── admin.controller.js    # product & order management
│   └── client.controller.js   # cart, favorites, checkout, orders
├── routes/
│   ├── auth.route.js          # /login, /register, /logout, /refresh-token
│   ├── admin.route.js         # /dashboard/* (admin only)
│   └── client.route.js        # storefront routes
├── models/
│   ├── User.model.js          # user, cart, favorites
│   ├── Product.model.js       # product catalog
│   └── Order.model.js         # order + order items
├── lib/
│   ├── connectDB..js          # MongoDB connection
│   ├── validToken.js          # JWT access token middleware
│   └── isAdmin.js             # admin role guard middleware
├── middlewares/
│   └── uploads.js             # Multer config for product images
├── validators/                # express-validator schemas
└── test/                      # Vitest + Supertest integration tests
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- A MongoDB database (e.g. a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Hicham-Hal/Ecommerce-API.git
   cd Ecommerce-API
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root with the following variables:

   ```env
   PORT=3000
   DB_USERNAME=your_mongodb_username
   DB_PASSWORD=your_mongodb_password
   ACCESS_TOKEN_SECRET=your_access_token_secret
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   ```

4. Start the server:

   ```bash
   npm start
   ```

   The API will be available at `http://localhost:3000` (or the port you configured), and uploaded product images are served from `/uploads/products`.

### Running Tests

```bash
npm test          # run the test suite once
npm run test:watch  # run tests in watch mode
```

Tests run against an in-memory MongoDB instance, so no external database connection is required.

## API Reference

All authenticated routes expect an `Authorization: Bearer <accessToken>` header. Successful login/registration also sets an HTTP-only `refreshToken` cookie used to obtain new access tokens.

### Auth — `/`

| Method | Endpoint         | Description                          | Auth |
|--------|------------------|--------------------------------------|------|
| POST   | `/register`      | Create a new account                 | No |
| POST   | `/login`         | Log in and receive an access token   | No |
| POST   | `/logout`        | Clear the refresh token cookie       | No |
| GET    | `/refresh-token` | Exchange refresh token for a new access token | Cookie |

### Storefront — `/`

| Method | Endpoint               | Description                          | Auth |
|--------|------------------------|--------------------------------------|------|
| GET    | `/`                    | List all products                    | No |
| GET    | `/products?cat=<name>` | List products filtered by category   | No |
| POST   | `/fav-product`         | Add a product to favorites           | Yes |
| POST   | `/unfav-product`       | Remove a product from favorites      | Yes |
| GET    | `/fav-products`        | List favorite products               | Yes |
| POST   | `/addToCart`           | Add a product to the cart            | Yes |
| POST   | `/remove-from-cart`    | Remove one item from the cart        | Yes |
| POST   | `/remove-cart`         | Empty the cart                       | Yes |
| POST   | `/increase-quantity`   | Increase a cart item's quantity      | Yes |
| POST   | `/dicrease-quantity`   | Decrease a cart item's quantity      | Yes |
| POST   | `/checkout`            | Place an order from the current cart | Yes |
| GET    | `/orders`              | List the logged-in user's orders     | Yes |
| GET    | `/order/:id`           | Get a single order (owner only)      | Yes |
| POST   | `/cancel`              | Cancel a pending order & restock     | Yes |

### Admin Dashboard — `/dashboard` (admin role required)

| Method | Endpoint             | Description                          |
|--------|----------------------|---------------------------------------|
| POST   | `/add-product`       | Create a product (multipart, field `product` for the image) |
| PUT    | `/product/:id`       | Update a product                     |
| DELETE | `/product/:id`       | Delete a product                     |
| GET    | `/products`          | List all products                    |
| GET    | `/orders`            | List all orders                      |
| PUT    | `/order/:id`         | Update an order's status             |

## Data Models

**User**: `name`, `email` (unique), `password` (hashed), `role` (`customer`/`admin`), `cart` (product + quantity), `fav` (list of product references).

**Product**: `title`, `description`, `image`, `quantity`, `category`, `price`.

**Order**: `user`, `items` (snapshot of product, title, price, quantity, image), `shippingAddress`, `totalAmount`, `paymentMethod` (`cod`/`stripe`), `paymentStatus`, `orderStatus` (`pending` → `processing` → `shipped` → `delivered`, or `cancelled`).

## (Not finished yet)

## License

ISC

