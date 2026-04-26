# Use an official Node.js runtime as a parent image
FROM node:20-slim AS base

# Set the working directory
WORKDIR /app

# Install dependencies first (to leverage Docker cache)
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the frontend
RUN npm run build

# Production image
FROM node:20-slim AS production

WORKDIR /app

# Copy only the necessary files from the base stage
COPY --from=base /app/package*.json ./
RUN npm install --omit=dev

COPY --from=base /app/server.js ./
COPY --from=base /app/gemini.js ./
COPY --from=base /app/middleware ./middleware
COPY --from=base /app/models ./models
COPY --from=base /app/utils ./utils
COPY --from=base /app/dist ./dist

# Expose the port the app runs on
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Run the server
CMD ["node", "server.js"]
