const userController = require('../controllers/userController')
const teacherController = require('../controllers/teacherController')
const studentController = require('../controllers/studentController')
const {checkToken} = require('../auth/token_validation')
const {checkRole} = require('../middleware/rbacmiddleware')
const router = require('express').Router()


//endpoint(/api/user)
router.post('/addUser', checkToken,checkRole(['ADMIN']), userController.addUser)
router.post("/login", userController.login)

router.get('/allUser', checkToken,checkRole(['ADMIN']), userController.getAllUser)
router.get('/:id', userController.getUserByID )
router.get('/teacher/allTeacher', userController.getTeachers)
router.get('/email/:email', userController.getUserByEmail)
router.put('/:id', userController.updateUser)
router.delete('/email/:email', checkToken , checkRole(['ADMIN']), userController.deleteUser)
router.post('/refreshToken', userController.refreshToken)
router.post('/profilePic/upload/:email', userController.uploadProfileImage);




//teacher router
router.get('/teacher/:email', teacherController.getTeacherByEmail)
router.post('/teacher/editProfile/:email', teacherController.updateTeacherInfo)



//student router
router.get('/student/:email', studentController.getStudentByEmail)
router.get('/student/year/:year/student/:studentId', studentController.yearMatchValidation);
router.post('/student/editProfile/:email', studentController.updateStudentInfo)


module.exports = router
