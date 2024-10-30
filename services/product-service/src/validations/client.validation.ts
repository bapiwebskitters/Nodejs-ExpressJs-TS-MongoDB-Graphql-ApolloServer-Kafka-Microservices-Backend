import Joi from 'joi';
import { Types } from 'mongoose';

export const clientCreateSchema = Joi.object({
  email: Joi.string().email().required(),
  new_password: Joi.string().required(),
  confirm_password: Joi.string().required(),
  full_name: Joi.string().required(),
  branch_id: Joi.string().required(),
  phone: Joi.string().required(),
  contact_person: Joi.string(),
  contact_person_phone: Joi.string(),
  house_no: Joi.string(),
  address: Joi.string(),
  city: Joi.string(),
  zipcode: Joi.string(),
  state: Joi.string(),
  landmark: Joi.string(),
  profile_image: Joi.string(),
  first_name:Joi.string(),
  last_name:Joi.string(),
  status: Joi.string().valid('Active', 'Inactive').default("Active"),
  username:Joi.string()
});

export const clientUpdateSchema = Joi.object({
    email: Joi.string().email(),
    password: Joi.string(),
    full_name: Joi.string(),
    branch_id: Joi.string(),
    phone: Joi.string(),
    contact_person: Joi.string(),
    contact_person_phone: Joi.string(),
    house_no: Joi.string(),
    address: Joi.string(),
    city: Joi.string(),
    zipcode: Joi.string(),
    state: Joi.string(),
    landmark: Joi.string(),
    profile_image: Joi.string(),
    status: Joi.string().valid('Active', 'Inactive')
  });


