const express = require('express')
const router = express.Router()
const { authCheck, adminCheck } = require('../middlewares/authCheck')
const {
    listUsers,
    changeStatus,
    changeRole,
    listDrivers,
} = require('../controllers/user')

router.get('/users', authCheck, adminCheck, listUsers)
//  adminCheck,
router.post('/change-status', authCheck, adminCheck, changeStatus)
// authCheck, adminCheck,
router.post('/change-role', authCheck, adminCheck, changeRole)
// authCheck, adminCheck,
router.get("/drivers", listDrivers);

module.exports = router