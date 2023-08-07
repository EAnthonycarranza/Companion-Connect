const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const fs = require('fs');
const sequelize = require('../config/connection');

// Just require the User model, don't call it as a function
const User = require('./User');
const PetPhoto = require('./PetPhoto');

// Assuming you have associations to define, you can do it here
// For example, if you have a one-to-many association between User and PetPhoto:
User.hasMany(PetPhoto, {
  foreignKey: 'user_id',
});
PetPhoto.belongsTo(User, {
  foreignKey: 'user_id',
});

fs.readdirSync(path.join(__dirname))
  .filter(file => file !== 'index.js') // Exclude index.js from the list
  .forEach(file => {
    const model = require(path.join(__dirname, file));
    // Define associations or any other logic specific to each model if needed
  });

module.exports = {
  User,
  PetPhoto,
  // Export other models here
};
