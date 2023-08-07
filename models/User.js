const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');
const PetPhoto = require('./PetPhoto'); // Import the PetPhoto model

class User extends Model {}



// Add any model associations here (e.g., User.hasMany(Post))

// Define a one-to-many relationship between User and PetPhoto
User.hasMany(PetPhoto, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
});

module.exports = User;
