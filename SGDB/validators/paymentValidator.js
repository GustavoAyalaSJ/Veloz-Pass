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
        .allow('', null)
        .when('metodo', {
            is: Joi.string().valid('PIX', 'CARTEIRA_DIGITAL'), 
            then: Joi.optional(),
            otherwise: Joi.required()
        }),

    idBandeira: Joi.number().optional().allow(null),
    origem: Joi.string().optional()
});

const criarTransferSchema = criarTransfer;

const validateTransfer = (req, res, next) => {
  const { error } = criarTransferSchema.validate(req.body);
  if (error) {
    console.log('[JOI ERROR]', error.details[0].message, 'Body:', req.body);
    return res.status(400).json({ 
      error: 'Dados inválidos', 
      details: error.details[0].message,
      received: req.body 
    });
  }
  next();
};

module.exports = { 
  criarTransfer: criarTransferSchema,
  validateTransfer 
};
