module.exports = (sequelize, DataTypes) => {
    const SectionFolders = sequelize.define('SectionFolders', {
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
        folderName: {
            type: DataTypes.STRING,
            allowNull: false
        },
     
    });

    SectionFolders.associate = (models) => {
        SectionFolders.belongsTo(models.SubjectTeacher, {
            foreignKey: 'sectionId',
            as: 'subjectTeacher'
        });
    };


    return SectionFolders;
};
