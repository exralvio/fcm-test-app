const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const sequelizeConfig = require('../config/sequelize');
const basename = path.basename(__filename);

const env = process.env.NODE_ENV || 'development';
const config = sequelizeConfig[env];

// Initialize Sequelize instance (this is what sequelize-cli expects)
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    pool: config.pool,
    logging: config.logging,
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: false
    }
  }
);

const models = {};

// Read all model files and load them
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    models[model.name] = model;
  });

// Run associations if defined
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;

