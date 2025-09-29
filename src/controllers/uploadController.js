const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();

exports.showUploadForm = async (req, res) => {
    try {
        const userId = req.user.id;
        const selectedFolderId = req.query.folderId || '';
        
        const folders = await prisma.folder.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                name: 'asc'
            }
        });
        
        res.render('upload', { 
            folders: folders,
            selectedFolderId: selectedFolderId
        });
    } catch (error) {
        console.error('Error:', error);
        res.render('upload', { folders: [] });
    }
};

exports.processUpload = async (req, res) => {
    try {
      if (!req.file) {
        const folders = await prisma.folder.findMany({
          where: { userId: req.user.id }
        });
        return res.render('upload', { 
          folders, 
          error: 'No file selected' 
        });
      }
      
      const userId = req.user.id;
      const folderId = req.body.folderId || null;
      
      await prisma.file.create({
        data: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,           // Cloudinary provides 'bytes'
          userId: userId,
          folderId: folderId,
          fileUrl: req.file.path,         // Cloudinary URL
          publicId: req.file.public_id    // For potential deletion
        }
      });
      
      // Redirect based on where file was uploaded
      if (folderId) {
        res.redirect(`/folders/${folderId}?message=uploaded`);
      } else {
        res.redirect('/folders?message=uploaded');
      }
    } catch (error) {
      console.error('Error:', error);
      res.redirect('/upload?error=uploadfailed');
    }
  };