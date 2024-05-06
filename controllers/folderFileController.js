const { response } = require('express')
const db = require('../models')

// Create main Model
const FolderFiles = db.folderFiles;

// Retrieve all the pdf linked to the particular folder
const getFolderFilesByFolderId = async (req, res) => {
    let folderId = req.params.folderId
    
    try {
        let folderFiles = await FolderFiles.findAll({ where: { folderId: folderId }});
        res.status(200).send(folderFiles)
    } catch (error) {
        console.error('Error retrieving folder files:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
}

const updateSessionStatus = async (req, res) => {
    const { pdfId } = req.params;

    try {
        // Find the session based on pdfId
        const session = await db.folderFiles.findByPk(pdfId);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found.'
            });
        }

        session.session = 'inactive';

        await session.save();

        return res.status(200).json({
            success: true,
            message: 'Session status updated successfully.',
            session: session
        });
    } catch (error) {
        console.error('Error updating session status:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};

module.exports = {
    getFolderFilesByFolderId,
    updateSessionStatus
}
