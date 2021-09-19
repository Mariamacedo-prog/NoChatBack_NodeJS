import { checkSchema } from "express-validator";

export default {
  createPublication: checkSchema({
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
  editAction: checkSchema({
    token: {
      notEmpty: true,
    },
    description: {
      optional: true,
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
  }),
};
