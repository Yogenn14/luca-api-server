'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('Subjects', {
      fields: ['title'],
      type: 'unique',
      name: 'unique_title'
    });
    await queryInterface.addConstraint('Subjects', {
      fields: ['title', 'year'],
      type: 'unique',
      name: 'unique_title_year'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Subjects', 'unique_title');
    await queryInterface.removeConstraint('Subjects', 'unique_title_year');
  }
};
