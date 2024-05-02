// StudentMarks.js

module.exports = (sequelize, DataTypes) => {
    const StudentMarks = sequelize.define('StudentMarks', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        studentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'StudentInformations', 
                key: 'id'
            }
        },
        sectionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'subjectteachers', 
                key: 'id'
            }
        },
        pdfId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'FolderFiles', 
                key: 'id'
            }
        },
        targetMarks: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        actualMarks: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    });

    // Define associations
    StudentMarks.associate = models => {
        // Associate with StudentInformation model
        StudentMarks.belongsTo(models.StudentInformation, { foreignKey: 'studentId' });

        // Associate with SubjectTeacher model (assuming sectionId is associated with SubjectTeacher)
        StudentMarks.belongsTo(models.SubjectTeacher, { foreignKey: 'sectionId' });

        // Associate with FolderFile model
        StudentMarks.belongsTo(models.FolderFile, { foreignKey: 'pdfId' });
    };

    return StudentMarks;
};
