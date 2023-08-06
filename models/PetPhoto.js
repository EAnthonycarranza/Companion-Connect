const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');
const User = require('./User'); // Import the User model

class PetPhoto extends Model {}

PetPhoto.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // Add any additional fields you want to store with the image
  },
  {
    sequelize,
    modelName: 'pet_photo',
  }
);

module.exports = PetPhoto;
