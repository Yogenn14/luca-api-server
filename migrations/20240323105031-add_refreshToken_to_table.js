'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'refreshToken', {
      type: Sequelize.STRING,
      allowNull: false // Or set to false if refresh token is required for all users
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'refreshToken');

  }
};
