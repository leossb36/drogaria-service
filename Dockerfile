# Use a Node.js base image
FROM node:22.4.1

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

EXPOSE 3000

# Command to run the application
CMD ["node", "dist/main"]