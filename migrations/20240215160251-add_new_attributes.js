'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('teacherinformations', 'status', {
      type: Sequelize.DataTypes.STRING,
      allowNull: true,
    });
  },

  
}