# Use the official Node.js image as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Build tsc
RUN npm run build

# Expose the port the app will run on
EXPOSE 8080

# Command to run the application
CMD [ "npm", "start" ]
