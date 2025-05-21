# Accessing the Microservices Monitoring Dashboard

## Local Development Environment
If you're running the services locally:
http://localhost:3000/status

## Production Environment
If you're using the Render deployment:
https://kt-tkpm-project-api-gateway.onrender.com/status

## How It Works
1. The dashboard makes requests to each service's `/health` endpoint to check status
2. The URLs are fetched dynamically from the API Gateway's configuration
3. Services are pinged at your selected interval to keep them alive on Render's free tier
4. You can manually trigger pings by clicking the "Ping" button for individual services
