# Use Node.js image as base
FROM node:18 AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Start a new stage to keep the production image minimal
FROM node:18

# Set working directory
WORKDIR /app

# Copy built files from the previous stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Expose port (adjust if your NestJS app runs on a different port)
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "start:prod"]
