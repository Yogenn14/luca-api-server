const {checkRole} = require('../middleware/rbacmiddleware')
const {checkToken} = require('../auth/token_validation')
const subjectTeacherController = require('../controllers/subjectTeacherController')
const multer = require('multer');
const path = require('path');
const router = require('express').Router()
const db = require('../models')
const folderFilesController = require('../controllers/folderFileController')
const sectionFolderController = require('../controllers/sectionFolderController')

const SectionFolder = db.sectionFolder
const SubjectTeacher = db.subjectTeachers
const folderFile = db.folderFiles

router.get('/searchSection/', checkToken, subjectTeacherController.getAllSubjectsWithTeachers)
router.get('/searchSection/:title', subjectTeacherController.getAllSubjectsWithTeachersFilteredByTitle);


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/pdf'); // Set the destination directory
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = '.pdf'; // Ensure '.pdf' extension
        cb(null, 'file-' + uniqueSuffix + extension); // Append ".pdf" extension
    },
});

const upload = multer({ storage: storage });

// Function to handle PDF upload with id
const uploadPDFtoFolder = async (req, res) => {
    try {
        // Check if file and all required parameters are present in the request
        if (!req.files || !req.files.file || !req.body.id || !req.body.name) {
            return res.status(400).json({ error: 'Both id, file, and name must be provided' });
        }
        
        const validateFolderId = await SectionFolder.findByPk(req.body.id)

        if(!validateFolderId) {
            return res.status(400).json({error: 'FolderId not found'})
        }

        const id = req.body.id;
        const name = req.body.name;
        const file = req.files.file[0]; 

        // Update the pdfUrl field with the file path
        const pdfUrl = file.path.replace('public', ''); // Adjust if needed
        let body = {
            folderId: id,
            name: name,
            pdfUrl: pdfUrl
        }

        const folderFiles = await db.folderFiles.create(body);

        res.status(200).send({message: `PDF uploaded to folder id ${id}` , body })
        console.log(folderFiles);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


// Configure the '/upload' route with multer middleware
router.post('/folder/upload', upload.fields([{ name: 'id' }, { name: 'file' }], ), async (req, res) => {
    try {
        await uploadPDFtoFolder(req, res);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



//route to create a folder in a section
router.post('/folder/create', checkToken, sectionFolderController.addFolderToSection )

router.put('/folder/edit/:folderId', sectionFolderController.editFolderName);


//get folders of a section
router.get('/:sectionId/allFolders', checkToken, sectionFolderController.getSectionFolder)



//get folder files of folder
router.get('/:folderId/allFiles', checkToken, folderFilesController.getFolderFilesByFolderId)
router.put('/folder/editSession/:pdfId', folderFilesController.updateSessionStatus);



//studentjoinedsection
router.post('/studentJoin', subjectTeacherController.joinSection)
router.get('/allSectionsofStudent/:studentId', subjectTeacherController.getJoinedSectionsByStudentId)
router.get('/checkStudentJoinedClass/:studentId/:sectionId', subjectTeacherController.checkStudentJoinedClass)




module.exports = router 