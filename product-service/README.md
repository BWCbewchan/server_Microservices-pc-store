# Product Service Microservice

This is a microservice for managing products in the PC Store application.

## Features

- Product CRUD operations
- Image upload with Cloudinary
- Input validation
- Error handling
- API documentation
- Security measures
- Monitoring and logging

## Prerequisites

- Node.js >= 14
- MongoDB
- npm or yarn

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd product-service
```

2. Install dependencies
```bash
npm install
```

3. Create .env file
```bash
cp .env.example .env
```

4. Update environment variables in .env file
```
PORT=4004
MONGODB_URI=your_mongodb_uri
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:2000
FRONTEND_URL_2=http://localhost:5173
```

## Development

Start the development server:
```bash
npm run dev
```

## Testing

Run tests:
```bash
npm test
```

## Code Quality

Lint code:
```bash
npm run lint
```

Fix linting issues:
```bash
npm run lint:fix
```

Format code:
```bash
npm run format
```

## API Documentation

API documentation is available at `/api-docs` when the server is running.

## Docker

Build the image:
```bash
docker build -t product-service .
```

Run the container:
```bash
docker run -p 4004:4004 product-service
```

## Directory Structure

```
.
├── config/             # Configuration files
├── controllers/        # Route controllers
├── middleware/         # Custom middleware
├── models/            # Database models
├── routes/            # API routes
├── tests/             # Test files
├── utils/             # Utility functions
├── app.js             # Application entry point
└── README.md          # This file
```

## Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Create a Pull Request

## License

This project is licensed under the MIT License. 