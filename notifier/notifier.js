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
        switch (true) {
            case ((transaction) && (transaction.isExpired) && (!transaction.txID) && (transaction.btcValueInvoiced == amount)):
                transaction.txID = txID
                transaction.btcValuePaid = amount
                transaction.confirmations = confirmations
                transaction.blockHash = blockhash
                transaction.status = 'suspect'
                transaction.paymentState = 'full'
                await transaction.save()
                break;
            case ((transaction) && (transaction.isExpired) && (!transaction.txID) && (transaction.btcValueInvoiced > amount)):
                transaction.txID = txID
                transaction.btcValuePaid = amount
                transaction.confirmations = confirmations
                transaction.blockHash = blockhash
                transaction.status = 'suspect'
                transaction.paymentState = 'underpayment'
                await transaction.save()
                break;
            case ((transaction) && (transaction.isExpired) && (!transaction.txID) && (transaction.btcValueInvoiced < amount)):
                transaction.txID = txID
                transaction.btcValuePaid = amount
                transaction.confirmations = confirmations
                transaction.blockHash = blockhash
                transaction.status = 'suspect'
                transaction.paymentState = 'overpayment'
                await transaction.save()
                break;
            case ((transaction) && (transaction.btcValueInvoiced == amount) && (transaction.status !== "suspect")):
                transaction.txID = txID
                transaction.btcValuePaid = amount
                transaction.confirmations = confirmations
                transaction.blockHash = blockhash
                transaction.status = 'pending'
                transaction.paymentState = 'full'
                await transaction.save()
                break;
            case ((transaction) && (transaction.btcValueInvoiced > amount) && (transaction.status !== "suspect")):
                transaction.txID = txID
                transaction.btcValuePaid = amount
                transaction.confirmations = confirmations
                transaction.blockHash = blockhash
                transaction.status = 'pending'
                transaction.paymentState = 'underpayment'
                await transaction.save()
                break;
            case ((transaction) && (transaction.btcValueInvoiced < amount) && (transaction.status !== "suspect")):
                transaction.txID = txID
                transaction.btcValuePaid = amount
                transaction.confirmations = confirmations
                transaction.blockHash = blockhash
                transaction.status = 'pending'
                transaction.paymentState = 'overpayment'
                await transaction.save()
                break;
            case (!transaction):
                console.log(" Transaction not found ")
            default:
                transaction.txID = txID
                transaction.btcValuePaid = amount
                transaction.confirmations = confirmations
                transaction.blockHash = blockhash
                await transaction.save()
                break;
        }
    } catch (error) {
        console.log(error)
    }
}
