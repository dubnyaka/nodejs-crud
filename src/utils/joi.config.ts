import Joi from "joi";

const baseOptions = {
    abortEarly: false,
    stripUnknown: true,
    errors: {label: "key"}
} as const;

const JoiWithDefaults = Joi.defaults(schema => schema.options(baseOptions));

export default JoiWithDefaults;