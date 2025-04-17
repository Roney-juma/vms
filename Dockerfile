# Use Node image
FROM node:20.17.0

# Create app directory
WORKDIR /src

# Copy only package files first for better caching
COPY package*.json ./

# Install dependencies (in container)
RUN npm ci --omit=dev

# Copy the rest of the app
COPY . .

# Expose the port your app runs on
EXPOSE 3800

# Start the app
CMD ["npm", "run", "dev"]
