FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000
COPY server.js views.js site.config.json ./
COPY public ./public
COPY --chown=node:node data ./data
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:3000/healthz >/dev/null || exit 1
USER node
CMD ["node", "server.js"]
