import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  categoryName: string;
  categorySlug: string;
  categoryImage?: string;
  categoryDesc?: string;
  parentId?: mongoose.Types.ObjectId | null;
  categoryFilterKeys: string[];
}

const CategorySchema: Schema = new Schema(
  {
    categoryName: {
      type: String,
      required: true,
    },
    categorySlug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    categoryImage: {
      type: String,
      default: '',
    },
    categoryDesc: {
      type: String,
      default: '',
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    categoryFilterKeys: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

CategorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentId',
});

CategorySchema.index({ parentId: 1 });
CategorySchema.index({ categorySlug: 1 });

export default CategorySchema;
