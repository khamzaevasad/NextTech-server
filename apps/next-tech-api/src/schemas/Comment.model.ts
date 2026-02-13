import { Schema } from 'mongoose';
import { CommentGroup, CommentStatus } from '../libs/enums/comment.enum';

const CommentSchema = new Schema(
  {
    commentStatus: {
      type: String,
      enum: CommentStatus,
      default: CommentStatus.ACTIVE,
    },

    commentGroup: {
      type: String,
      enum: CommentGroup,
      required: true,
    },

    commentContent: {
      type: String,
      required: true,
    },

    commentRefId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    memberId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true, collection: 'comments' },
);

export default CommentSchema;
