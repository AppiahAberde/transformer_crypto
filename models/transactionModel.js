const { DataTypes } = require('sequelize')

module.exports = model

function model(sequelize) {
    const attributes = {
        merchantRef: { type: DataTypes.STRING, unique: true },
        address: { type: DataTypes.STRING },
        amount: { type: DataTypes.STRING },
        btcValueInvoiced: { type: DataTypes.DECIMAL(32, 8), defaultValue: 0 },
        btcValuePaid: { type: DataTypes.DECIMAL(32, 8), defaultValue: 0 },
        status: { type: DataTypes.ENUM('initiated', 'unpaid', 'pending', 'completed') },
        paymentState:{ type: DataTypes.ENUM('part', 'full', 'over')},
        confirmations: { type: DataTypes.INTEGER, defaultValue: 0},
        blockHash: {type: DataTypes.STRING},
        txID: { type: DataTypes.STRING},
        expires: { type: DataTypes.DATE },

        isExpired: {
            type: DataTypes.VIRTUAL,
            get() { return Date.now() >= this.expires }
        },
        isActive: {
            type: DataTypes.VIRTUAL,
            get() { return !this.isExpired }
        },
        doneAt: { type: DataTypes.DATE }
    }
    return sequelize.define('transaction', attributes)
}