# Rregullo Tiranen Backend

This is the backend server for the Rregullo Tiranen application, a platform for reporting city problems in Tirana, Albania.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)

## Installation

1. Install dependencies:
```
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
```

Replace `your_mongodb_connection_string` with your actual MongoDB connection string. For MongoDB Atlas, it will look like:
```
mongodb+srv://username:password@cluster-name.mongodb.net/rregullo_tiranen?retryWrites=true&w=majority
```

## Database Setup

### Option 1: MongoDB Atlas (Recommended)

Follow the instructions in the [MongoDB Atlas Setup Guide](../docs/mongodb-atlas-setup.md) to create a cloud-hosted MongoDB database.

### Option 2: Local MongoDB

If you prefer to use a local MongoDB installation:

1. Install MongoDB on your system
2. Start the MongoDB service
3. Update the `.env` file with your local connection string:
```
MONGO_URI=mongodb://localhost:27017/rregullo_tiranen
```

## Initialize the Database

To populate the database with sample data for development:

```
npm run init-db
```

This will create:
- Sample users (admin and regular user)
- Sample reports
- Sample notifications

## Running the Server

### Development Mode

```
npm run dev
```

The server will start on http://localhost:5000 (or the port specified in your .env file) with hot reloading enabled.

### Production Mode

```
npm start
```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update user password
- `PUT /api/auth/notifications` - Update notification settings

### Reports Endpoints

- `GET /api/reports` - Get all reports
- `GET /api/reports/:id` - Get a single report
- `POST /api/reports` - Create a new report
- `PUT /api/reports/:id` - Update a report
- `DELETE /api/reports/:id` - Delete a report
- `PUT /api/reports/:id/status` - Update report status
- `POST /api/reports/:id/comments` - Add a comment to a report
- `GET /api/reports/user` - Get current user's reports
- `GET /api/reports/radius/:lat/:lng/:distance` - Get reports within a radius

### Notifications Endpoints

- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id` - Mark notification as read
- `DELETE /api/notifications/:id` - Delete notification
- `PUT /api/notifications/read-all` - Mark all notifications as read

## License

ISC
