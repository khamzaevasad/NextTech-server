import { ObjectId } from 'bson';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

/* -------------------------------------------------------------------------- */
/*                                  FOR SORTS                                 */
/* -------------------------------------------------------------------------- */
export const availableSellerSorts = ['createdAt', 'updatedAt', 'memberRank'];
export const sorts = ['createdAt', 'updatedAt'];
export const availableStoreSorts = [
  'createdAt',
  'updatedAt',
  'storeRating',
  'storeLikes',
  'storeViews',
];
export const availableProductSorts = ['createdAt', 'updatedAt', 'productViews', 'productLikes'];

export const availableMemberSorts = ['createdAt', 'updatedAt'];
export const shapeIntoMongoObjectId = (target: any) => {
  return typeof target === 'string' ? new ObjectId(target) : target;
};

/* -------------------------------------------------------------------------- */
/*                                FOR UPLOADER                                */
/* -------------------------------------------------------------------------- */

export const validMimeTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
export const getSerialForImage = (filename: string) => {
  const ext = path.parse(filename).ext;
  return uuidv4() + ext;
};

/* -------------------------------------------------------------------------- */
/*                               FOR AGGREGATION                              */
/* -------------------------------------------------------------------------- */

// lookupMember
export const lookupMember = {
  $lookup: {
    from: 'members',
    localField: 'ownerId',
    foreignField: '_id',
    as: 'ownerData',
  },
};

// lookupStore
export const lookupStore = {
  $lookup: {
    from: 'stores',
    localField: '_id',
    foreignField: 'ownerId',
    as: 'storeData',
  },
};

// lookupStoreProduct
export const lookupStoreProduct = {
  $lookup: {
    from: 'stores',
    localField: 'storeId',
    foreignField: '_id',
    as: 'storeData',
  },
};

// complexLookupStore
export const complexLookupStore = {
  $lookup: {
    from: 'stores',
    let: { storeId: '$storeId' },
    pipeline: [
      { $match: { $expr: { $eq: ['$_id', '$$storeId'] } } },

      {
        $lookup: {
          from: 'members',
          localField: 'ownerId',
          foreignField: '_id',
          as: 'ownerData',
        },
      },
      { $unwind: '$ownerData' },
    ],
    as: 'storeData',
  },
};
