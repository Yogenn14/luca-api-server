const subjectController = require('../controllers/subjectController')
const {checkRole} = require('../middleware/rbacmiddleware')
const {checkToken} = require('../auth/token_validation')
const subjectTeacherController = require('../controllers/subjectTeacherController')
const router = require('express').Router()


//endpoint(/api/subject)
router.post('/addSubject', subjectController.addSubject)
router.get('/years/:subjectName', subjectController.getYearsForSubject)
router.get('/allUniqueSubject', subjectController.getUniqueSubjects)
router.get('/allSubjects', subjectController.getAllSubject)
router.get('/year/:year', subjectController.getSubjectByYear )
router.get('/getSubjectID/:year/:title', subjectController.getSubjectID)
router.get('/:id', subjectController.getSubjectByID)
router.delete('/:id',checkToken,checkRole(['ADMIN']), subjectController.deleteSubject)
router.put('/:id', checkToken,checkRole(['ADMIN']), subjectController.updateSubject)


//assign teacher to subject
router.post('/teacher/assign', checkToken, checkRole(['ADMIN']), subjectTeacherController.assignSubjectToTeacher)


//request section creation by teacher
router.post('/teacher/request',subjectTeacherController.requestSectionCreation)


//getallsubjectofateacher(teacher's section)
router.get('/teacher/:teacherId', checkToken, subjectTeacherController.getSubjectsByTeacher)


//getAllReqeust
router.get('/teacher/all/requestedSection',subjectTeacherController.getAllRequest)

//requestByTeacherId
router.get('/teacher/requestedSection/:teacherId', subjectTeacherController.getRequestByTeacherId)



//searchSubject
router.get('/search/:title', subjectController.searchSubjectByTitle)

module.exports = router
