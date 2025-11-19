# Use an official Node.js runtime as a parent image
FROM node:20-alpine AS builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
# If you use yarn, replace with: COPY yarn.lock ./ && yarn install --frozen-lockfile
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Copy built assets from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/next.config.js ./
# COPY --from=builder /app/node_modules ./node_modules # Not always needed if dependencies are bundled or handled differently in production

# Expose the port the app runs on
EXPOSE 3000

# Define environment variable
ENV NODE_ENV production
# ENV NEXT_PUBLIC_API_URL http://backend:5001/api # Example, ensure this is set if your app needs it

# Start the Next.js application
# The default command for Next.js is `next start` but package.json might have `npm run start`
# Check your package.json scripts. Assuming `npm run start` is `next start`.
CMD ["npm", "run", "start"]
