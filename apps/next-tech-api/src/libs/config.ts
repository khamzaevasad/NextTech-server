import { ObjectId } from 'bson';

/** Sorts**/
export const availableSellerSorts = ['createdAt', 'updatedAt', 'memberRank'];
export const availableStoreSorts = [
  'createdAt',
  'updatedAt',
  'storeRating',
  'storeLikes',
  'storeViews',
];

export const availableMemberSorts = ['createdAt', 'updatedAt'];
export const shapeIntoMongoObjectId = (target: any) => {
  return typeof target === 'string' ? new ObjectId(target) : target;
};

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
