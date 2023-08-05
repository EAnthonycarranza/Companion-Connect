const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const fs = require('fs');

const sequelize = new Sequelize('database_name', 'username', 'password', {
  host: 'localhost',
  dialect: 'mysql',
});

// Just require the User model, don't call it as a function
const User = require('./User');

fs.readdirSync(path.join(__dirname))
  .filter(file => file !== 'index.js') // Exclude index.js from the list
  .forEach(file => {
    const model = require(path.join(__dirname, file));
    // Define associations or any other logic specific to each model if needed
  });

module.exports = {
  User,
  // Export other models here
};
