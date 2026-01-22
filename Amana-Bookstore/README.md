

# Amana Bookstore

**Deployed Link:** [https://amana-bookstore-kwxeqfm6b-rjs-projects-2b8d78ca.vercel.app/](https://amana-bookstore-kwxeqfm6b-rjs-projects-2b8d78ca.vercel.app/)

## Project Overview

Amana Bookstore is a full-stack web application built with **Next.js** and **MongoDB Atlas**. It allows users to browse books, view detailed information, read **reviews**, and manage a shopping cart. The application uses server-side API routes to interact with the database and provides a responsive, user-friendly interface.

### Features

* **Book Listings:** View all available books with title, author, and price.
* **Book Details & Reviews:** Click on a book to see detailed information and user-submitted reviews.
* **Shopping Cart:** Add books to a cart, update quantities, or remove items.
* **MongoDB Atlas Integration:** All data is stored and retrieved from a cloud MongoDB database for persistence.

### Technologies Used

* **Next.js (App Router, React 18+)** – Frontend framework and server-side API routes.
* **TypeScript** 
* **MongoDB Atlas** – Cloud-based NoSQL database for storing books, reviews, and cart items.
* **Tailwind CSS** – Styling framework for a clean, responsive design.

### Database Structure

* **Books Collection:** Contains book details such as title, author, price, and ID.
* **Reviews Collection:** Stores reviews for each book linked by `bookId`.
* **Cart Collection:** Stores user-selected books and quantities.

### Local Setup

1. Clone the repository:

   ```bash
   git clone <repo-url>
   cd amana-bookstore
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Create a `.env` file in the root with your MongoDB connection string:

   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/amanaDB
   ```
4. Seed the database (optional, for sample data):

   ```bash
   npx ts-node --project tsconfig.seed.json src/app/scripts/seed.ts
   ```
5. Run the development server:

   ```bash
   npm run dev
   ```

### Deployment

The project is deployed on **Vercel**. Environment variables like `MONGODB_URI` must be set in the Vercel dashboard under the project settings for the application to connect to MongoDB Atlas.

---

