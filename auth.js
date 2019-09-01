const jwt = require('jsonwebtoken')
const HttpStatus = require('http-status-codes');

exports.verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization']
    if (bearerHeader !== undefined) {
        const bearerToken = bearerHeader.split(' ')[1]
        jwt.verify(bearerToken, secretKey, (error, authData) => {
            if (error) {
                res.sendStatus(HttpStatus.FORBIDDEN)
            } else {
                req.username = authData.username
                next()
            }
        })
    } else {
        res.sendStatus(HttpStatus.FORBIDDEN)
    }
}