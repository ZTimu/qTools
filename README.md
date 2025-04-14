# QuickTools

QuickTools is a web application that provides various utility tools for developers, now with a separated frontend and backend architecture.

## Project Structure

The project is now organized into two main parts:
- **Backend**: RESTful API server built with Express.js and MongoDB
- **Frontend**: Server-side rendered application using Express and Handlebars

```
quickTools/
├── backend/            # Backend API server
│   ├── src/
│   │   ├── config/     # Configuration files
│   │   ├── controllers/# Route controllers
│   │   ├── middleware/ # Custom middleware
│   │   ├── models/     # Database models
│   │   ├── routes/     # API routes
│   │   ├── uploads/    # File uploads
│   │   └── server.js   # Entry point
│   ├── .env            # Environment variables
│   └── package.json    # Dependencies
│
├── frontend/           # Frontend server
│   ├── public/         # Static files (CSS, client-side JS)
│   ├── src/
│   │   ├── components/ # Reusable view components
│   │   ├── views/      # Handlebars templates
│   │   └── js/         # Frontend JavaScript
│   ├── .env            # Environment variables
│   ├── index.js        # Entry point
│   └── package.json    # Dependencies
│
└── package.json        # Root package for running both services
```

## Features

- User authentication (login/register)
- Various tools including:
  - PDF to Word converter
  - Image to text extractor
  - Temperature/mass converter
  - QR code generator
  - Calculator

## Installation

```bash
# Install all dependencies (backend, frontend, and root)
npm run install:all

# Create .env files in both backend and frontend directories
# Example backend/.env:
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000

# Example frontend/.env:
FRONTEND_PORT=3000
BACKEND_URL=http://localhost:5000
```

## Running the Application

```bash
# Development mode (runs both frontend and backend with hot reloading)
npm run dev

# Run only the backend
npm run dev:backend

# Run only the frontend
npm run dev:frontend
```

## Technologies Used

- **Backend**:
  - MongoDB
  - Express.js
  - Node.js
  - JWT authentication
  - Various processing libraries

- **Frontend**:
  - Express.js
  - Handlebars templating
  - Vanilla JavaScript

## License

MIT