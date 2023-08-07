const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');
const PetPhoto = require('./PetPhoto'); // Import the PetPhoto model

class User extends Model {}

User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // Add other properties as needed
}, {
  sequelize, // We need to pass the connection instance
  modelName: 'User', // We need to choose the model name
});

// Add any model associations here (e.g., User.hasMany(Post))

// Define a one-to-many relationship between User and PetPhoto
User.hasMany(PetPhoto, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE'
});

PetPhoto.belongsTo(User, {
  foreignKey: 'user_id'
});

module.exports = User;
