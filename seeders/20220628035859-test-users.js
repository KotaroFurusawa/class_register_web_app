'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: (queryInterface, Sequelize) => {
    const now = new Date();
    return queryInterface.bulkInsert('Users', [
      {
        club_id: "0005",
        club_name: "",
        st_name: "",
        st_num: "",
        email: "",
        tell: "",
        password: bcrypt.hashSync('ess2022', bcrypt.genSaltSync(8)),
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
