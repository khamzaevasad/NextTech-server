import { Schema } from 'mongoose';
import { ProductStatus } from '../libs/enums/product.enum';

const ProductSchema = new Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    productPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    productSlug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    productStock: {
      type: Number,
      required: true,
      min: 0,
    },
    productStatus: {
      type: String,
      enum: ProductStatus,
      default: ProductStatus.ACTIVE,
    },
    productCategory: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    productBrand: {
      type: String,
      required: true,
    },
    productDesc: {
      type: String,
      required: true,
    },
    productSpecs: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
    productImages: {
      type: [String],
      default: [],
    },
    productViews: {
      type: Number,
      default: 0,
    },
    productLikes: {
      type: Number,
      default: 0,
    },
    productComments: {
      type: Number,
      default: 0,
    },
    productRating: {
      type: Number,
      default: 0,
    },

    productRatingCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, collection: 'products' },
);

ProductSchema.index({ productCategory: 1 });
ProductSchema.index({ productName: 1 });
ProductSchema.index({ productBrand: 1 });
ProductSchema.index({ productSlug: 1 });

export default ProductSchema;
