# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json ./
COPY server/package.json ./server/

# Install all dependencies
RUN npm install

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Production stage
FROM oven/bun:1-alpine

WORKDIR /app

# Copy package files
COPY package.json ./
COPY server/package.json ./server/

# Install production dependencies
RUN bun install --production

# Copy built frontend and server code
COPY --from=builder /app/build ./build
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/public ./public

# Create config directory
RUN mkdir -p /config

# Expose ports
EXPOSE 3000 3001

# Set environment variables
ENV NODE_ENV=production
ENV CONFIG_PATH=/config/config.json
ENV PROXY_PORT=3001
ENV PORT=3000

# Create startup script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'bun /app/server/src/index.ts &' >> /app/start.sh && \
    echo 'cd /app && bun run start' >> /app/start.sh && \
    echo 'wait' >> /app/start.sh && \
    chmod +x /app/start.sh

# Start both services
CMD ["sh", "/app/start.sh"]