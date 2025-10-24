import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;
const d=new Date();

export const AdminSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId },
  username: { type: String  },
  password: { type: String  },
  mobile: { type: String  },
  email: { type: String  },
  status: { type: Number,default:1  },
  role_id: { type:Schema.Types.ObjectId },
  add_time: {           
    type:Number,        
    default: d.getTime()
  },
  is_super: { type:Number}
});
