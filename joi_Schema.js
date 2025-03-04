const Joi = require("joi");

module.exports.listingSchemaJoi = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  category: Joi.string().required(),
  price: Joi.number().min(0).required(),
  location: Joi.string().required(),
  coordinates: Joi.array()
    .items(Joi.number().min(-180).max(180))
    .length(2)
    .required(),
});

module.exports.reviewSchemaJoi = Joi.object({
  star: Joi.number().integer().min(0).max(5).required(),
  content: Joi.string().required(),
});
