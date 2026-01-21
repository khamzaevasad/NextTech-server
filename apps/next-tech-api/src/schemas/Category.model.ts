import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  categoryName: string;
  categorySlug: string;
  categoryImage?: string;
  categoryDesc?: string;
  parentId?: mongoose.Types.ObjectId | null; // Ota kategoriya ID si
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
    // IERARXIYA UCHUN MUHIM QISM
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null, // Null bo'lsa, demak bu eng katta kategoriya (Main)
    },

    // DINAMIK FILTERLAR UCHUN MUHIM QISM
    // Admin panelda mahsulot qo'shayotganda qaysi inputlarni chiqarishni belgilaydi
    categoryFilterKeys: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // Virtual fieldlarni JSONga qo'shish
    toObject: { virtuals: true },
  },
);

// Virtual: Bu kategoriyaning "bolalari"ni (sub-categories) topish uchun
CategorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentId',
});

// Indekslar
CategorySchema.index({ parentId: 1 });
CategorySchema.index({ categorySlug: 1 });

export default CategorySchema;
