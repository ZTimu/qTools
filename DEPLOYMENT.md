# QuickTools Deployment Guide

This guide provides instructions for deploying the QuickTools application to various hosting platforms.

## Prerequisites

1. A MongoDB Atlas account for database hosting
2. An account on your preferred hosting platform (Heroku, Render, Railway, etc.)
3. Git installed on your local machine

## Environment Variables

Before deployment, make sure to set up the following environment variables on your hosting platform:

- `PORT`: The port on which the application will run (usually set automatically by the hosting provider)
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: A strong secret key for JWT authentication

Refer to the `.env.example` file for all required environment variables.

## Deploying to Heroku

1. Install the Heroku CLI and log in:
   ```bash
   npm install -g heroku
   heroku login
   ```

2. Create a new Heroku app:
   ```bash
   heroku create quicktools-app
   ```

3. Set up environment variables:
   ```bash
   heroku config:set MONGODB_URI=your_mongodb_atlas_uri
   heroku config:set JWT_SECRET=your_strong_secret_key
   ```

4. Deploy the application:
   ```bash
   git push heroku main
   ```

5. Open the deployed application:
   ```bash
   heroku open
   ```

## Deploying to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the service:
   - Build Command: `npm install`
   - Start Command: `node server.js`
4. Add environment variables in the Render dashboard
5. Deploy the service

## Deploying to Railway

1. Create a new project on Railway
2. Connect your GitHub repository
3. Add environment variables in the Railway dashboard
4. Deploy the service

## File Storage Considerations

The current implementation stores converted files locally. For production, consider:

1. Using cloud storage services like AWS S3, Google Cloud Storage, or Azure Blob Storage
2. Implementing a CDN for faster file delivery
3. Setting up proper file cleanup to prevent storage overflow

## Database Considerations

1. Ensure your MongoDB Atlas cluster has appropriate security settings
2. Set up database backups
3. Consider using a connection pooling service for better performance

## Monitoring and Maintenance

1. Set up logging with services like Loggly or Papertrail
2. Configure monitoring with services like New Relic or Datadog
3. Set up alerts for application errors and performance issues

## Troubleshooting

If you encounter issues during deployment:

1. Check the logs on your hosting platform
2. Verify that all environment variables are correctly set
3. Ensure your MongoDB Atlas IP whitelist includes your hosting provider's IP ranges