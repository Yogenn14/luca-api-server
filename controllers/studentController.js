const { response } = require('express')
const db = require('../models')
const { sign } = require("jsonwebtoken")
const bcrypt = require("bcrypt");
const { verify } = require("jsonwebtoken");
const fs = require('fs');
const path = require('path')
const multer = require('multer')

const User = db.users;
const studentInformation = db.studentInformations

const getStudentByEmail = async (req, res) => {
    try {
        const { email } = req.params;

        const student = await User.findOne({ 
            where: { email: email, role: 'STUDENT' },
            attributes: ['id', 'name', 'email', 'image', 'role'], 
            include: [{ model: studentInformation }]
        });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const studentId = student.StudentInformation.id;

        const rowCount = await db.studentJoinedSection.count({
            where: { studentId: studentId }
        });

        const classJoined = { numOfClassesJoined: rowCount };

        const assessmentCount = await db.studentMarks.count({
            where: {studentId: studentId}
        })

        const assessment = {numOfAssessment: assessmentCount}

        res.status(200).json({ student: student, classJoined: classJoined, assessment:assessment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


const updateStudentInfo = async (req, res) => {
    try {
        const { email } = req.params;
        const { petName, phone, about } = req.body;

        let studentInfo = await studentInformation.findOne({ where: { userEmail: email } });
        if (!studentInfo) {
            return res.status(404).json({ message: "Student information not found" });
        }

        await studentInfo.update({
            petName: petName,
            phone: phone,
            about: about
        });

        res.status(200).json({ message: "Student information updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const yearMatchValidation = async (req, res) => {
    try {
        const { year, studentId } = req.params;

        const student = await studentInformation.findOne({
            where: { id: studentId },
            attributes: ['year']
        });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        if (student.year !== parseInt(year)) {
            return res.status(400).json({ message: "Year does not match" });
        }

        res.status(200).json(true);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


module.exports = {
    getStudentByEmail,
    updateStudentInfo,
    yearMatchValidation
}