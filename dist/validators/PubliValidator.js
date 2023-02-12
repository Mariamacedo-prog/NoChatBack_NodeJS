"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
exports.default = {
    createAction: (0, express_validator_1.checkSchema)({
        token: {
            notEmpty: true,
        },
        category: {
            notEmpty: true,
            errorMessage: "Tipo de publicação não existente",
        },
        description: {
            notEmpty: true,
            isLength: {
                options: { min: 2 },
            },
            errorMessage: "Descrição precisa ter no mínimo 2 caracteres.",
        },
        title: {
            optional: true,
            isLength: {
                options: { min: 2 },
            },
            errorMessage: "Titulo precisa ter no mínimo 2 caracteres.",
        },
        image: {
            optional: true,
            isLength: {
                options: { min: 2 },
            },
            errorMessage: "Imagem com errro! Verifique e tente novamente!",
        },
    }),
    editAction: (0, express_validator_1.checkSchema)({
        token: {
            notEmpty: true,
        },
        description: {
            optional: true,
            isLength: {
                options: { min: 2 },
            },
            errorMessage: "Descrição precisa ter no mínimo 2 caracteres.",
        },
        title: {
            optional: true,
            isLength: {
                options: { min: 2 },
            },
            errorMessage: "Titulo precisa ter no mínimo 2 caracteres.",
        },
    }),
};
//# sourceMappingURL=PubliValidator.js.map