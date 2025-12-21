# Deployment Guide

This repository is configured for deployment on Vercel.

## Vercel Configuration

- **Framework Preset:** Other
- **Build Command:** `npm run build`
- **Output Directory:** (default)
- **Root Directory:** (default/root)

## Environment Variables

Ensure all environment variables from `.env.example` are added to Vercel.

## Troubleshooting

If the build fails, check the logs for:
1. Missing `index.html` (should be fixed in latest commits)
2. Environment variable issues

(Triggering new deployment: v2)
