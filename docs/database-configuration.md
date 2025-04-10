# Database Configuration Guide for Rregullo Tiranen

This guide explains how to configure the database connection for the Rregullo Tiranen application.

## Environment Variables

The application uses environment variables to configure the database connection. These are stored in a `.env` file in the `backend` directory.

### Required Variables

- `MONGO_URI`: The MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `JWT_EXPIRE`: JWT token expiration time (e.g., "30d" for 30 days)
- `PORT`: The port on which the server will run (default: 5000)

## Configuration for Different Environments

### Development Environment

For development, you can use either a local MongoDB instance or MongoDB Atlas:

#### Local MongoDB:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/rregullo_tiranen
JWT_SECRET=dev_secret_key
JWT_EXPIRE=30d
```

#### MongoDB Atlas:
```
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster-name.mongodb.net/rregullo_tiranen?retryWrites=true&w=majority
JWT_SECRET=dev_secret_key
JWT_EXPIRE=30d
```

### Production Environment

For production, it's recommended to use MongoDB Atlas with a more secure configuration:

```
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster-name.mongodb.net/rregullo_tiranen?retryWrites=true&w=majority
JWT_SECRET=long_random_string_for_production
JWT_EXPIRE=30d
NODE_ENV=production
```

## Switching Between Environments

To switch between different environments, you can:

1. Modify the `.env` file directly
2. Use different `.env` files for different environments (e.g., `.env.development`, `.env.production`)
3. Set environment variables through your hosting platform (recommended for production)

## Database Connection in Code

The database connection is handled in `backend/src/config/db.js`. The connection options are:

```javascript
mongoose.connect(config.mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
```

## Troubleshooting Connection Issues

If you encounter database connection issues:

1. Verify your MongoDB instance is running (if using local MongoDB)
2. Check your network connection
3. Ensure your IP address is whitelisted in MongoDB Atlas Network Access settings
4. Verify your username and password are correct
5. Check the MongoDB connection string format

## Database Initialization

To initialize the database with sample data:

```
npm run init-db
```

This script:
1. Connects to the database using the connection string from your `.env` file
2. Clears existing data (use with caution in production)
3. Creates sample users, reports, and notifications

## Database Backup and Restore

### Backup

To backup your MongoDB database:

```
mongodump --uri="your_connection_string" --out=./backup
```

### Restore

To restore your MongoDB database from a backup:

```
mongorestore --uri="your_connection_string" --dir=./backup
```

## MongoDB Atlas Specific Configuration

If using MongoDB Atlas:

1. Set up database alerts for monitoring
2. Configure auto-scaling if needed
3. Set up database users with appropriate permissions
4. Enable database auditing for security
5. Configure backup schedule

## Data Migration

For data migration between environments:

1. Use the MongoDB export/import tools
2. Create migration scripts using Mongoose
3. Use a database migration library like `mongoose-data-migrate`
