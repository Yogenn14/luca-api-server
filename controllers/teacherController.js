const { response } = require('express')
const db = require('../models')
const { sign } = require("jsonwebtoken")
const bcrypt = require("bcrypt");
const { verify } = require("jsonwebtoken");
const fs = require('fs');
const path = require('path')
const multer = require('multer')

const User = db.users;
const teacherInformation = db.teacherInformations


const getTeacherByEmail = async (req, res) => {
    try {
        const { email } = req.params;

        const teacher = await User.findOne({ 
            where: { email: email, role: 'TEACHER' },
            attributes: ['name', 'email', 'image', 'role'], 
            include: [{ model: teacherInformation }]
        });

        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        res.status(200).json(teacher);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const updateTeacherInfo = async (req, res) => {
    try {
        const { email } = req.params;
        const { petName, phone, about } = req.body;

        let teacherInfo = await teacherInformation.findOne({ where: { userEmail: email } });
        if (!teacherInfo) {
            return res.status(404).json({ message: "Teacher information not found" });
        }

        await teacherInfo.update({
            petName: petName,
            phone: phone,
            about: about
        });

        res.status(200).json({ message: "Teacher information updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = {
    getTeacherByEmail,
    updateTeacherInfo
}