const Joi = require('joi');

const criarTransfer = Joi.object({
    valor: Joi.number().positive().max(10000).required(),
    
    metodo: Joi.string()
        .uppercase() 
        .valid('DEBITO', 'CREDITO', 'INTERNACIONAL', 'PIX', 'CARTEIRA_DIGITAL')
        .required(),
        
    numCartao: Joi.string()
        .min(13)
        .max(19)
        .when('metodo', {
            is: Joi.string().valid('PIX', 'CARTEIRA_DIGITAL'), 
            then: Joi.optional().allow(''),
            otherwise: Joi.required()
        }),
        
    idBandeira: Joi.number().optional().allow(null)
});

module.exports = { criarTransfer };