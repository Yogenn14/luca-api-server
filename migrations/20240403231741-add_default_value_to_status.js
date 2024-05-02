'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('RequestSubjects', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'pending' // Set default value to 'pending'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('RequestSubjects', 'status', {
      type: Sequelize.STRING,
      allowNull: false
    });
  }
};
