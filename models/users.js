'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Users.init({
    club_id: DataTypes.STRING,
    club_name: DataTypes.STRING,
    st_name: DataTypes.STRING,
    st_num: DataTypes.STRING,
    email: DataTypes.STRING,
    tell: DataTypes.STRING,
    password: DataTypes.STRING,
    rememberToken: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Users',
  });
  return Users;
};