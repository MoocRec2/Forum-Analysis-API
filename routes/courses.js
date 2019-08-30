let express = require('express');
let router = express.Router();
let mongoose = require('../db_config')
let courseModel = mongoose.model('Course')

defaultPageSize = 10

/* GET endponts listing. */
router.get('/', function (req, res, next) {
    res.send(`
    <div>

    <p><strong>/top-rated</strong>\t-\tfind({ score: { $exists: 1 } }).sort({ score: -1 }).limit(10)</p>

    <p><strong>/search/:query</strong>\t-\tfind({ title: { $regex: new RegExp(query), $options: 'i' } }).limit(10)</p>

    <p><strong>/details/:id</strong>\t-\tfind({ key: id })</p>

    </div>
    `);
});

router.get('/top-rated', (req, res) => {
    let page = req.body.page ? req.body.page : 0
    let pageSize = req.body.pageSize ? req.body.pageSize : defaultPageSize
    courseModel.find({ course_rating: { $exists: 1 } }).sort({ course_rating: -1 }).skip(page * pageSize).limit(pageSize).exec().then(documents => {
        res.status(200).send(documents)
    }, error => {
        console.error(error)
        res.status(500).send('Error')
    })
})

router.post('/search', (req, res) => {
    let query = req.body.query
    let page = req.body.page ? req.body.page : 0
    let pageSize = req.body.pageSize ? req.body.pageSize : defaultPageSize

    let queryObj = { title: { $regex: new RegExp(query), $options: 'i' } }
    if (req.body.platforms !== undefined && req.body.platforms !== null) {
        Object.assign(queryObj, { platform: { $in: req.body.platforms } })
    }

    console.log('query', queryObj)
    courseModel.find(queryObj).skip(page * pageSize).limit(pageSize).exec().then(documents => {
        res.status(200).send(documents)
    }, error => {
        console.error(error)
        res.status(500).send('Error')
    })
})

router.get('/details/:id', (req, res) => {
    let id = req.params.id

    // courseModel.find({ key: id }).then(document => {
    //     if (document.length >= 1)
    //         res.status(200).send(document[0])
    //     else
    //         res.status(404).send('Not Found')
    // }, error => {
    //     console.error(error)
    //     res.status(500).send('Error')
    // })
    courseModel.findOne({ _id: id }).then(document => {
        if (document)
            res.status(200).send(document)
        else
            res.status(404).send('Not Found')
    }, error => {
        console.error(error)
        res.status(500).send('Error')
    })

})

module.exports = router;
