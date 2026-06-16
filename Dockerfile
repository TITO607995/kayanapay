FROM node:20-alpine

WORKDIR /app

# Install dependencies terlebih dahulu (biar di-cache sama Docker)
COPY package*.json ./
RUN npm install

# Copy sisa file project
COPY . .

# Expose port untuk Next.js
EXPOSE 3000

# Gunakan mode DEV agar kode otomatis update saat disave
CMD npm run build && npm start
# Atau perintah start production kamu sebelumnya