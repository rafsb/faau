
const
express = require('express')
, router = express.Router()
;;

router.get('/', (_, res) => res.sendFile(EPaths.APP + 'index.html'))
router.get('/error', (_, res) => res.sendFile(EPaths.APP + 'error.html'))

// router.use('/api', require('./api'))

module.exports = router