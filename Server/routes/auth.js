const express = require('express')
const router = express.Router()
// // import controller
const { register, login, currentUser } = require('../controllers/auth')
// // import Middleware
const { authCheck, adminCheck , driverCheck} = require('../middlewares/authCheck')

router.post('/register', register)
router.post('/login', login)
router.post('/current-user',authCheck, currentUser)
// authCheck,
router.post('/current-admin',authCheck, adminCheck, currentUser)
// authCheck, adminCheck,
router.post('/current-driver',authCheck, driverCheck , currentUser)

module.exports = router