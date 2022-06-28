'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: (queryInterface, Sequelize) => {
    const now = new Date();
    return queryInterface.bulkInsert('Users', [
      {
        club_id: "1258",
        club_name: "上智大学エレクトロニクス研究部",
        st_name: "",
        st_num: "",
        email: "",
        tell: "",
        password: bcrypt.hashSync('207879', bcrypt.genSaltSync(8)),
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
