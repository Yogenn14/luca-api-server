module.exports = (sequelize, DataTypes) => {
    const StudentJoinedSection = sequelize.define('StudentJoinedSection', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        sectionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'subjectteachers', 
                key: 'id'
            }
        },
        studentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'StudentInformations', 
                key: 'id'
            }
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    StudentJoinedSection.associate = models => {
        StudentJoinedSection.belongsTo(models.SubjectTeacher, { foreignKey: 'sectionId' });
    };

    return StudentJoinedSection;
};
