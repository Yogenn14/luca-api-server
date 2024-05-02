'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add foreign key constraint to establish association between SubjectTeacher and StudentJoinedSection
    await queryInterface.addConstraint('StudentJoinedSections', {
      fields: ['sectionId'],
      type: 'foreign key',
      name: 'FK_StudentJoinedSections_SectionId',
      references: {
        table: 'SubjectTeachers',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('StudentJoinedSections', 'FK_StudentJoinedSections_SectionId');
  }
};
