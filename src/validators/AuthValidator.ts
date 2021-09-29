import { checkSchema } from "express-validator";

export default {
  signup: checkSchema({
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
  signin: checkSchema({
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
