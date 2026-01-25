import { Schema } from 'mongoose';
import { StoreLocation, StoreStatus } from '../libs/enums/store.enum';

const StoreSchema = new Schema({
  storeName: {
    type: String,
    required: true,
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'Member',
    required: true,
  },
  storeDesc: {
    type: String,
  },
  storeLogo: {
    type: String,
    default: '',
  },
  storePhone: {
    type: String,
    required: true,
  },

  storeStatus: {
    type: String,
    enum: StoreStatus,
    default: StoreStatus.ACTIVE,
  },
  storeAddress: {
    type: String,
    required: true,
  },

  storeLocation: {
    type: String,
    enum: StoreLocation,
    required: true,
  },

  storeProductsCount: {
    type: Number,
    default: 0,
  },
  storeRating: {
    type: Number,
    default: 0,
  },
  storeComments: {
    type: Number,
    default: 0,
  },
  storeViews: {
    type: Number,
    default: 0,
  },

  storeLikes: {
    type: Number,
    default: 0,
  },
});

export default StoreSchema;
