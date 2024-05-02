const { response } = require('express')
const db = require('../models');
const subjectTeacher = require('../models/subjectTeacher');


//create model
const Subject = db.subjects;
const Teachers = db.teacherInformations;
const SubjectTeacher = db.subjectTeachers;
const Users = db.users;
const requestedSection = db.requestSubjects;
const studentJoinedSection = db.studentJoinedSection;
const studentInformation = db.studentInformations

//assign subject to teacher
const assignSubjectToTeacher = async (req, res) => {
    let body = {
        subjectId: req.body.subjectId,
        teacherId: req.body.teacherId,
    };

    try {
        // Check if the record already exists
        const existingRecord = await SubjectTeacher.findOne({
            where: { subjectId: body.subjectId, teacherId: body.teacherId },
        });

        if (existingRecord) {
            return res.status(400).send({ message: 'Teacher already assigned to this subject.This section already exists' });
        }

        const subject = await Subject.findByPk(body.subjectId);
        const teacher = await Teachers.findByPk(body.teacherId);
        const user = await Users.findOne({ where: { email: teacher.userEmail } });

        if (!subject || !teacher) {
            return res.status(404).send({ message: 'Subject or teacher not found' });
        }

        const subjectTeacher = await SubjectTeacher.create(body);

        const response = {
            message: 'Successfully assigned teacher to subject',
            subjectTeacher: {
                id: subjectTeacher.id,
                subjectId: subjectTeacher.subjectId,
                teacherId: subjectTeacher.teacherId,
                subjectName: subject.title,
                teacherName: user.name,
            },
        };
        res.status(200).send(response);
        console.log(subjectTeacher);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
};



//request Section Creation
const requestSectionCreation = async (req, res) => {
    let body = {
        subjectId: req.body.subjectId,
        teacherId: req.body.teacherId,
    };

    try {
        // Check if the record already exists
        const existingRecord = await SubjectTeacher.findOne({
            where: { subjectId: body.subjectId, teacherId: body.teacherId },
        });

        if (existingRecord) {
            return res.status(400).send({ message: 'Teacher already assigned to this subject.This section already exists' });
        }

        const existingReqRecord = await requestedSection.findOne({
            where: { subjectId: body.subjectId, teacherId: body.teacherId },
        });

        if (existingReqRecord) {
            return res.status(400).send({ message: 'This particular request already exist' });
        }

        const subject = await Subject.findByPk(body.subjectId);
        const teacher = await Teachers.findByPk(body.teacherId);
        const user = await Users.findOne({ where: { email: teacher.userEmail } });

        if (!subject || !teacher) {
            return res.status(404).send({ message: 'Subject or teacher not found' });
        }

        const requestCreation = await requestedSection.create(body);

        const response = {
            message: 'Successfully created a request',
            requestedSection: {
                id: requestCreation.id,
                subjectId: requestCreation.subjectId,
                teacherId: requestCreation.teacherId,
                status: requestCreation.status,
                subjectName: subject.title,
                teacherName: user.name,
            },
        };
        res.status(200).send(response);
        console.log(requestCreation);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
};


const getAllSubjectsWithTeachers = async (req, res) => {
    try {
        // Get all subject-teacher pairs
        let subjectsTeachers = await SubjectTeacher.findAll({});

        // Extract subject IDs and teacher IDs from subject-teacher pairs
        const subjectIds = subjectsTeachers.map(subjectTeacher => subjectTeacher.subjectId);
        const teacherIds = subjectsTeachers.map(subjectTeacher => subjectTeacher.teacherId);

        // Get subjects based on the extracted subject IDs
        let subjects = await Subject.findAll({
            where: {
                id: subjectIds
            }
        });

        // Get teacher information based on the extracted teacher IDs
        let teacherInformation = await db.teacherInformations.findAll({
            where: {
                id: teacherIds
            }
        });

        // Get users based on the teacher's email
        let users = await Users.findAll({
            where: {
                email: teacherInformation.map(teacher => teacher.userEmail)
            }
        });

        // Combine subject-teacher pairs with subjects' titles, teacher emails, and user names
        let subjectsWithTeachers = subjectsTeachers.map(subjectTeacher => {
            const subject = subjects.find(subject => subject.id === subjectTeacher.subjectId);
            const teacher = teacherInformation.find(teacher => teacher.id === subjectTeacher.teacherId);
            const user = users.find(user => user.email === teacher.userEmail);
            
            return {
                ...subjectTeacher.get(),
                title: subject ? subject.title : null,
                year: subject ? subject.year : null,
                userEmail: teacher ? teacher.userEmail : null,
                userName: user ? user.name : null,
                image: user ? user.image : null,

            };
        });


        res.status(200).send(subjectsWithTeachers);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
   
};

const getAllSubjectsWithTeachersFilteredByTitle = async (req, res) => {
    const title = req.params.title;
    try {
        // Get all subject-teacher pairs
        let subjectsTeachers = await SubjectTeacher.findAll({});

        // Extract subject IDs and teacher IDs from subject-teacher pairs
        const subjectIds = subjectsTeachers.map(subjectTeacher => subjectTeacher.subjectId);
        const teacherIds = subjectsTeachers.map(subjectTeacher => subjectTeacher.teacherId);

        // Get subjects based on the extracted subject IDs
        let subjects = await Subject.findAll({
            where: {
                id: subjectIds
            }
        });

        // Get teacher information based on the extracted teacher IDs
        let teacherInformation = await db.teacherInformations.findAll({
            where: {
                id: teacherIds
            }
        });

        // Get users based on the teacher's email
        let users = await Users.findAll({
            where: {
                email: teacherInformation.map(teacher => teacher.userEmail)
            }
        });

        // Combine subject-teacher pairs with subjects' titles, teacher emails, and user names
        let subjectsWithTeachers = subjectsTeachers.map(subjectTeacher => {
            const subject = subjects.find(subject => subject.id === subjectTeacher.subjectId);
            const teacher = teacherInformation.find(teacher => teacher.id === subjectTeacher.teacherId);
            const user = users.find(user => user.email === teacher.userEmail);

            return {
                ...subjectTeacher.get(),
                title: subject ? subject.title : null,
                year: subject ? subject.year : null,
                userEmail: teacher ? teacher.userEmail : null,
                image: user ? user.image : null,
                userName: user ? user.name : null,
                subjectImg: subject ? subject.image : null
            };
        });

        // Filter subjectsWithTeachers based on the title parameter
        const filteredSubjects = subjectsWithTeachers.filter(subject => {
            return subject.title && subject.title.toLowerCase().includes(title.toLowerCase());
        });

        res.status(200).send(filteredSubjects);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
};






//getAllRequest
const getAllRequest = async (req, res) => {
    try {
        // Get all subject-teacher pairs
        let requestedSections = await requestedSection.findAll({});

        // Extract subject IDs and teacher IDs from subject-teacher pairs
        const subjectIds = requestedSections.map(requestedSection => requestedSection.subjectId);
        const teacherIds = requestedSections.map(requestedSection => requestedSection.teacherId);

        // Get subjects based on the extracted subject IDs
        let subjects = await Subject.findAll({
            where: {
                id: subjectIds
            }
        });

        // Get teacher information based on the extracted teacher IDs
        let teacherInformation = await db.teacherInformations.findAll({
            where: {
                id: teacherIds
            }
        });

        // Combine subject-teacher pairs with subjects' titles and teacher emails
        let requestsOfSections = requestedSections.map(requestedSection => {
            const subject = subjects.find(subject => subject.id === requestedSection.subjectId);
            const teacher = teacherInformation.find(teacher => teacher.id === requestedSection.teacherId);
            
            return {
                ...requestedSection.get(),
                title: subject ? subject.title : null,
                userEmail: teacher ? teacher.userEmail : null
            };
        });

        res.status(200).send(requestsOfSections);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
};


//request by teacherId
const getRequestByTeacherId = async (req, res) => {
    try {
        const { teacherId } = req.params;

        // Check if teacherId is provided
        if (!teacherId) {
            return res.status(400).send('Teacher ID is required');
        }

        // Find all requests with the provided teacherId
        let requestedSections = await requestedSection.findAll({
            where: {
                teacherId: teacherId
            }
        });

        // Check if any requests are found
        if (requestedSections.length === 0) {
            return res.status(200).send({message: 'No requests have been made for this teacher'});
        }

        // Extract subject IDs from the found requests
        const subjectIds = requestedSections.map(requestedSection => requestedSection.subjectId);

        // Get subjects based on the extracted subject IDs
        let subjects = await Subject.findAll({
            where: {
                id: subjectIds
            }
        });

        // Combine subject-teacher pairs with subjects' titles
        let requestsOfTeacher = requestedSections.map(requestedSection => {
            const subject = subjects.find(subject => subject.id === requestedSection.subjectId);
            
            return {
                ...requestedSection.get(),
                title: subject ? subject.title : null,
                year: subject ? subject.year : null
            };
        });

        res.status(200).send(requestsOfTeacher);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
};



const getSubjectsByTeacher = async (req, res) => {
    try {
        const { teacherId } = req.params;

        // Ensure that teacherId is not undefined or empty
        if (!teacherId) {
            return res.status(400).send({ message: 'Teacher ID is required' });
        }

        // Find all subject-teacher pairs associated with the given teacher ID
        const subjectTeacherPairs = await SubjectTeacher.findAll({
            where: { teacherId: teacherId }
        });

        if (!subjectTeacherPairs || subjectTeacherPairs.length === 0) {
            return res.status(404).send({ message: 'Teacher not found or not associated with any subjects' });
        }

        // Extract subject IDs and section IDs from subject-teacher pairs
        const subjectInfo = await Promise.all(subjectTeacherPairs.map(async pair => {
            const subject = await Subject.findByPk(pair.subjectId);
            return {
                subjectId: subject.id,
                subjectName: subject.title,
                year: subject.year,
                image: subject.image,
                teacherId: teacherId,
                sectionId: pair.id,
                classcode: pair.classcode
            };
        }));

        // Fetch additional information about the teacher from the TeacherInformation model
        const teacherInfo = await db.teacherInformations.findOne({
            where: { id: teacherId }
        });

        if (!teacherInfo) {
            return res.status(404).send({ message: 'Teacher information not found' });
        }

        const userInfo = await db.users.findOne({
            where: { email: teacherInfo.userEmail }
        });

        // Combine subject information and teacher information
        const responseData = {
            teacherInfo: {
                teacherId: teacherInfo.id,
                userEmail: teacherInfo.userEmail,
                name: userInfo.name,
                userImage: userInfo.image
            },
            subjects: subjectInfo
        };

        // Calculate the number of students in each section and fetch user images
        const numStudentsWithImages = await Promise.all(subjectInfo.map(async subject => {
            const studentIds = (await db.studentJoinedSection.findAll({
                where: { sectionId: subject.sectionId },
                attributes: ['studentId']
            })).map(student => student.studentId);

            // Get user emails associated with the student IDs
            const userEmails = await db.studentInformations.findAll({
                where: { id: studentIds },
                attributes: ['userEmail']
            });

            console.log(userEmails); // Log the result here

            // Get user images based on the user emails
            const userImages = await Promise.all(userEmails.map(async info => {
                const user = await db.users.findOne({ where: { email: info.userEmail } });
                return user ? user.image : null;
            }));

            return {
                sectionId: subject.sectionId,
                numStudents: studentIds.length,
                userImages: userImages
            };
        }));

        // Add the number of students and user images to the subject info
        responseData.subjects = responseData.subjects.map(subject => ({
            ...subject,
            numStudents: numStudentsWithImages.find(item => item.sectionId === subject.sectionId).numStudents,
            userImages: numStudentsWithImages.find(item => item.sectionId === subject.sectionId).userImages
        }));

        res.status(200).send(responseData);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
};





const joinSection = async (req, res) => {
    try {
        // Extract data from request body
        const { sectionId, studentId, classcode } = req.body;

        // Check if the sectionId and studentId exist in their respective models
        const [subjectTeacher, student] = await Promise.all([
            SubjectTeacher.findOne({ where: { id: sectionId } }),
            studentInformation.findOne({ where: { id: studentId } })
        ]);

        if (!subjectTeacher || !student) {
            return res.status(404).json({ error: "Section or student not found." });
        }

        // Check if the class code matches
        if (subjectTeacher.classcode !== classcode) {
            return res.status(400).json({ error: "Class code doesn't match." });
        }

        // Check if the combination of sectionId and studentId already exists
        const existingRecord = await studentJoinedSection.findOne({
            where: {
                sectionId,
                studentId
            }
        });

        if (existingRecord) {
            return res.status(400).json({ error: "Student already joined the section." });
        }

        // Insert record into studentJoinedSection model with JOINED_VIA_CLASSCODE status
        await studentJoinedSection.create({
            sectionId,
            studentId,
            status: 'JOINED_VIA_CLASSCODE'
        });

        // Return success message
        return res.status(200).json({ message: "Student successfully joined the section." });

    } catch (error) {
        // Handle any errors
        console.error("Error joining section:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


const getJoinedSectionsByStudentId = async (req, res) => {
    try {
        // Extract studentId from request parameters
        const { studentId } = req.params;

        // Check if the studentId exists in the studentInformation model
        const student = await studentInformation.findOne({ where: { id: studentId } });

        if (!student) {
            return res.status(404).json({ error: "Student not found." });
        }

        // Find all joined sections of the student based on studentId
        const joinedSections = await studentJoinedSection.findAll({
            where: {
                studentId
            }
        });

        // Map the joined sections to include associated data
        const mappedJoinedSections = await Promise.all(joinedSections.map(async joinedSection => {
            const subjectTeacher = await SubjectTeacher.findOne({ where: { id: joinedSection.sectionId } });
            const subject = await Subject.findOne({ where: { id: subjectTeacher.subjectId } });
            const teacher = await db.teacherInformations.findOne({ where: { id: subjectTeacher.teacherId } });
            const user = await Users.findOne({ where: { email: teacher.userEmail } }); 
            const sectionfolder = await db.sectionFolder.count({where: {sectionId:joinedSection.sectionId}})
            const numOfFolders = sectionfolder;

            return {
                id: joinedSection.id,
                status: joinedSection.status,
                sectionDetails: {
                    id: subjectTeacher.id,
                    classcode: subjectTeacher.classcode
                },
                subjectDetails: {
                    id: subject.id,
                    title: subject.title,
                    year: subject.year,
                    image: subject.image

                },
                teacherDetails: {
                    id: teacher.id,
                    name: user ? user.name : null ,
                    image : user ? user.image : null
                },
                numOfFolders
            };
        }));

        // Return the mapped joined sections
        return res.status(200).json({ joinedSections: mappedJoinedSections });

    } catch (error) {
        // Handle any errors
        console.error("Error retrieving joined sections:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};





const checkStudentJoinedClass = async (req, res) => {
    const { studentId, sectionId } = req.params;

    try {
        // Check if the provided studentId exists in the StudentInformations table
        const student = await db.studentInformations.findByPk(studentId);
        if (!student) {
            return res.json({
                success: false,
                message: 'Student with the provided ID does not exist.'
            });
        }

        // Check if the provided sectionId exists in the subjectteachers table
        const section = await db.subjectTeachers.findByPk(sectionId);
        if (!section) {
            return res.json({
                success: false,
                message: 'Section with the provided ID does not exist.'
            });
        }

        // Check if the student has joined the section
        const joined = await db.studentJoinedSection.findOne({
            where: {
                studentId: studentId,
                sectionId: sectionId
            }
        });

        if (joined) {
            // Student has joined the section
            return res.json({
                success: true,
                message: 'Student joined class.'
            });
        } else {
            // Student has not joined the section
            return res.json({
                success: false,
                message: 'Student did not join class.'
            });
        }
    } catch (error) {
        console.error('Error checking student joined class:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};


/* //get subject by ID
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
} */


module.exports = {
    assignSubjectToTeacher,
    getAllSubjectsWithTeachers,
    getSubjectsByTeacher,
    requestSectionCreation,
    getAllRequest,
    getRequestByTeacherId,
    joinSection,
    getJoinedSectionsByStudentId,
    getAllSubjectsWithTeachersFilteredByTitle,
    checkStudentJoinedClass
}