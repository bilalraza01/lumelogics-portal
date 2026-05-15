# Production image for the Lumelogics admin portal (Next.js 16).
#
# NEXT_PUBLIC_* is inlined into the bundle at `next build`, so the production
# URLs MUST be supplied as build args — they cannot be injected at runtime.
#   docker build \
#     --build-arg NEXT_PUBLIC_API_URL=https://api.lumelogics.com \
#     --build-arg NEXT_PUBLIC_FRONTEND_URL=https://lumelogics.com .

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_FRONTEND_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_FRONTEND_URL=$NEXT_PUBLIC_FRONTEND_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "run", "start"]
