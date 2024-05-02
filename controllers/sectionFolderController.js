const { response } = require('express');
const db = require('../models');

const SectionFolder = db.sectionFolder;
const SubjectTeacher = db.subjectTeachers;
const folderFile = db.folderFiles;

const addFolderToSection = async (req, res) => {
    const { sectionId } = req.body;
    const { folderName } = req.body;

    try {
        // Check if the section exists in SubjectTeacher
        const section = await SubjectTeacher.findByPk(sectionId);
        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }

        // Create the folder in the section
        const newFolder = await SectionFolder.create({ sectionId, folderName });
        
        res.status(201).json({ message: 'Folder added to section successfully', folder: newFolder });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getSectionFolder = async (req, res) => {
    const { sectionId } = req.params; 

    try {
        const folders = await db.sectionFolder.findAll({ where: { sectionId } });

        if (folders.length === 0) {
            return res.status(200).json({ folders: [] });
        }

        for (const folder of folders) {
            const numPDFs = await db.folderFiles.count({ where: { folderId: folder.id } });
            folder.dataValues.numPDFs = numPDFs; 
        }

        res.status(200).json({ folders });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const editFolderName = async (req, res) => {
    const { folderId } = req.params; 
    const { newFolderName } = req.body;

    try {
        // Check if the folder exists
        const folder = await SectionFolder.findByPk(folderId);
        if (!folder) {
            return res.status(404).json({ message: 'Folder not found' });
        }

        // Update the folder name
        await folder.update({ folderName: newFolderName });

        res.status(200).json({ message: 'Folder name updated successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


module.exports = {
    addFolderToSection,
    getSectionFolder,
    editFolderName
};
