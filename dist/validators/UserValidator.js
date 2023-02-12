"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
exports.default = {
    editUserInfo: (0, express_validator_1.checkSchema)({
        token: {
            notEmpty: true,
        },
        email: {
            optional: true,
            isEmail: true,
            normalizeEmail: true,
            errorMessage: "E-mail invalido",
        },
        password: {
            optional: true,
            isLength: {
                options: { min: 2 },
            },
            errorMessage: "Senha precisa ter no mínimo 2 caracteres.",
        },
        name: {
            optional: true,
            trim: true,
            notEmpty: true,
            isLength: {
                options: { min: 2, max: 30 },
            },
            errorMessage: "Nome precisa ter no mínimo 2 caracteres.",
        },
        avatar: {
            optional: true,
            trim: true,
            notEmpty: true,
            errorMessage: "Avatar não disponível.",
        },
        description: {
            optional: true,
            trim: true,
            notEmpty: true,
            isLength: {
                options: { min: 2 },
            },
            errorMessage: "Descrição precisa ter no mínimo 2 caracteres.",
        },
    }),
};
//# sourceMappingURL=UserValidator.js.map