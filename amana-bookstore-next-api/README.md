



# Amana Bookstore Next.js API

A **Next.js Serverless API** for managing books and reviews, deployed on Vercel.

**Deployed URL:** [https://amana-bookstore-next-api-peach.vercel.app/api](https://amana-bookstore-next-api-peach.vercel.app/api)

---

## Features

* Get all books or a single book by ID
* Get top-rated books (rating × reviewCount)
* Get featured books
* Get books published in a date range
* Get all reviews for a book
* Add new books and reviews (authenticated)

---

## Tech Stack

* **Next.js 13+** — Serverless API routes
* **Node.js** — Backend runtime
* **Vercel** — Deployment platform

---

## Authentication

* **Header-based auth**: Include `x-user` with one of the authorized usernames in the request header. 
* Only requests with a valid `x-user` value are allowed to **POST books or reviews**.

---



## API Routes

* **GET /books** — All books
* **GET /books/:id** — Single book
* **GET /books/:id/reviews** — All reviews for a book
* **GET /books/top-rated** — Top 10 rated books
* **GET /books/featured** — Featured books
* **GET /books/published?start=YYYY-MM-DD&end=YYYY-MM-DD** — Books by date range
* **POST /books** — Add a new book (requires auth)
* **POST /books/:id/reviews** — Add a new review (requires auth)

---

## Getting Started

```bash
git clone https://github.com/your-username/amana-bookstore-next-api.git
cd amana-bookstore-next-api
npm install
npm run dev
```

---


