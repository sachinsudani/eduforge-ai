export default () => ({
    port: parseInt(process.env.PORT || '3001', 10),
    jwt: {
        secret: process.env.JWT_SECRET || 'dev-secret',
        expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    },
    mongo: {
        uri: process.env.MONGO_URI || 'mongodb://root:rootpassword@localhost:27017',
        dbName: process.env.MONGO_DB || 'eduforge'
    },
    redis: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT || '6379', 10)
    }
})
