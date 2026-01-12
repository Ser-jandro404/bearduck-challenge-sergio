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

#### ✅ New Paginated Response Schemas

Introduced paginated response models using Pydantic:

* `PaginatedProductResponse`
* `PaginatedOrderResponse`

Each response includes:

* `items` → current page data
* `total` → total records in database
* `page` → current page number
* `limit` → items per page
* `pages` → total available pages

This ensures:

* Predictable API responses
* Frontend-friendly pagination metadata
* Clean separation of concerns

---

#### ✅ Controller Updates

Pagination logic was added to both controllers:

##### Products

```python
def get_all_products(db: Session, page: int = 1, limit: int = 10)
```

##### Orders

```python
def get_all_orders(db: Session, page: int = 1, limit: int = 10)
```

**Key behaviors:**

* Offset calculation using `(page - 1) * limit`
* Total count queries for accurate pagination
* Ordered results for orders (latest first)
* Prevents loading all records at once

---

#### ✅ Routes

##### Products

```http
GET /products?page=1&limit=10
```

##### Orders

```http
GET /orders?page=1&limit=3
```

**Validation rules:**

* `page >= 1`
* `limit <= 100`

---

## ✔ Challenge 05 – Order Workflow & Status Management

**Type:** Backend + Admin Workflow
**Status:** Completed

### 📌 Description

Implemented a **strict order workflow system** enforcing valid status transitions using backend validation and enums.

---

### 🔧 Backend Changes (Challenge 05)

#### ✅ Schema Updates (Pydantic)

Order schemas were extended to support controlled status transitions.

##### 🔹 New Enum: `OrderStatus`

```text
pending → processing → successful
                    → failed
                    → cancelled
```

Supported statuses:

* `pending`
* `processing`
* `successful`
* `cancelled`
* `failed`

This ensures:

* Strong typing
* Invalid statuses are rejected
* Safer API contracts

---

#### 🔹 New Schema: `OrderStatusUpdate`

Used to validate PATCH requests:

```json
{
  "status": "processing"
}
```

---

### ✅ New Controller: `update_order_status_controller`

Implements a finite-state workflow using strict transition rules:

```python
VALID_TRANSITIONS = {
  "pending": ["processing", "cancelled"],
  "processing": ["successful", "failed", "cancelled"],
  "successful": [],
  "cancelled": [],
  "failed": []
}
```

**Responsibilities:**

* Validate order existence
* Prevent invalid transitions
* Apply allowed transitions only
* Return meaningful error messages

---

### ✅ New Route

```http
PATCH /orders/{order_id}/status
```

**Behavior:**

* Validates request body via schema
* Enforces workflow rules
* Returns updated order
* Rejects invalid transitions (`400`)

---

## 🧠 Architecture & Design Decisions

### Backend

* Business rules enforced server-side
* Enums used to avoid invalid states
* Controllers isolated from routes
* Stock integrity preserved on cancellation
* Pagination handled at database level

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

---



