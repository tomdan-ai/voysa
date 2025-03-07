const { Sequelize } = require('sequelize');
require('dotenv').config();

// Use PostgreSQL
const sequelize = new Sequelize(
  process.env.DB_NAME || 'voysa', 
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  }
);

// Define models
const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.Token = require('./token')(sequelize, Sequelize);

module.exports = db;
