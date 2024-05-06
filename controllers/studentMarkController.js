const db = require("../models");
const { checkStudentJoinedClass } = require("./subjectTeacherController");

const checkStudentMarksForPDF = async (req, res) => {
  const { studentId, pdfId } = req.params;

  try {
    const studentMarks = await db.studentMarks.findOne({
      where: {
        studentId: studentId,
        pdfId: pdfId,
      },
    });

    if (studentMarks) {
      return res.json({
        success: true,
        message: "Student marks record found for this PDF.",
      });
    } else {
      return res.json({
        success: false,
        message: "No student marks record found for this PDF.",
      });
    }
  } catch (error) {
    console.error("Error checking student marks:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
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
        sectionId: sectionId,
      },
    });

    if (!joined) {
      // If student not joined, send a response
      return res.status(400).json({
        success: false,
        message: "Student is not joined to this section.",
      });
    }

    // Check if the provided pdfId exists in the FolderFiles table
    const pdf = await db.folderFiles.findByPk(pdfId);
    if (!pdf) {
      return res.status(400).json({
        success: false,
        message: "PDF with the provided ID does not exist.",
      });
    }

    // Create a new StudentMarks record
    const studentMarks = await db.studentMarks.create({
      studentId: studentId,
      sectionId: sectionId,
      pdfId: pdfId,
      targetMarks: targetMarks,
    });

    return res.status(201).json({
      success: true,
      message: "Student marks record created successfully.",
      studentMarks: studentMarks,
    });
  } catch (error) {
    console.error("Error creating student marks:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
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
        message: "PDF not found.",
      });
    }

    // Check if student marks record exists for the PDF
    const studentMarks = await db.studentMarks.findOne({
      where: {
        studentId: studentId,
        pdfId: pdfId,
      },
    });

    return res.json({
      success: true,
      pdfDetails: pdfDetails,
      studentMarks: studentMarks,
    });
  } catch (error) {
    console.error("Error fetching PDF details:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

const getStudentMarksForPDF = async (req, res) => {
  const { pdfId, sectionId } = req.params;

  try {
    // Retrieve student marks for the specified PDF
    const studentMarks = await db.studentMarks.findAll({
      where: { pdfId },
      attributes: ["studentId", "targetMarks", "actualMarks"],
    });

    // Retrieve joined students in the section
    const joinedStudents = await db.studentJoinedSection.findAll({
      where: { sectionId },
      attributes: ["studentId"],
    });

    // Extract student IDs from joined students
    const studentIds = joinedStudents.map((student) => student.studentId);

    // Retrieve student information based on IDs
    const studentInformation = await db.studentInformations.findAll({
      where: { id: studentIds },
      attributes: ["id", "userEmail", "year"],
    });

    // Extract user emails from student information
    const userEmails = studentInformation.map((info) => info.userEmail);

    // Retrieve user data based on emails
    const userData = await db.users.findAll({
      where: { email: userEmails },
    });

    // Map student marks with user information
    const studentMarksWithInfo = studentMarks.map((mark) => {
      const studentInfo = studentInformation.find(
        (info) => info.id === mark.studentId
      );
      const userInfo = userData.find(
        (user) => user.email === studentInfo.userEmail
      );
      return {
        studentId: mark.studentId,
        targetMarks: mark.targetMarks,
        actualMarks: mark.actualMarks,
        email: studentInfo ? studentInfo.userEmail : "",
        year: studentInfo ? studentInfo.year : "",
        name: userInfo.name,
        image: userInfo.image,
      };
    });

    // Count the number of students accessed
    const numOfStudentAccessed = studentMarksWithInfo.length;

    // Count the total number of students in the section
    const totalStudentsInSection = joinedStudents.length;

    // Find unaccessed students
    const accessedStudentIds = studentMarksWithInfo.map(
      (student) => student.studentId
    );
    const unaccessedStudents = studentIds.filter(
      (studentId) => !accessedStudentIds.includes(studentId)
    );

    // Get information of unaccessed students
    const unaccessedStudentsInfo = studentInformation.filter((student) =>
      unaccessedStudents.includes(student.id)
    );
    const unaccessedStudentsData = unaccessedStudentsInfo.map((student) => ({
      studentId: student.id,
      name: userData.find((user) => user.email === student.userEmail).name,
      image: userData.find((user) => user.email === student.userEmail).image,
      year: student.year,
    }));

    // Retrieve PDF data from folderFiles based on the pdfId
    const pdfData = await db.folderFiles.findOne({
      where: { id: pdfId },
      attributes: ["id", "name", "session", "pdfUrl"], // Include any other attributes you need
    });

    return res.json({
      success: true,
      numOfStudentAccessed,
      totalStudentsInSection,
      unaccessedStudents: unaccessedStudentsData,
      studentMarks: studentMarksWithInfo,
      pdfData: pdfData,
    });
  } catch (error) {
    console.error("Error fetching student marks for PDF:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

const getStudentMarksOfFolder = async (req, res) => {
  const { folderId, sectionId, studentId } = req.params;

  try {
    // Get all PDFs within the specified folder
    const pdfs = await db.folderFiles.findAll({
      where: { folderId },
      attributes: ["id"],
    });

    if (pdfs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No PDFs found in the specified folder.",
      });
    }

    // Get the count of PDFs accessed by the student in the specified folder
    const accessedPDFCount = await db.studentMarks.count({
      where: {
        pdfId: pdfs.map((pdf) => pdf.id),
        sectionId,
        studentId, // Filter by studentId
      },
      distinct: true,
      col: "pdfId",
    });

    if (accessedPDFCount >= 2) {
      // If the student accessed two or more PDFs, fetch folder name and details of all PDFs
      const folder = await db.sectionFolder.findOne({
        where: { id: folderId },
        attributes: ["folderName"],
      });

      const pdfDetails = await db.studentMarks.findAll({
        where: {
          pdfId: pdfs.map((pdf) => pdf.id),
          sectionId,
          studentId, // Filter by studentId
        },
        attributes: ["pdfId", "targetMarks", "actualMarks"],
        raw: true, // To retrieve raw data without association
      });

      // Retrieve PDF names from folderFiles using matching condition
      const pdfNames = await db.folderFiles.findAll({
        where: { id: pdfDetails.map((detail) => detail.pdfId) },
        attributes: ["name"],
      });

      // Map the PDF names with target marks and actual marks
      const formattedPDFDetails = await Promise.all(
        pdfDetails.map(async (detail) => {
          const pdfId = detail.pdfId; // Get the PDF id directly from the detail

          // Query to retrieve the PDF name based on its ID
          const pdfFile = await db.folderFiles.findOne({
            where: { id: pdfId },
            attributes: ["name"],
          });

          // Extract the name from the retrieved PDF file
          const pdfName = pdfFile ? pdfFile.name : "Unknown";

          return {
            pdfName: pdfName,
            targetMarks: detail.targetMarks,
            actualMarks: detail.actualMarks,
          };
        })
      );

      return res.json({
        success: true,
        accessedMultiplePDFs: true,
        folderName: folder.folderName,
        pdfDetails: formattedPDFDetails,
      });
    }

    return res.json({
      success: true,
      accessedMultiplePDFs: false,
    });
  } catch (error) {
    console.error(
      "Error checking student access to multiple PDFs in folder:",
      error
    );
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

const validateStudentAccessToMultipleFiles = async (req, res) => {
  const { folderId, sectionId, studentId } = req.params;

  try {
    const pdfs = await db.folderFiles.findAll({
      where: { folderId },
      attributes: ["id"],
    });

    if (pdfs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No PDFs found in the specified folder.",
      });
    }

    const accessedPDFCount = await db.studentMarks.count({
      where: {
        pdfId: pdfs.map((pdf) => pdf.id),
        sectionId,
        studentId,
      },
      distinct: true,
      col: "pdfId",
    });

    const hasAccessedMultipleFiles = accessedPDFCount >= 2;

    return res.json({
      success: true,
      hasAccessedMultipleFiles: hasAccessedMultipleFiles,
    });
  } catch (error) {
    console.error(
      "Error validating student access to multiple files in folder:",
      error
    );
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

module.exports = {
  checkStudentMarksForPDF,
  createStudentTargetMarks,
  getPdfDetailsofStudent,
  getStudentMarksForPDF,
  getStudentMarksOfFolder,
  validateStudentAccessToMultipleFiles,
};
