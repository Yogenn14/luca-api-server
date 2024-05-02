'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('StudentInformations', 'year', {
      type: Sequelize.INTEGER,
      allowNull: true, // or false if it should not be nullable
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('StudentInformations', 'year');
  }
};
