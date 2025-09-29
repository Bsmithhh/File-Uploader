const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient()

exports.showFileDetails = async (req, res) => {
    try {
      const fileId = req.params.id;
      const userId = req.user.id;
      
      const file = await prisma.file.findUnique({
        where: { id: fileId },
        include: {
            user: true,
            folder: true
        }
      });
      
      if (!file) {
        return res.status(404).send('File not found');
      }

      if (file.userId !== userId) {
        return res.status(403).send('Unauthorized');
      }

      res.render('fileDetails', { 
        file: file,
        folder: file.folder // Pass folder info for the template
      });
      
    } catch (error) {
      console.error('Error fetching file details:', error);
      res.status(500).send('Error fetching file details');
    }
  };