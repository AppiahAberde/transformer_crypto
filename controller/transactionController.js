const express = require('express')
const router = express.Router()
const Joi = require('joi')
const validateRequest = require('../middleware/validate-request')
const transactionService = require('../service/transactionService')

router.post('/initiate', getInitiateSchema, initiate)
router.get('/statuscheck/:id', statuscheck)

function getInitiateSchema(req, res, next) {
    const schema = Joi.object({
        merchantRef: Joi.string().required(),
        amount: Joi.string().required()
    })
    validateRequest(req, next, schema)
}

function initiate(req, res, next) {
    transactionService.initiate(req.body)
        .then((response) => response ? res.status(201).send(response) : res.status(404).send())
        .catch(next)
}

function statuscheck(req, res, next){
    transactionService.status(req.params.id)
    .then((response) => response ? (res.status(200).send(response)): (res.status(404).send()))
    .catch(next)
}

module.exports = router