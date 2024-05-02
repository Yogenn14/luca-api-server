const dbConfig = require('../config/dbConfig.js');

const {Sequelize, DataTypes} = require('sequelize');

const sequelize = new Sequelize (
    dbConfig.DB,
    dbConfig.USER,
    dbConfig.PASSWORD, {
        host : dbConfig.HOST,
        dialect : dbConfig.dialect,

        pool: {
            max: dbConfig.pool.max,
            min: dbConfig.pool.min,
            acquire: dbConfig.pool.acquire,
            idle: dbConfig.pool.idle,

        }
    }

)

sequelize.authenticate()
.then(()=> {
    console.log("Connected")
})
.catch(err=> {
    console.log('Error', err)
})

const  db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

db.products = require('./productModel.js')(sequelize,DataTypes)
db.reviews = require('./reviewModel.js')(sequelize,DataTypes)
db.subjects = require('./subjectModel.js')(sequelize,DataTypes)
db.users = require('./userModel.js')(sequelize,DataTypes)
db.teacherInformations = require('./teacherInformationModel.js')(sequelize,DataTypes)
db.subjectTeachers = require('./subjectTeacher.js')(sequelize,DataTypes)
db.sectionFolder = require('./sectionfoldersModel.js')(sequelize,DataTypes)
db.folderFiles = require('./folderfileModel.js')(sequelize,DataTypes)
db.requestSubjects = require('./requestedsubjectModal.js')(sequelize,DataTypes)
db.studentInformations = require('./studentInformationModel.js')(sequelize,DataTypes);
db.studentJoinedSection = require('./studentJoinedSectionModel.js')(sequelize, DataTypes);
db.studentMarks = require('./studentmarksModel.js')(sequelize, DataTypes);


//does not create data again or delete it
db.sequelize.sync({force:false})
.then(()=> {
    console.log('Yes resync done')

})

module.exports = db