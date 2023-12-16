"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("order_note_statuses", [
      {
        name: "Chờ xử lý",
        alias: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Chấp nhận",
        alias: "accepted",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Từ chối",
        alias: "rejected",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {},
};
