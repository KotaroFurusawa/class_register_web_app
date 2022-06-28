'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      club_id: {
        type: Sequelize.STRING
      },
      club_name: {
        type: Sequelize.STRING
      },
      st_name: {
        type: Sequelize.STRING
      },
      st_num: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      tell: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      rememberToken: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};