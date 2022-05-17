const { argv } = require('process')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const db = require('../helpers/db')

notifier();

async function notifier() {
    const txID = argv[2]
    try {
        const { stdout } = await exec(`bitcoin-cli -rpcwallet=test gettransaction ${txID}`)
        const final = JSON.parse(stdout)
        const { details, amount, confirmations, blockhash } = final
        const transaction = await db.Transaction.findOne({
            where: {
                address: details[0].address
            }
        })
        if (transaction) {
            transaction.txID = txID
            transaction.btcValuePaid = amount
            transaction.confirmations = confirmations
            transaction.blockHash = blockhash
            transaction.status = "pending"
            await transaction.save()
        } else {
            console.log('no transaction found')
        }
    } catch (error) {
        console.log(error)
    }
}
