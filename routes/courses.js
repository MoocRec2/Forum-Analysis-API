let express = require('express');
let router = express.Router();
let mongoose = require('../db_config')
let courseModel = mongoose.model('Course')

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
    courseModel.find({ score: { $exists: 1 } }).sort({ score: -1 }).limit(10).exec().then(documents => {
        res.status(200).send(documents)
    }, error => {
        console.error(error)
        res.status(500).send('Error')
    })
})

router.get('/search/:query', (req, res) => {
    let query = req.params.query
    courseModel.find({ title: { $regex: new RegExp(query), $options: 'i' } }).limit(10).exec().then(documents => {
        res.status(200).send(documents)
    }, error => {
        console.error(error)
        res.status(500).send('Error')
    })
})

router.get('/details/:id', (req, res) => {
    let id = req.params.id
    courseModel.find({ key: id }).then(document => {
        if (document.length >= 1)
            res.status(200).send(document[0])
        else
            res.status(404).send('Not Found')
    }, error => {
        console.error(error)
        res.status(500).send('Error')
    })
})

module.exports = router;