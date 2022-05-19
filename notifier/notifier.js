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
        if (transaction && !transaction.isExpired) {
            transaction.txID = txID
            transaction.btcValuePaid = amount
            transaction.confirmations = confirmations
            transaction.blockHash = blockhash
            transaction.status = "pending"
            if (transaction.btcValueInvoiced == amount ) {
                transaction.paymentState = "full"
                await transaction.save()
            } else if (transaction.btcValueInvoiced > amount) {
                transaction.paymentState = "part"
                await transaction.save()
            } else {
                transaction.paymentState = 'over'
                await transaction.save()
            }
            await transaction.save()
        } else {
            console.log('no transaction found')
        }
    } catch (error) {
        console.log(error)
    }
}
