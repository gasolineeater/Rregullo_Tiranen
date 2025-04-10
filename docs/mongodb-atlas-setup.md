# MongoDB Atlas Setup Guide for Rregullo Tiranen

This guide will walk you through setting up a MongoDB Atlas cluster for the Rregullo Tiranen application.

## Step 1: Create a MongoDB Atlas Account

1. Go to [MongoDB Atlas Registration Page](https://www.mongodb.com/cloud/atlas/register)
2. Fill in your information and create an account
3. Choose the "Free" option when prompted

## Step 2: Create a New Cluster

1. After logging in, click "Build a Database"
2. Select the "FREE" tier option
3. Choose a cloud provider (AWS, Google Cloud, or Azure) and a region closest to your users (Europe for Albania)
4. Name your cluster "rregullo-tiranen-cluster"
5. Click "Create Cluster" (this may take a few minutes to provision)

## Step 3: Set Up Database Access

1. In the left sidebar, click on "Database Access" under SECURITY
2. Click "Add New Database User"
3. Choose "Password" for Authentication Method
4. Enter a username (e.g., "rregullo-admin")
5. Either enter a secure password or click "Autogenerate Secure Password" (make sure to save this password)
6. Under "Database User Privileges", select "Atlas admin"
7. Click "Add User"

## Step 4: Set Up Network Access

1. In the left sidebar, click on "Network Access" under SECURITY
2. Click "Add IP Address"
3. For development, you can click "Allow Access from Anywhere" (not recommended for production)
4. Alternatively, add your specific IP address
5. Click "Confirm"

## Step 5: Get Your Connection String

1. In the left sidebar, click on "Database" under DEPLOYMENT
2. Click "Connect" on your cluster
3. Select "Connect your application"
4. Choose "Node.js" as your driver and the appropriate version
5. Copy the connection string provided
6. Replace `<password>` in the connection string with your database user's password
7. Replace `myFirstDatabase` with `rregullo_tiranen`

## Step 6: Update Your Environment Variables

1. Open the `.env` file in the `backend` directory of your project
2. Update the `MONGO_URI` variable with your connection string:

```
MONGO_URI=mongodb+srv://rregullo-admin:<password>@rregullo-tiranen-cluster.mongodb.net/rregullo_tiranen?retryWrites=true&w=majority
```

## Step 7: Test the Connection

1. Start your backend server:
```
cd backend
npm run dev
```

2. Check the console output for a successful connection message:
```
MongoDB Connected: rregullo-tiranen-cluster.mongodb.net
```

## Troubleshooting

If you encounter connection issues:

1. Verify your IP address is in the allowed list in Network Access
2. Double-check your username and password
3. Ensure you've replaced `<password>` in the connection string with your actual password
4. Check that the database name is correct (`rregullo_tiranen`)

## Next Steps

Once your database is connected, the application will automatically create the necessary collections (users, reports, notifications) as they are used.

For development purposes, you may want to create some initial data. You can use the MongoDB Atlas interface to manually create documents or use the application's API to create test data.
