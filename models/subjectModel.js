const { Op } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const Subject = sequelize.define("Subject", {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        image: {
            type: DataTypes.STRING
        },
        description: {
            type: DataTypes.TEXT
        },
        year: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    });

    Subject.validateUniqueness = async function (title, year, excludeId = null) {
        const whereClause = { title, year };
        if (excludeId) {
            whereClause.id = { [Op.ne]: excludeId };
        }
        const count = await Subject.count({ where: whereClause });
        return count === 0;
    };

    Subject.addHook('beforeValidate', async (subject, options) => {
        if (!(await Subject.validateUniqueness(subject.title, subject.year, subject.id))) {
            throw new Error("Subject with this title and year already exists in the database");
        }
    });

    Subject.associate = (models) => {
        Subject.belongsToMany(models.TeacherInformation, { through: 'SubjectTeacher', foreignKey: 'subjectId' });
    };

    return Subject;
};
