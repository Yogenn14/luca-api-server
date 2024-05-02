'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('StudentInformation', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      userEmail: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        references: {
          model: 'users', // Assuming 'users' is the name of your User table
          key: 'email'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      // Other columns for StudentInformation table
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Add foreign key constraint
    await queryInterface.addConstraint('StudentInformation', {
      fields: ['userEmail'],
      type: 'foreign key',
      name: 'fk_studentInformation_userEmail',
      references: {
        table: 'users',
        field: 'email'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('StudentInformation');
  }
};
