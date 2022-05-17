const util = require('util')
const { Op } = require('sequelize')
const exec = util.promisify(require('child_process').exec)
const db = require('../helpers/db')
const axios = require('axios')

module.exports = {
    initiate,
    status
}

async function initiate(params) {
    try {
        const { amount, merchantRef } = params
        let transaction = await db.Transaction.findOne({
            where: {
                merchantRef
            }
        })
        if (!transaction) {
            const transaction = new db.Transaction(params)
            transaction.btcValueInvoiced = await btcValueInvoiced(amount)
            transaction.expires = new Date(Date.now() + 20 * 60 * 1000)
            transaction.address = await generateAddress()
            transaction.status = 'initiated'
            await transaction.save()
            return basicDetails(transaction)
        }
        return "Merchant Ref must be unique"
    } catch (error) {
        return error
    }
}

async function status(merchantRef) {
    try {
        const transaction = db.Transaction.findOne({
            where: {
                merchantRef
            }
        })
        if (!transaction) return "No transaction found"
        return transaction
    } catch (error) {
        console.log(error)
    }
}

async function btcValueInvoiced(amount) {
    try {
        let btcValue = await getBtcValue()
        return parseFloat(parseFloat(amount) / parseFloat(btcValue)).toFixed(8)
    } catch (error) {
        return error
    }
}

async function getBtcValue() {
    try {
        const { data } = await axios.get("https://portal.ekiosk.africa/api/rates/bitcoin")
        return data.data.price
    } catch (error) {
        console.log(error)
    }
}

async function generateAddress() {
    try {
        const { stdout } = await exec("bitcoin-cli -rpcwallet=test getnewaddress")
        return stdout.trim()
    } catch (error) {
        console.log(error)
    }
}

function basicDetails(params) {
    const { id, btcValueInvoiced, amount, address, status, confirmations, expires } = params
    return { id, btcValueInvoiced, amount, address, status, confirmations, expires }
}

async function getConfirmation() {
    try {
        const transactions = await db.Transaction.findAll({
            where: {
                confirmations: {
                    [Op.between]: [1, 5]
                }
            }
        })
        if (!transactions) return 'No transaction found'
        transactions.map(async transaction => {
            const { blockHash } = transaction
            const { stdout } = await exec(`bitcoin-cli getblock ${blockHash}`)
            let { confirmations } = JSON.parse(stdout)
            transaction.confirmations = confirmations
            await transaction.save()
            if (transaction.confirmations >= 6) {
                transaction.status = "completed"
                transaction.doneAt = Date.now()
                await transaction.save()
            }
        })

    } catch (error) {
        console.log(error)
    }
}

setInterval(() => {
    getConfirmation()
}, 60 * 1000);