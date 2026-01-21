import { ObjectId } from 'bson';
export const availableSellerSorts = ['createdAt', 'updatedAt', 'memberRank'];

export const shapeIntoMongoObjectId = (target: any) => {
  return typeof target === 'string' ? new ObjectId(target) : target;
};
