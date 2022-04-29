const util = require('util')
const exec = util.promisify(require('child_process').exec)
const db = require('../helpers/db')

module.exports = {
    initiate
}

async function initiate(params){
    try {
        const transaction = new db.Transaction(params)
        transaction.expires = new Date(Date.now() + 20 * 60 * 1000)
        transaction.address = await generateAddress()
        transaction.status = 'initiated'
        await transaction.save()
        return transaction
    } catch (error) {
        return error
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