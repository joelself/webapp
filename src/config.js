import Neo4j from './neo4j';

export default {
  neo4j: new Neo4j(),
  cors: require('../config/cors')
};