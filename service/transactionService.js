const util = require('util')
const { Op } = require('sequelize')
const exec = util.promisify(require('child_process').exec)
const db = require('../helpers/db')
const axios = require('axios')
require('dotenv').config()

module.exports = {
    initiate,
    status,
    send,
    validateAddress
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
            transaction.expires = new Date(Date.now() + 10 * 60 * 1000)
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
        const { data } = await axios.get(process.env.RATE_URL)
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

async function validateAddress(address) {
    try {
        const { stdout } = await exec(`bitcoin-cli validateaddress ${address}`)
        const result = JSON.parse(stdout)
        const { isvalid } = result
        return isvalid
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
            if (transaction.confirmations >= 6 && transaction.status !== 'suspect') {
                transaction.status = "completed"
                transaction.doneAt = Date.now()
                await transaction.save()
            }
        })

    } catch (error) {
        console.log(error)
    }
}

async function send(params) {
    const { address, amount } = params
    try {
        var { stdout } = await exec('bitcoin-cli -rpcwallet=test1 getbalance')
        let balance = stdout.trim()
        if (parseFloat(amount) > parseFloat(balance)) return " No enough balance"
        /**check balance in the wallet and when it is enough you do the withdrawal  */
        const isValid = await validateAddress(address)
        if (isValid == false) return "Address not valid"
        const sendTx = new db.Transaction(params)
        sendTx.status = 'initiated'
        sendTx.createdAt = Date.now()
        await sendTx.save()
        /**Do db insertion and then save  */
        var { stdout } = await exec(`bitcoin-cli -rpcwallet=test1 sendtoaddress "${address}" ${amount} "drinks" "room77" true true null "unset" null 1.1`)
        sendTx.txID =  stdout.trim()
        sendTx.updatedAt = Date.now()
        await sendTx.save()
        /**update db with transaction txID and then mark as pending  */
        //const stdout = await exec(`bitcoin-cli -rpcwallet=test1 sendtoaddress '${address}' ${amount} 'drinks' 'room77' true true null 'unset' null 1.1 `)
        console.log(sendTx)
    } catch (error) {
        console.log(error)
    }
}

setInterval(() => {
    getConfirmation()
}, 60 * 1000);