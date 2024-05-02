module.exports = {
    HOST: 'localhost',
    USER: 'root',
    PASSWORD: '',
    DB: 'node_sequelize_api_db',
    dialect: 'mysql',

    pool: {
        max:5,
        min: 0,
        acquire: 300000,
        idle: 10000
    }
}