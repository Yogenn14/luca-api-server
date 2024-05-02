// FolderFile.js

module.exports = (sequelize, DataTypes) => {
    const FolderFile = sequelize.define('FolderFile', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        folderId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'SectionFolders',
                key: 'id'
            }
        },
        pdfUrl: {
            type: DataTypes.STRING,
            allowNull: false
        },
        name : {
            type:DataTypes.STRING,
            allowNull: false
        },
        session: {
            type: DataTypes.ENUM('active', 'inactive'),
            defaultValue: 'active'
        }
    });

    // Define association with SectionFolder model
    FolderFile.associate = (models) => {
        FolderFile.belongsTo(models.SectionFolder, {
            foreignKey: 'folderId',
            as: 'sectionFolder'
        });
    };

    return FolderFile;
};
