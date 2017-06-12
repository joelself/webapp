FROM node:8.1.0
RUN mkdir -p /usr/src/app
RUN mkdir -p /usr/src/app/neo4j-pop
WORKDIR /usr/src/app/neo4j-pop
COPY ./neo4j-pop/package.json /usr/src/app/neo4j-pop
RUN npm install
COPY ./neo4j-pop /usr/src/app/neo4j-pop
WORKDIR /usr/src/app
COPY ./package.json /usr/src/app/
RUN npm install
COPY ./ /usr/src/app
EXPOSE 8000
EXPOSE 9000
EXPOSE 9001
CMD ["npm", "start"]