const Joi = require('joi');

const criarTransfer = Joi.object({
    valor: Joi.number()
        .positive()
        .max(10000)
        .required()
        .messages({
            'number.positive': 'Valor deve ser positivo',
            'number.max': 'Valor máximo é 10000'
        }),
    metodo: Joi.string()
        .valid('crédito', 'débito', 'internacional', 'pix')
        .required(),
    numCartao: Joi.string()
        .length(16)
        .when('metodo', {
            is: 'pix',
            then: Joi.optional(),
            otherwise: Joi.required()
        })
});

module.exports = { criarTransfer };