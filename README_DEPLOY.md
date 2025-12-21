# Deployment Guide for OWOO Social AI Scheduler

This project is configured for deployment on Vercel.

## Prerequisites

1.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).
2.  **GitHub Repository**: Push this code to a GitHub repository.
3.  **MongoDB Database**: You need a cloud database.
    *   **Free Option**: Sign up for [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
    *   Create a **Shared Cluster** (Free Tier / M0).
    *   Create a database user (save the username and password).
    *   Go to "Network Access" and allow access from anywhere (`0.0.0.0/0`).
    *   Get your connection string (select "Connect your application"). It will look like: `mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/?retryWrites=true&w=majority`.

## Deployment Steps

1.  **Login to Vercel**: Go to your Vercel dashboard.
2.  **Add New Project**: Click "Add New..." -> "Project".
3.  **Import Repository**: Select the GitHub repository you just pushed.
4.  **Configure Project**:
    *   **Framework Preset**: Vercel should automatically detect "Vite".
    *   **Root Directory**: Leave as `./` (Project Root).
    *   **Build Command**: `npm run build` (This runs the root build script which builds both client and server).
    *   **Output Directory**: `client/dist` (This is where Vite outputs the frontend).
    *   **Environment Variables**: Add the following variables (copy from your `.env` file):
        *   `MONGO_URI`: Your MongoDB connection string.
        *   `JWT_SECRET`: Your secret key for JWT.
        *   `PAYSTACK_SECRET_KEY`: Your Paystack secret key.
        *   `OPENAI_API_KEY`: Your OpenAI API key.
        *   `CLIENT_URL`: The URL of your deployed frontend (e.g., `https://your-project.vercel.app`).
        *   `NODE_ENV`: Set to `production`.

5.  **Deploy**: Click "Deploy".

## Post-Deployment

*   **Verify Routes**: Check that pages load and API calls (like Login or Dashboard) work correctly.
*   **Database**: Ensure your MongoDB Atlas (or other provider) allows connections from anywhere (`0.0.0.0/0`) or whitelist Vercel IP addresses.

## Troubleshooting

*   **API 404 Errors**: Ensure `vercel.json` is in the root directory. It handles routing API requests to the server and other requests to the client.
*   **CORS Issues**: The `vercel.json` rewrites should handle this, but if you see CORS errors, ensure your backend allows the Vercel domain.
