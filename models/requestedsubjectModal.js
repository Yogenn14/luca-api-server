module.exports = (sequelize, DataTypes) => {
    const RequestSubject = sequelize.define('RequestSubject', {
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
        status : {
            type:DataTypes.STRING,
            allowNull:false,
            defaultValue: "PENDING",
        }
    });

  

    return RequestSubject;
};