import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;
export const RoleAccessSchema = new mongoose.Schema({
  access_id: {
    type: String,
  },
  role_id: {
    type: String,
  }
})