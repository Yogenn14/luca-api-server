const db = require('../models'); 
const { checkStudentJoinedClass } = require('./subjectTeacherController'); 

const checkStudentMarksForPDF = async (req, res) => {
    const { studentId, pdfId } = req.params; 

    try {
        const studentMarks = await db.studentMarks.findOne({
            where: {
                studentId: studentId,
                pdfId: pdfId
            }
        });

        if (studentMarks) {
            return res.json({
                success: true,
                message: 'Student marks record found for this PDF.'
            });
        } else {
            return res.json({
                success: false,
                message: 'No student marks record found for this PDF.'
            });
        }
    } catch (error) {
        console.error('Error checking student marks:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};

const createStudentTargetMarks = async (req, res) => {
    const { studentId, sectionId, pdfId, targetMarks } = req.body;

    try {
        // Check if the student has joined the section
        const joined = await db.studentJoinedSection.findOne({
            where: {
                studentId: studentId,
                sectionId: sectionId
            }
        });

        if (!joined) {
            // If student not joined, send a response
            return res.status(400).json({
                success: false,
                message: 'Student is not joined to this section.'
            });
        }

        // Check if the provided pdfId exists in the FolderFiles table
        const pdf = await db.folderFiles.findByPk(pdfId);
        if (!pdf) {
            return res.status(400).json({
                success: false,
                message: 'PDF with the provided ID does not exist.'
            });
        }

        // Create a new StudentMarks record
        const studentMarks = await db.studentMarks.create({
            studentId: studentId,
            sectionId: sectionId,
            pdfId: pdfId,
            targetMarks: targetMarks
        });

        return res.status(201).json({
            success: true,
            message: 'Student marks record created successfully.',
            studentMarks: studentMarks
        });
    } catch (error) {
        console.error('Error creating student marks:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};


const getPdfDetailsofStudent = async (req, res) => {
    const { studentId, pdfId } = req.params;

    try {
        // Find PDF details based on pdfId
        const pdfDetails = await db.folderFiles.findByPk(pdfId);

        if (!pdfDetails) {
            return res.status(404).json({
                success: false,
                message: 'PDF not found.'
            });
        }

        // Check if student marks record exists for the PDF
        const studentMarks = await db.studentMarks.findOne({
            where: {
                studentId: studentId,
                pdfId: pdfId
            }
        });

        return res.json({
            success: true,
            pdfDetails: pdfDetails,
            studentMarks: studentMarks
        });
    } catch (error) {
        console.error('Error fetching PDF details:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};


const getStudentMarksForPDF = async (req, res) => {
    const { pdfId, sectionId } = req.params;

    try {
        const studentMarks = await db.studentMarks.findAll({
            where: { pdfId },
            attributes: ['studentId', 'targetMarks', 'actualMarks']
        });

        const joinedStudents = await db.studentJoinedSection.findAll({
            where: { sectionId },
            attributes: ['studentId']
        });

        const studentIds = joinedStudents.map(student => student.studentId);
        const studentInformation = await db.studentInformations.findAll({
            where: { id: studentIds },
            attributes: ['id', 'userEmail', 'year'] 
        });

        const userEmails = studentInformation.map(info => info.userEmail);

        const userData = await db.users.findAll({
            where: { email: userEmails }
        });

        const studentMarksWithInfo = studentMarks.map(mark => {
            const studentInfo = studentInformation.find(info => info.id === mark.studentId);
            const userInfo = userData.find(user => user.email === studentInfo.userEmail);
            return {
                studentId: mark.studentId,
                targetMarks: mark.targetMarks,
                actualMarks: mark.actualMarks,
                email: studentInfo ? studentInfo.userEmail : '',
                year: studentInfo ? studentInfo.year : '',
                name: userInfo.name,
                image: userInfo.image
            };
        });

        // Counting the number of students accessed
        const numOfStudentAccessed = studentMarksWithInfo.length;

        // Counting the total number of students in the section
        const totalStudentsInSection = joinedStudents.length;

        // Finding unaccessed students
        const accessedStudentIds = studentMarksWithInfo.map(student => student.studentId);
        const unaccessedStudents = studentIds.filter(studentId => !accessedStudentIds.includes(studentId));

        // Getting information of unaccessed students
        const unaccessedStudentsInfo = studentInformation.filter(student => unaccessedStudents.includes(student.id));
        const unaccessedStudentsData = unaccessedStudentsInfo.map(student => ({
            studentId: student.id,
            name: userData.find(user => user.email === student.userEmail).name,
            image: userData.find(user => user.email === student.userEmail).image,
            year: student.year
        }));

        return res.json({
            success: true,
            numOfStudentAccessed,
            totalStudentsInSection,
            unaccessedStudents: unaccessedStudentsData,
            studentMarks: studentMarksWithInfo
        });
    } catch (error) {
        console.error('Error fetching student marks for PDF:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};



module.exports = {
    checkStudentMarksForPDF,
    createStudentTargetMarks,
    getPdfDetailsofStudent,
    getStudentMarksForPDF
};
