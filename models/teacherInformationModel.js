// models/teacherInformation.js

const { BOOLEAN } = require("sequelize");

module.exports = (sequelize, DataTypes) => {

const TeacherInformation = sequelize.define('TeacherInformation', {
  userEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'email',
    }, 
  },
  petName: {
    type: DataTypes.STRING,
    
},
    phone: {
        type: DataTypes.STRING,
    },
    about : {
        type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
    }
   


  
});

TeacherInformation.associate = (models) => {
  TeacherInformation.belongsToMany(models.Subject, { through: 'SubjectTeacher', foreignKey: 'teacherId' });
};

TeacherInformation.associate = (models) => {
  TeacherInformation.belongsTo(models.User, { foreignKey: 'userEmail', targetKey: 'email' });
};



return TeacherInformation ;
}
