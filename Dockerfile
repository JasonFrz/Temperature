# Build stage for frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Production stage for backend + served frontend
FROM node:22-alpine
WORKDIR /app

# Copy built frontend from previous stage (to /app/frontend/dist)
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Setup backend
COPY api/ ./api/
WORKDIR /app/api
RUN npm install --production

ENV PORT=5000
EXPOSE $PORT
CMD ["node", "index.js"]
