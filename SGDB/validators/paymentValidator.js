const Joi = require('joi');

const criarTransferSchema = Joi.object({
    valor: Joi.number()
        .positive()
        .min(5)
        .max(5000)
        .required()
        .messages({
            'number.min': 'Valor mínimo R$5',
            'number.max': 'Valor máximo R$5000 (R$5-250: auto-aprovado, R$251-500: revisão, acima: rejeitado pelo banco)',
            'number.base': 'Valor deve ser numérico positivo'
        }),

    metodo: Joi.string()
        .uppercase()
        .valid(
            'DEBITO', 'DÉBITO',
            'CREDITO', 'CRÉDITO',
            'INTERNACIONAL',
            'PIX',
            'CARTEIRA_DIGITAL'
        )
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

    idBandeira: Joi.number().integer().optional().allow(null),
    origem: Joi.string().optional(),
    situacao: Joi.string().optional()
});

const recargaTransporteSchema = Joi.object({
    valor: Joi.number().positive().min(5).required(),

    metodo: Joi.string()
        .uppercase()
        .valid(
            'DEBITO', 'CARTAO_DE_DEBITO',
            'CREDITO', 'CARTAO_DE_CREDITO',
            'PIX',
            'CARTEIRA_DIGITAL',
            'INTERNACIONAL',
            'CARTAO_INTERNACIONAL',
            'CARTÃO_INTERNACIONAL'
        )
        .required(),

    numCartaoTransporte: Joi.string()
        .pattern(/^\d{2}\.\d{2}\.\d{8}-\d{1}$/)
        .required(),

    idBandeira: Joi.number().integer().optional().allow(null),
    situacao: Joi.string().optional()
});

const registerCardSchema = Joi.object({
    n_card: Joi.string().min(13).max(19).required()
});

const validateTransfer = (req, res, next) => {
    const { error } = criarTransferSchema.validate(req.body);
    if (error) {
        console.error('[JOI ERROR - Transfer]', error.details[0].message);
        return res.status(400).json({
            error: 'Dados de transferência inválidos',
            details: error.details[0].message
        });
    }
    next();
};

const validateRecargaTransporte = (req, res, next) => {
    const { error } = recargaTransporteSchema.validate(req.body);
    if (error) {
        console.error('[JOI ERROR - Recarga]', error.details[0].message);
        return res.status(400).json({
            error: 'Dados de recarga inválidos',
            details: error.details[0].message
        });
    }
    next();
};

const validateRegisterCard = (req, res, next) => {
    const { error } = registerCardSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            error: 'Dados do cartão inválidos',
            details: error.details[0].message
        });
    }
    next();
};

module.exports = {
    criarTransferSchema,
    recargaTransporteSchema,
    registerCardSchema,
    validateTransfer,
    validateRecargaTransporte,
    validateRegisterCard
};