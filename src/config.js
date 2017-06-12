import Neo4j from './neo4j';

export default {
    neo4j: new Neo4j(true),
    cors: require('../config/cors')
};