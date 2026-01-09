---

# 🛒 E-commerce Full Stack Challenge – Submission

## 📌 Overview

This repository contains my solution to selected challenges from the **E-commerce Full Stack Challenge**, built using **React**, **FastAPI**, and **PostgreSQL**.

The focus of this submission is improving **user experience and visual feedback** for critical e-commerce actions, following clean code principles, reusable component design, and production-ready practices.

---

## ✅ Completed Challenges

### ✔ Challenge 01 – Add to Cart Animation (Frontend)

**Type:** Frontend (React)
**Status:** Completed

**Description:**
Implemented a smooth and responsive visual feedback animation when a product is added to the cart, improving clarity and user confidence during interactions.

**Features implemented:**

* Button scale animation on click (0.95x)
* Color transition from primary blue to success green
* Animated checkmark icon
* Automatic reset after ~600ms
* Supports rapid multiple clicks without breaking state

**Implementation details:**

* Animation state handled via React state (`addedItems`)
* Per-product animation tracking to avoid global UI conflicts
* Button temporarily disabled during animation
* No external animation libraries used

---

### ✔ Challenge 02 – Order Confirmation Modal (Frontend)

**Type:** Frontend (React)
**Status:** Completed

**Description:**
Replaced the default browser `alert()` after order creation with a fully custom modal component that provides a better user experience.

**Features implemented:**

* Custom modal with fade-in animation
* Semi-transparent overlay
* Displays the created order ID
* “View Order” and “Continue Shopping” actions
* Close modal via overlay click or Escape key
* Fully responsive design

**Implementation details:**

* Modal extracted into a reusable component (`OrderSuccessModal`)
* Modal visibility and content controlled via React state
* Proper keyboard event handling with cleanup
* No browser alerts used

---

## 🏗️ Architecture & Design Decisions

### Frontend

* React hooks for state management and side effects
* Reusable UI components for modals and buttons
* Clear separation between UI logic and API communication
* Localized animation state to minimize unnecessary re-renders

### UX Considerations

* Immediate visual feedback on critical actions
* Non-blocking confirmation after order creation
* Clear navigation paths for next user actions

---

## 🧪 Testing

* Manual end-to-end testing using Docker
* Verified:

  * Multiple rapid add-to-cart interactions
  * Order creation flow and modal behavior
  * Modal close via all supported methods
  * Responsive layout on different screen sizes

---

## 🐳 Running the Project

### Using Docker (Recommended)

```bash
docker-compose up --build
```

**Available services:**

* Frontend: [http://localhost:3000](http://localhost:3000)
* Backend API: [http://localhost:8000](http://localhost:8000)
* API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📌 Assumptions

* Authentication is not required for this submission
* Order success modal is shown immediately after a successful API response
* UI behavior follows provided mockups, prioritizing functionality over custom styling

---

## 🚧 Future Improvements

* Implement authentication system (Challenge 03)
* Add order detail view (Challenge 02b)
* Improve accessibility (ARIA roles, focus trapping)
* Add automated frontend tests
* Migrate frontend to TypeScript

---

## 📄 License

This project is for technical evaluation purposes only.

---

