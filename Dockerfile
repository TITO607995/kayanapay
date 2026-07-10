FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (Lakukan sekali di sini)
RUN npm install

# Copy sisa project
COPY . .

# Build aplikasinya (Lakukan sekali di sini)
RUN npm run build

# Expose port
EXPOSE 3000

# Langsung jalankan aplikasinya
CMD ["npm", "start"]