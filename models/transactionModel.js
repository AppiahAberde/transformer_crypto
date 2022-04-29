const { DataTypes } = require('sequelize')

module.exports = model

function model(sequelize) {
    const attributes = {
        merchantRef: { type: DataTypes.STRING, unique: true },
        address: { type: DataTypes.STRING },
        amount: { type: DataTypes.STRING },
        btcValueInvoiced: { type: DataTypes.INTEGER(32, 8) },
        btcValuePaid: { type: DataTypes.INTEGER(32, 8) },
        status: { type: DataTypes.ENUM('initiated', 'unpaid', 'pending', 'completed') },
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