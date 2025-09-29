FROM node:22.17.0
RUN DEBIAN_FRONTEND=noninteractive apt update -y && apt dist-upgrade -y && apt clean
RUN mkdir /app
COPY . /app
WORKDIR /app
RUN npm install
ENV PATH=/app/node_modules/.bin:$PATH
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]