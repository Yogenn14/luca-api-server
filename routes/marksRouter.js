const studentMarkController = require('../controllers/studentMarkController')

const router = require('express').Router()


//endpoint(/api/marks)
router.get('/checkMarkRecord/:studentId/:pdfId',studentMarkController.checkStudentMarksForPDF)
router.post('/addTargetMark', studentMarkController.createStudentTargetMarks)
router.get('/pdfDetails/:studentId/:pdfId',studentMarkController.getPdfDetailsofStudent)
router.get('/studentPDFMarks/:pdfId/:sectionId',studentMarkController.getStudentMarksForPDF)
module.exports = router
