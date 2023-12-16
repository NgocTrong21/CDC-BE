'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn(
        'Equipment', // table name
        'quantity', // new field name
      ),
    ]);
  },

  async down (queryInterface, Sequelize) {
    // return Promise.all([
    //   queryInterface.removeColumn('Supply', 'image'),
    // ]);
  }
};
