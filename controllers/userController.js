const { response } = require('express')
const db = require('../models')
const { sign } = require("jsonwebtoken")
const bcrypt = require("bcrypt");
const { verify } = require("jsonwebtoken");
const fs = require('fs');
const path = require('path')
const multer = require('multer')

//create model
const User = db.users;
const teacherInformation = db.teacherInformations
const studentInformation = db.studentInformations

//addUser
const addUser = async (req, res) => {
    try {
        const { name, image, email, password, role } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ where: { email: email } });

        if (existingUser) {
            return res.status(400).send({ message: "User already exists with this email" });
        }

      

        // Create the user
        const user = await User.create({
            name: name, 
            image: image,
            email: email,
            hashedPassword: password,
            role: role
        });

        // If the role is 'TEACHER', add data to TeacherInformation
        if (role === 'TEACHER') {
            await teacherInformation.create({
                userEmail: email,
                petName: null,
                phone: null,
                about: null
            });

            await sendNotificationEmail(name, email,role,password)
        }

        if (role === 'STUDENT') {
            await studentInformation.create({
                userEmail: email,
                petName: null,
                phone: null,
                about: null
            });

           // await sendNotificationEmail(name, email,role,password)
        }

        res.status(200).send({ message: "Successfully added user", user });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

//automatedmessagetoteacherbyemail
const sendNotificationEmail = async (name, email, role, password) => {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
        service: 'hotmail',
        auth: {
            user: 'brucewayne102914@hotmail.com',
            pass: 'Ythirran@1029',
        }
    });
    const mailOptions = {
        from: 'brucewayne102914@hotmail.com',
        to: email,
        subject: 'Welcome as a TEACHER',
        text: `Hello ${name},\n\nWelcome to our platform as a TEACHER. Here are your credentials\n\n\Email: ${email}\n\n\Password: ${password}`
    };
    
    try {
        // Send the email
        await transporter.sendMail(mailOptions);
        console.log(`Notification email sent to ${email} for role ${role}`);
        // Update the status to notified in the database
        await updateNotificationStatus(email, 'NOTIFIED VIA EMAIL');
    } catch (error) {
        console.error("Error sending email:", error);
        // Update the status to not notified in the database
        await updateNotificationStatus(email, 'NOT NOTIFIED VIA EMAIL');
    }
};

const updateNotificationStatus = async (email, status) => {
    try {
        // Update the status in the database
        await teacherInformation.update(
            { status : status },
            { where: { userEmail: email } }
        );  
        console.log(`Status updated to ${status} for email ${email}`);
    } catch (error) {
        console.error("Error updating status:", error);
    }
};





//get user by ID
const getUserByID = async(req,res) => {
    let id = req.params.id
    let user = await User.findOne({where: {id:id}})
    res.status(200).send(user)
}

//get user by ID
const getUserByEmail = async(req,res) => {
    let email = req.params.email
    let user = await User.findOne({where: {email:email}})
    res.status(200).send(user)
}

