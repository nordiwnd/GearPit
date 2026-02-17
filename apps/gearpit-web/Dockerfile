FROM node:20-alpine

WORKDIR /app

# Install dependencies based on lockfile
COPY package*.json ./
COPY apps/gearpit-web/package*.json ./apps/gearpit-web/

# We need to install dependencies in the root context if it's a monorepo setup, 
# or just inside the app if isolated.
# Since we have a root package.json (maybe not? check), let's assume we run npm install inside apps/gearpit-web
# correct approach for standalone nextjs app inside monorepo structure without workspace tools:

WORKDIR /app/apps/gearpit-web
COPY apps/gearpit-web/package*.json ./
RUN npm install

CMD ["npm", "run", "dev"]
