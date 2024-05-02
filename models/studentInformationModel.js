// models/StudentInformation.js

const { BOOLEAN } = require("sequelize");

module.exports = (sequelize, DataTypes) => {

const StudentInformation = sequelize.define('StudentInformation', {
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
    },
    year : {
      type:DataTypes.INTEGER
    }


  
});




StudentInformation.associate = (models) => {
  StudentInformation.belongsTo(models.User, { foreignKey: 'userEmail', targetKey: 'email' });
};



return StudentInformation ;
}
