import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AccessInterface } from './../../interface/access.interface';
import mongoose from 'mongoose';
// import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AccessService {
  constructor(@InjectModel('Access') private readonly accessModel) {}
      async find(json: AccessInterface = {}, fields?: string) {
          try {
              return await this.accessModel.find(json, fields);
          } catch (error) {
              return [];
          }       
      }

      async findOne(json: AccessInterface = {}, fields?: string) {
          try {
              // Keep original for fallback attempts and logging
              const originalQuery = JSON.parse(JSON.stringify(json || {}));

              // First try: the query as provided (possibly after casting _id below)
              const tryQuery = { ...originalQuery } as any;

              // If an _id is provided and looks like a Mongo ObjectId string,
              // cast it to ObjectId for the tryQuery (this helps when the DB _id is ObjectId)
              if (tryQuery && tryQuery._id && typeof tryQuery._id === 'string' && mongoose.Types.ObjectId.isValid(tryQuery._id)) {
                  tryQuery._id = new mongoose.Types.ObjectId(tryQuery._id);
              }

              // Attempt 1: original/casted query
              console.log('access.findOne: attempting query', JSON.stringify(tryQuery));
              let result = await this.accessModel.findOne(tryQuery, fields);
              if (result) {
                  console.log('access.findOne: matched with query', JSON.stringify(tryQuery));
                  return result;
              }

              // If not found, and original had an _id, try other common forms
              if (originalQuery && (originalQuery as any)._id) {
                  const origId = (originalQuery as any)._id;

                  // Attempt 2: search with explicit string _id (in case DB stores string)
                  try {
                      console.log('access.findOne: fallback attempt with string _id', String(origId));
                      result = await this.accessModel.findOne({ _id: String(origId) } as any, fields);
                      if (result) {
                          console.log('access.findOne: matched with string _id');
                          return result;
                      }
                  } catch (e) {
                      console.error('access.findOne: error during string _id attempt', e);
                  }

                  // Attempt 3: if origId looks like ObjectId, try ObjectId cast
                  try {
                      if (typeof origId === 'string' && mongoose.Types.ObjectId.isValid(origId)) {
                          const oid = new mongoose.Types.ObjectId(origId);
                          console.log('access.findOne: fallback attempt with ObjectId', oid);
                          result = await this.accessModel.findOne({ _id: oid } as any, fields);
                          if (result) {
                              console.log('access.findOne: matched with ObjectId-cast');
                              return result;
                          }
                      }
                  } catch (e) {
                      console.error('access.findOne: error during ObjectId attempt', e);
                  }

                  // Attempt 4: try findById (mongoose helper)
                  try {
                      console.log('access.findOne: fallback attempt with findById using', String(origId));
                      result = await this.accessModel.findById(origId, fields);
                      if (result) {
                          console.log('access.findOne: matched with findById');
                          return result;
                      }
                  } catch (e) {
                      console.error('access.findOne: error during findById attempt', e);
                  }
              }

              // No match found
              console.log('access.findOne: no document matched for', JSON.stringify(originalQuery));
              return null;
          } catch (error) {
              console.error('access.findOne: unexpected error', error);
              return null;
          }
      }
  
      async add(json:AccessInterface){
          try {
              json.module_id = json.module_id ?? '0';
              const admin = new this.accessModel(json); 
              const result = await admin.save();
              return result;
          } catch (error) {
              return null;
          }
      }
  
      async update(json1:AccessInterface,json2:AccessInterface){
          try {
              // Allow updating by either string _id (e.g. UUID) or ObjectId string.
              let id: any = (json1 as any)._id;
              if (id && mongoose.Types.ObjectId.isValid(id)) {
                  id = new mongoose.Types.ObjectId(id);
              }

              const result = await this.accessModel.updateOne({_id: id}, json2, { new: true });
              return result;
          } catch (error) {
              return null;
          }
      }
  
      async delete(json:AccessInterface){
          try {
              const result = await this.accessModel.deleteOne(json);          
              return result;
          } catch (error) {
              return null;
          }
      }
  
      getModel(){
         return this.accessModel;
      }
}
