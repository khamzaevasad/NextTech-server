import { Schema } from 'mongoose';
import { NoticeStatus } from '../libs/enums/notice.enum';

const NoticeSchema = new Schema(
  {
    noticeTitle: {
      type: String,
      required: true,
    },

    noticeStatus: {
      type: String,
      enum: NoticeStatus,
      default: NoticeStatus.ACTIVE,
    },

    noticeContent: {
      type: String,
      required: true,
    },

    noticeViews: {
      type: Number,
      default: 0,
    },

    memberId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Member',
    },
  },
  { timestamps: true, collection: 'notices' },
);

export default NoticeSchema;
