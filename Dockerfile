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
# Copy root package.json for backend dependencies
COPY package*.json ./
RUN npm install --production
# Copy backend source
COPY api/ ./api/
# Copy built frontend from previous stage
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 5000
CMD ["node", "api/index.js"]
