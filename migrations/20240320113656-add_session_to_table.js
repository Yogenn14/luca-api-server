'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('sectionfiles', 'session', {
      type: Sequelize.ENUM('active', 'inactive'),
      defaultValue: 'active', // Set default value to 'active'
      allowNull: false // Make it not nullable
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('sectionfiles', 'session');
  }
};
