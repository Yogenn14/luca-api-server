module.exports = (sequelize, DataTypes) => {
    const SubjectTeacher = sequelize.define('SubjectTeacher', {
        subjectId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'subjects',
                key: 'id'
            }
        },
        teacherId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'teacherInformations',
                key: 'id'
            }
        },
        classcode: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    });

    // Define the association after both models have been defined
    SubjectTeacher.associate = models => {
        SubjectTeacher.hasMany(models.SectionFolder, { foreignKey: 'sectionId' });
    };

    SubjectTeacher.associate = models => {
        SubjectTeacher.hasMany(models.StudentJoinedSection, { foreignKey: 'sectionId' });
    };

    return SubjectTeacher;
};
