const util = require('util')
const exec = util.promisify(require('child_process').exec)
const db = require('../helpers/db')
const axios = require('axios')

module.exports = {
    initiate
}

async function initiate(params) {
    try {
        const { amount } = params
        const transaction = new db.Transaction(params)
        let btcValue = await getBtcValue()
        transaction.btcValueInvoiced = parseFloat(parseFloat(amount) / parseFloat(btcValue)).toFixed(8)
        transaction.expires = new Date(Date.now() + 20 * 60 * 1000)
        transaction.address = await generateAddress()
        transaction.status = 'initiated'
        await transaction.save()
        return basicDetails(transaction)
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
        const { stdout } = await exec("bitcoin-cli getnewaddress 'address_type' 'bech32")
        let address = stdout
        return address
    } catch (error) {
        console.log(error)
    }
}

function basicDetails(params) {
    const { id, btcValueInvoiced, amount, address, status, confirmations, expires } = params
    return { id, btcValueInvoiced, amount, address, status, confirmations, expires }
}