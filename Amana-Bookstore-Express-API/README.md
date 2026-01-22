# Amana Bookstore Express API

Initial dataset and project structure for building a comprehensive Express.js REST API for the Amana Bookstore - a specialized academic bookstore focusing on science and educational texts.

## Project Overview

This repository contains the foundational data and structure for developing a modern bookstore API that will serve academic institutions, students, and researchers. The bookstore specializes in high-quality scientific and educational publications from renowned academic publishers.

## Current Project Structure

```
Amana-Bookstore-Express-API/
├── data/
│   ├── books.json          # Sample book catalog with detailed metadata
│   └── reviews.json        # Customer reviews and ratings
├── logging/
│   └── log.txt            # Application logging directory
├── server.js              # Express server entry point (to be developed)
└── README.md              # This file
```

## Sample Data Overview

### Books Dataset (`data/books.json`)

The books dataset contains **3 sample books** with comprehensive metadata including:

- **Academic Focus**: Physics, Quantum Mechanics, and Astrophysics textbooks
- **Detailed Metadata**: ISBN, genre, tags, publication info, pricing
- **Rich Content**: Descriptions, ratings, review counts, stock status
- **Featured Books**: Curated selection for homepage display

**Sample Book Structure:**
```json
{
  "id": "1",
  "title": "Fundamentals of Classical Mechanics",
  "author": "Dr. Ahmad Al-Kindi",
  "description": "A comprehensive introduction to classical mechanics...",
  "price": 89.99,
  "isbn": "978-0123456789",
  "genre": ["Physics", "Textbook"],
  "tags": ["Mechanics", "Physics", "University"],
  "datePublished": "2022-01-15",
  "pages": 654,
  "language": "English",
  "publisher": "Al-Biruni Academic Press",
  "rating": 4.8,
  "reviewCount": 23,
  "inStock": true,
  "featured": true
}
```

### Reviews Dataset (`data/reviews.json`)

The reviews dataset contains **11 sample reviews** with:

- **Verified Reviews**: Academic credibility with verification status
- **Detailed Feedback**: Professional reviews from educators and students
- **Rating System**: 5-star rating with detailed comments
- **Academic Authors**: Reviews from professors, doctors, and students

**Sample Review Structure:**
```json
{
  "id": "review-1",
  "bookId": "1",
  "author": "Dr. Yasmin Al-Baghdadi",
  "rating": 5,
  "title": "Excellent foundation for physics students",
  "comment": "Dr. Al-Kindi has created a comprehensive introduction...",
  "timestamp": "2024-01-15T10:30:00Z",
  "verified": true
}
```

## Planned API Features

Based on this initial dataset, the Express.js API will support:

### Core Functionality
- **Book Catalog Management**: CRUD operations for books
- **Review System**: Customer reviews and ratings
- **Search & Filtering**: By genre, author, price, availability
- **Featured Books**: Curated book recommendations
- **Inventory Management**: Stock tracking and availability

### Advanced Features
- **Academic Focus**: Specialized for educational institutions
- **Publisher Integration**: Support for multiple academic publishers
- **Verification System**: Verified reviews from academic professionals
- **Multi-language Support**: Currently English, expandable
- **Rating Analytics**: Comprehensive rating and review analytics

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Express.js framework

### Development Setup
1. Clone this repository
2. Install dependencies: `npm install express`
3. Develop the Express server in `server.js`
4. Use the sample data in `data/` for testing and development

### Recommended API Endpoints

```
GET    /api/books              # Get all books
GET    /api/books/:id          # Get specific book
GET    /api/books/featured     # Get featured books
GET    /api/books/search       # Search books
POST   /api/books              # Add new book
PUT    /api/books/:id          # Update book
DELETE /api/books/:id          # Delete book

GET    /api/reviews            # Get all reviews
GET    /api/reviews/book/:id   # Get reviews for specific book
POST   /api/reviews            # Add new review
PUT    /api/reviews/:id        # Update review
DELETE /api/reviews/:id        # Delete review
```

## Data Characteristics

### Academic Publishers Featured
- Al-Biruni Academic Press
- Ibn Sina Publications  
- Al-Sufi Astronomical Society

### Subject Areas
- Classical Mechanics
- Quantum Physics
- Astrophysics and Astronomy
- Advanced Physics

### Price Range
- $89.99 - $125.50 (Academic textbook pricing)

## Next Steps

1. **Server Development**: Implement Express.js server with routing
2. **Database Integration**: Migrate JSON data to MongoDB/PostgreSQL
3. **Authentication**: Add user authentication and authorization
4. **API Documentation**: Create comprehensive API documentation
5. **Testing**: Implement unit and integration tests
6. **Deployment**: Configure for production deployment

## Contributing

This is an initial dataset for development purposes. The data represents a specialized academic bookstore focusing on scientific publications and educational materials.

## License

This project is intended for educational and development purposes.