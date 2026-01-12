---

# 🛒 E-commerce Full Stack Challenge – Submission

## 📌 Overview

This repository contains my solution to selected challenges from the **E-commerce Full Stack Challenge**, built using **React**, **FastAPI**, and **PostgreSQL**.

The focus of this submission is improving **user experience**, **order management**, **backend workflow integrity**, and **API scalability**, following clean architecture principles and production-ready practices.

---

## ✅ Completed Challenges

---

## ✔ Challenge 01 – Add to Cart Animation

**Type:** Frontend (React)
**Status:** Completed

### 📌 Description

Implemented smooth visual feedback when a product is added to the cart to improve user confidence and interaction clarity.

### ✨ Features

* Button scale animation on click
* Color transition from primary to success
* Animated checkmark icon
* Automatic reset after ~600ms
* Supports rapid multiple clicks safely

### 🧠 Implementation

* Per-product animation state
* No external animation libraries
* Button disabled during animation
* Clean and reusable UI logic

---

## ✔ Challenge 02 – Order Confirmation Modal

**Type:** Frontend (React)
**Status:** Completed

### 📌 Description

Replaced the default browser `alert()` with a fully custom order confirmation modal, allowing users to immediately access their order details.

### ✨ Features

* Fade-in modal with overlay
* Displays created order ID
* “View Order” and “Continue Shopping” actions
* Close via overlay click or Escape key
* Fully responsive

### 🧠 Implementation

* Reusable `OrderSuccessModal` component
* Controlled via React state
* Proper event cleanup
* No browser alerts used

---

## ✔ Challenge 02b – Order Details & Order Cancellation

**Type:** Full Stack
**Status:** Completed

### 📌 Description

Extended the order system to allow users to **view detailed order information** and **cancel pending orders**, ensuring data consistency and stock restoration.

---

### 🎨 Frontend (Challenge 02b)

* Implemented `OrderDetailsModal`
* Displays:

  * Order metadata (date, total, items)
  * Item list with quantities and prices
  * Visual status badge
* Allows cancellation **only for pending orders**
* Confirmation dialog before cancellation
* Modal closes via overlay click

---

### 🔧 Backend (Challenge 02b)

#### ✅ New Controller: `cancel_order`

**Behavior:**

* Validates order existence
* Allows cancellation only if status is `pending`
* Restores product stock
* Updates status to `cancelled`

```http
PUT /orders/{order_id}/cancel
```

**Errors handled:**

* `404` → Order not found
* `400` → Order cannot be cancelled

---

## ✔ Challenge 04 – Pagination for Products & Orders

**Type:** Backend (FastAPI)
**Status:** Completed

### 📌 Description

Implemented **server-side pagination** for products and orders to improve performance, scalability, and API usability when handling large datasets.

---

### 🔧 Backend Changes (Challenge 04)

* Introduced paginated response schemas:

  * `PaginatedProductResponse`
  * `PaginatedOrderResponse`
* Added pagination logic to product and order controllers
* Included pagination metadata in API responses

---

### ✅ Routes

```http
GET /products?page=1&limit=10
GET /orders?page=1&limit=3
```

---

## ✔ Challenge 05 – Order Workflow & Status Management

**Type:** Backend + Admin Workflow
**Status:** Completed

### 📌 Description

Implemented a **strict order workflow system** enforcing valid status transitions using backend validation and enums.

---

### 🔧 Backend Changes (Challenge 05)

* Introduced `OrderStatus` enum
* Added `OrderStatusUpdate` schema
* Implemented `update_order_status_controller`
* Enforced valid transitions only

```http
PATCH /orders/{order_id}/status
```

---

## ✔ Challenge 06 – Advanced Product Search, Filtering & Sorting

**Type:** Backend (FastAPI)
**Status:** Completed

### 📌 Description

Extended the product listing endpoint to support **advanced querying capabilities**, allowing clients to search, filter, sort, and paginate products efficiently.

This enhancement improves **API flexibility**, **frontend usability**, and **real-world scalability**.

---

### 🔧 Backend Changes (Challenge 06)

#### ✅ Controller Enhancements

The `get_all_products` controller was extended to support:

* **Text search** (name and description)
* **Price range filtering**
* **Dynamic sorting**
* **Sort order control**
* **Pagination compatibility**

Supported features:

* `search` → case-insensitive search on name & description
* `min_price` / `max_price` → numeric filtering
* `sort_by` → `price`, `name`, or `stock`
* `order` → `asc` or `desc`
* Default sorting by product name

All filters are composed dynamically using SQLAlchemy query chaining.

---

### ✅ Updated Route

```http
GET /products
```

#### Query Parameters

| Parameter   | Type   | Description                            |
| ----------- | ------ | -------------------------------------- |
| `page`      | int    | Page number (default: 1)               |
| `limit`     | int    | Items per page (default: 10, max: 100) |
| `search`    | string | Search term (name or description)      |
| `min_price` | float  | Minimum price filter                   |
| `max_price` | float  | Maximum price filter                   |
| `sort_by`   | string | `price`, `name`, or `stock`            |
| `order`     | string | `asc` or `desc`                        |

#### Example Request

```http
GET /products?search=shirt&min_price=10&max_price=50&sort_by=price&order=desc&page=1&limit=5
```

---

### 🧠 Benefits

* Efficient database querying
* Clean and extensible API design
* Frontend-ready filtering & sorting
* No breaking changes to pagination schema

---

## 🧠 Architecture & Design Decisions

### Backend

* Business rules enforced server-side
* Enums used to avoid invalid states
* Controllers isolated from routes
* Stock integrity preserved on cancellation
* Pagination, filtering, and sorting handled at database level

### Frontend

* Reusable modal components
* Clear UX states per order status
* Frontend cannot bypass backend rules
* Visual feedback aligned with order lifecycle

---

## 🧪 Testing

* Manual end-to-end testing via Docker
* Verified:

  * Order creation flow
  * Order cancellation and stock restoration
  * Valid and invalid status transitions
  * Pagination behavior
  * Product filtering, searching, and sorting
  * UI behavior across all order states

---

## 🐳 Running the Project

### Using Docker (Recommended)

```bash
docker-compose up --build
```

**Services:**

* Frontend: [http://localhost:3000](http://localhost:3000)
* Backend API: [http://localhost:8000](http://localhost:8000)
* API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)


---

## 📄 License

This project is for technical evaluation purposes only.