const getTeachers = async (req, res) => {
    try {
        // Find all users with role 'TEACHER' and include their corresponding TeacherInformation
        let teachers = await User.findAll({ 
            where: { role: 'TEACHER' },
            include: [{ model: teacherInformation }] 
        });

        // Map over the teachers to extract relevant data and construct the response
        const teachersWithStatus = teachers.map(teacher => {
            return {
                id: teacher.id,
                name: teacher.name,
                email: teacher.email,
                status: teacher.TeacherInformation ? teacher.TeacherInformation.status : null,
                password: teacher.hashedPassword,
                teacherId : teacher.TeacherInformation ? teacher.TeacherInformation.id : null
            };
        });

        res.status(200).send(teachersWithStatus);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};








//getAllUser
const getAllUser = async(req,res) => {
    let users = await User.findAll({})
    res.status(200).send(users)
}


//4. update user

const updateUser = async (req,res) => {
    let id = req.params.id
    

    const user = await User.update(req.body, {where: {id: id}})

    res.status(200).send(user)
}


//5. delete user

const deleteUser = async (req, res) => {
    try {
        let email = req.params.email;

        // Check if user exists
        const user = await User.findOne({ where: { email } });

        if (!user) {
            // If no user found, respond with "no user found"
            return res.status(404).send({message: 'No user found'});
        }

        // Delete the user
        await User.destroy({ where: { email } });

        // Respond with "user found" after successful deletion
        res.status(200).send({message: 'User successfully deleted'});
    } catch (error) {
        // Handle errors
        console.error("Error:", error);
        res.status(500).send('Internal Server Error');
    }
};


//login
const login = async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    try {
        // Get user by email
        let user = await User.findOne({ where: { email: email } });

        if (!user) {
            // If no user found with the provided email
            return res.status(404).send({ message: "User not found" });
        }

        // Compare the hashedPassword from the database with the provided password
        const isPasswordMatch = await bcrypt.compare(password, user.hashedPassword);

        if (!isPasswordMatch) {
            // If passwords do not match
            return res.status(401).send({ message: "Incorrect password" });
        }

        let teacherInfo = null;
        let studentInfo = null;
        // If user role is 'TEACHER', retrieve additional information
        if (user.role === 'TEACHER') {
            teacherInfo = await teacherInformation.findOne({ where: { userEmail: user.email } });
        }
        if(user.role == 'STUDENT') {
            studentInfo = await studentInformation.findOne({where: {userEmail: user.email}})
        }

        // Calculate token expiration time (current time + 1 hour)
        const expiresIn = 60 * 60; // 1 hour in seconds
        const expirationTime = Math.floor(Date.now() / 1000) + expiresIn;




        // If email and password match, create and send a JWT token
        const token = sign({ id: user.id, email: user.email, role: user.role }, "fh3H5y8Sm91brlh2chNXZqeihWBP7KdX", { expiresIn: expiresIn });

        const refreshToken = sign({id : user.id, email: user.email, role: user.role}, '5e56eb7c135eb724d9f588ae1b46317f56a5d3e16284471a28002c81e73c2c15', {expiresIn: '7d'});

        await User.update({ refreshToken: refreshToken }, { where: { email: email } });

        res.status(200).send({ 
            message: "Login successful", 
            token: token, 
            refreshToken: refreshToken, 
            expiresIn: expirationTime, // Include expiration time in the response
            user: { 
                id: user.id, 
                email: user.email, 
                role: user.role 
            }, 
            teacherInfo: teacherInfo ,
            studentInfo :studentInfo 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};


const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.body.refreshToken;

        // Check if refresh token is provided
        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token is required' });
        }

        try {
            // Verify the refresh token
            const decoded = verify(refreshToken, '5e56eb7c135eb724d9f588ae1b46317f56a5d3e16284471a28002c81e73c2c15');

            // Retrieve user details based on the refresh token
            const user = await User.findOne({ where: { id: decoded.id, email: decoded.email } });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Generate a new access token
            const accessToken = sign({ id: user.id, email: user.email, role: user.role }, 'fh3H5y8Sm91brlh2chNXZqeihWBP7KdX', { expiresIn: '1h' });

            let refreshTokenResponse = { accessToken };

            // If the user's role is TEACHER, include the teacherId in the response
            if (user.role === 'TEACHER') {
                const teacherInfo = await teacherInformation.findOne({ where: { userEmail: user.email } });
                refreshTokenResponse.teacherId = teacherInfo ? teacherInfo.id : null;
            }

            if (user.role === 'STUDENT') {
                const studentInfo = await studentInformation.findOne({ where: { userEmail: user.email } });
                refreshTokenResponse.studentId = studentInfo ? studentInfo.id : null;
            }

            res.status(200).json(refreshTokenResponse);
        } catch (error) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/profileimg'));
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}${ext}`); 
    }
});

const upload = multer({ storage: storage }).single('file'); // 'file' should match the key name in the form-data

const uploadProfileImage = async (req, res) => {
    try {
        const email = req.params.email;

        upload(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                return res.status(500).send({ message: 'Multer error', error: err });
            } else if (err) {
                return res.status(500).send({ message: 'Unknown error', error: err });
            }

            if (!req.file) {
                return res.status(400).send({ message: 'No file uploaded' });
            }

    const user = await User.findOne({ where: { email: email } });

            if (!user) {
                return res.status(404).send({ message: 'User not found' });
            }

            user.image = `/profileimg/${req.file.filename}`;
            await user.save();

            res.status(200).send({ message: 'Image uploaded successfully', imageUrl: user.image });
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
};




module.exports = {
   addUser,
   deleteUser,
   updateUser,
   getAllUser,
   getUserByEmail,
   getUserByID,
   login,
   getTeachers,
   refreshToken,
   uploadProfileImage
}
