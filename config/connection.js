const Sequelize = require('sequelize');
const config = require('./config');

let sequelize;

if (process.env.JAWSDB_URL) {
  sequelize = new Sequelize(process.env.JAWSDB_URL);
} else {
  const envConfig = config[process.env.NODE_ENV || "development"];
  sequelize = new Sequelize(envConfig.database, envConfig.username, envConfig.password, {
    host: envConfig.host,
    dialect: envConfig.dialect,
    port: 3306
  });
}

module.exports = sequelize;
