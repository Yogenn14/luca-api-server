const { response } = require('express')
const db = require('../models')
const Sequelize = require('../models')

const { Op } = require('sequelize');


//create model
const Subject = db.subjects;
const TeacherInformation = db.teacherInformations; // Corrected model name
const SubjectTeacher = db.subjectTeachers;


const addSubject = async (req, res) => {
    try {
        const { title, image, description, year } = req.body;

        // Create a new subject instance
        const newSubject = { title, image, description, year };

        // Create the subject while enforcing uniqueness constraint
        const subject = await Subject.create(newSubject);

        res.status(200).send({ message: "Successfully added subject", subject });
        console.log("Subject added:", subject);
    } catch (error) {
        console.error("Error adding subject:", error);
        
        // Check if the error is due to uniqueness constraint violation
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).send({ message: "Subject with this title and year already exists in the database" });
        }

        res.status(500).send({ message: "Internal Server Error" });
    }
};



const getYearsForSubject = async (req, res) => {
    try {
        const { subjectName } = req.params;

        // Find all subjects with the given name
        const subjects = await Subject.findAll({
            where: { title: subjectName }
        });

        // Extract unique years from the subjects
        const years = [...new Set(subjects.map(subject => subject.year))];

        res.status(200).send(years);
    } catch (error) {
        console.error("Error getting years for subject:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};


const getUniqueSubjects = async (req, res) => {
    try {
        // Find unique subject titles using Sequelize methods
        const uniqueSubjects = await Subject.findAll({
            attributes: ['title'], 
            group: ['title'] 
        });

        res.status(200).send(uniqueSubjects);
    } catch (error) {
        console.error("Error getting unique subjects:", error);
        throw error;
    }
};


const getSubjectID = async (req,res) => {
    let title = req.params.title;
    let year = req.params.year;

    const subjectID = await Subject.findOne({ 
        where: { 
          title: title,
          year: year
        }
      });
          res.status(200).send(subjectID)

}




//get subject by ID
const getSubjectByID = async(req,res) => {
    let id = req.params.id
    let subject = await Subject.findOne({where: {id:id}})
    res.status(200).send(subject)
}


//getAllSubject
const getAllSubject = async(req,res) => {
    let subjects = await Subject.findAll({})
    res.status(200).send(subjects)
}

const searchSubjectByTitle = async (req, res) => {
    try {
        // Extract the title from the request query parameters
        const title  = req.params.title;

        // Search for subjects with matching title
        const subjects = await Subject.findAll({
            where: {
                title: {
                    [Op.like]: `%${title}%` 
                }
            }
        });

        // Return the found subjects
        res.status(200).send(subjects);
    } catch (error) {
        // Handle errors
        console.error('Error searching subjects by title:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};

//4. update subject

const updateSubject = async (req,res) => {
    let id = req.params.id
    

    const subject = await Subject.update(req.body, {where: {id: id}})

    res.status(200).send(subject)
}


//5. delete subject

const deleteSubject = async (req,res) => {
    let id = req.params.id
    

    await Subject.destroy({where: {id:id}})
    res.status(200).send('SUBJECT DELETED')
}


//6. get subject by year

const getSubjectByYear = async (req,res) => {

    let year = req.params.year
   const subjects = await Subject.findAll({where: {year: year}})

   res.status(200).send(subjects)
}




module.exports = {
    addSubject,
    getSubjectByID,
    getAllSubject,
    getSubjectByYear,
    deleteSubject,
    updateSubject,
    getYearsForSubject,
    getUniqueSubjects,
    getSubjectID,
    searchSubjectByTitle
}