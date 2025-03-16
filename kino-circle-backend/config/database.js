const Sequelize = require('sequelize');
const config = require('./config.json')['development']; // Используем development-конфигурацию

const sequelize = new Sequelize(config.database, config.username, config.password, {
    dialect: config.dialect,
    storage: config.storage,
    logging: config.logging
});

module.exports = sequelize;