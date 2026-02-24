import { ObjectId } from 'bson';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { T } from './types/common';

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
export const availableBoardArticleSorts = [
  'createdAt',
  'updatedAt',
  'articleLikes',
  'articleViews',
];

export const availableCommentSorts = ['createdAt', 'updatedAt'];
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
export const lookupCsMember = {
  $lookup: {
    from: 'members',
    localField: 'memberId',
    foreignField: '_id',
    as: 'authorData',
  },
};

export const lookupMemberArticle = {
  $lookup: {
    from: 'members',
    localField: 'memberId',
    foreignField: '_id',
    as: 'memberData',
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

// lookupFollowingData
export const lookupFollowingData = {
  $lookup: {
    from: 'members',
    localField: 'followingId',
    foreignField: '_id',
    as: 'followingData',
  },
};

// lookupFollowerData
export const lookupFollowerData = {
  $lookup: {
    from: 'members',
    localField: 'followerId',
    foreignField: '_id',
    as: 'followerData',
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

// lookupAuthMemberLiked
export const lookupAuthMemberLiked = (memberId: T, targetRefId: string = '$_id') => {
  return {
    $lookup: {
      from: 'likes',
      let: {
        localLikeRefId: targetRefId,
        localMemberId: memberId,
        localMyFavorite: true,
      },
      pipeline: [
        // match
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ['$likeRefId', '$$localLikeRefId'] }, //true
                { $eq: ['$memberId', '$$localMemberId'] }, //true
              ],
            },
          },
        },
        // projection
        {
          $project: {
            _id: 0,
            memberId: 1,
            likeRefId: 1,
            myFavorite: '$$localMyFavorite',
          },
        },
      ],
      // result Name
      as: 'meLiked',
    },
  };
};

// lookupAuthMemberFollowed
interface LookupAuthMemberFollowed {
  followerId: T;
  followingId: string;
}

export const lookupAuthMemberFollowed = (input: LookupAuthMemberFollowed) => {
  const { followerId, followingId } = input;
  return {
    $lookup: {
      from: 'follows',
      let: {
        localFollowerId: followerId,
        localFollowingId: followingId,
        localMyFavorite: true,
      },
      pipeline: [
        // match
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ['$followerId', '$$localFollowerId'] },
                { $eq: ['$followingId', '$$localFollowingId'] },
              ],
            },
          },
        },
        // projection
        {
          $project: {
            _id: 0,
            followerId: 1,
            followingId: 1,
            myFollowing: '$$localMyFavorite',
          },
        },
      ],
      as: 'meFollowed',
    },
  };
};

// lookupFavorite
export const lookupFavorite = {
  $lookup: {
    from: 'stores',
    localField: 'favoriteProduct.storeId',
    foreignField: '_id',
    as: 'favoriteProduct.storeData',
  },
};

// lookupVisit
export const lookupVisit = {
  $lookup: {
    from: 'members',
    localField: 'visitedStore.ownerId',
    foreignField: '_id',
    as: 'visitedProduct.ownerData',
  },
};

// lookupOrderItems
export const lookupOrderItems = {
  $lookup: {
    from: 'orderItems',
    localField: '_id',
    foreignField: 'orderId',
    as: 'orderItems',
  },
};

// lookupOrderProduct
export const lookupOrderProduct = {
  $lookup: {
    from: 'products',
    localField: 'orderItems.productId',
    foreignField: '_id',
    as: 'productData',
  },
};
