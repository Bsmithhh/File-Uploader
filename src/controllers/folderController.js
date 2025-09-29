const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient()


exports.showAllFolders = async (req, res) => {
    try {
        const userID = req.user.id
        const folders = await prisma.folder.findMany({
            where: {
                userId: userID
            }
        })
        res.render('folders', { folders })
    } catch (error) {
        console.error('Error fetching folders:', error)
        res.status(500).send('Error fetching folders')
    }
}

exports.showNewForm = (req, res) => {
    try {
        res.render('createFolder')
    } catch (error) {
        console.error('Error creating folder:', error)
        res.status(500).send('Error creating folder')
    }
}

exports.createFolder = async (req, res) => {
    try {
        const { folderName } = req.body

        if (!folderName || folderName.trim().length === 0) {
            return res.render('createFolder', { error: 'Folder name is required' });
          }

        const userID = req.user.id
        await prisma.folder.create({
            data: {
                name: folderName,
                userId: userID
            }
        })
        res.redirect('/folders')
    } catch (error) {
        console.error('Error creating folder:', error)
        res.status(500).send('Error creating folder')
    }
}

exports.showFolderContents = async (req, res) => {
    try {
        const folderId = req.params.id
        const userId = req.user.id

        const folder = await prisma.folder.findUnique({
            where: {
                id: folderId,
                userId: userId
            }
        })

        if (!folder) {
            return res.status(404).send('Folder not found')
        }

        const files = await prisma.file.findMany({
            where: {
                folderId: folderId
            }
        })

        res.render('folderContents', { folder, files })
    } catch (error) {
        console.error('Error fetching folder contents:', error)
        res.status(500).send('Error fetching folder contents')
    }   
    
}