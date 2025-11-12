# Use specific Node version with Alpine for smaller image size
FROM node:20-alpine

EXPOSE 3000

# Create app directory
WORKDIR /home/node/app

# Install global dependencies
RUN yarn global add serve @angular/cli

# Copy package files first for better caching
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy application code
COPY ./ ./

# Build the application
RUN ng build --configuration production

# Use non-root user for security
USER node

# Start the application
ENTRYPOINT ["serve", "dist/sanakampa/", "-l", "3000"]
