import { checkSchema } from "express-validator";

export default {
  singup: checkSchema({
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
        options: { min: 2 },
      },
      errorMessage: "Nome precisa ter no mínimo 2 caracteres.",
    },
  }),
  singin: checkSchema({
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
