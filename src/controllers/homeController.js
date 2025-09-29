const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();

function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

exports.showHomePage = async (req, res) => {

    if(req.user){
        try{
            const userID = req.user.id
            const folders = await prisma.folder.count({
                where: {
                    userId: userID
                }
            })
            const files = await prisma.file.count({
                where: {
                    userId: userID
                }
            })

            const storageBytes = await prisma.file.aggregate({
                where: {
                    userId: userID
            },
            _sum: {
                size: true
            }
        })

        const storage = formatBytes(storageBytes._sum.size)
        res.render('index', {
            folders,
            files,
            storage,
        })
    } catch (error) {
        console.error('Error fetching home page:', error)
        res.status(500).send('Error fetching home page')
    }
    } else {
        res.redirect('/auth/login')
        }
    }