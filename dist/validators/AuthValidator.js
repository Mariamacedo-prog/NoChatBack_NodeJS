"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
exports.default = {
    signup: (0, express_validator_1.checkSchema)({
        email: {
            isEmail: true,
            normalizeEmail: true,
            errorMessage: "E-mail invalido",
        },
        password: {
            isLength: {
                options: { min: 2 },
            },
            errorMessage: "Senha precisa ter no mínimo 2 caracteres.",
        },
        name: {
            trim: true,
            notEmpty: true,
            isLength: {
                options: { min: 2, max: 30 },
            },
            errorMessage: "Nome precisa ter no mínimo 2 caracteres.",
        },
    }),
    signin: (0, express_validator_1.checkSchema)({
        email: {
            isEmail: true,
            normalizeEmail: true,
            errorMessage: "E-mail invalido",
        },
        password: {
            isLength: {
                options: { min: 2 },
            },
            errorMessage: "Senha precisa ter no mínimo 2 caracteres.",
        },
    }),
};
//# sourceMappingURL=AuthValidator.js.map