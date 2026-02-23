import { Schema, model } from 'mongoose';
import { FaqCategory } from '../libs/enums/faq.enum';

const FaqSchema = new Schema(
  {
    question: {
      type: String,
      required: true,
    },

    answer: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: FaqCategory,
      default: FaqCategory.GENERAL,
    },

    order: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'faqs',
  },
);

export default FaqSchema;
