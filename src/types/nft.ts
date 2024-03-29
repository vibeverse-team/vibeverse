import {
  Nft as RawNft,
  AssetType as RawAssetType,
} from '@/declarations/vibeverse_backend/vibeverse_backend.did';

export interface Nft {
  collectionId: bigint;
  id: bigint;
  name: string;
  description: string;
  assetUrl?: string;
}

// TODO Update this once we have updated backend like ERC721
export interface DetailedNft extends Nft {
  views: number;
  creator: string;
  profileImage: string;
  communities: string[];
  awards: string[];
  aiTools: string[];
  emoticons: string[];
}

export const asNft = (nft: RawNft): Nft => {
  return {
    collectionId: nft.id[0],
    id: nft.id[1],
    name: nft.name,
    description: nft.description,
    assetUrl: nft.asset_url[0],
  };
};

export const asDetailedNft = (nft: RawNft): DetailedNft => {
  return {
    ...asNft(nft),
    creator: 'lorem ipsum',
    views: 123,
    profileImage:
      'https://cdn.pixelbin.io/v2/throbbing-poetry-5e04c5/original/creator_3.png',
    communities: [
      'https://cdn.pixelbin.io/v2/throbbing-poetry-5e04c5/original/white_miorror.png',
      'https://cdn.pixelbin.io/v2/throbbing-poetry-5e04c5/original/curious-1.png',
    ],
    awards: [
      'https://cdn.pixelbin.io/v2/throbbing-poetry-5e04c5/original/trophy_4.png',
    ],
    aiTools: [
      'https://cdn.pixelbin.io/v2/throbbing-poetry-5e04c5/original/hugging.png',
      'https://cdn.pixelbin.io/v2/throbbing-poetry-5e04c5/original/kaiber_2.png',
      'https://cdn.pixelbin.io/v2/throbbing-poetry-5e04c5/original/ilumine.png',
    ],
    emoticons: [
      'https://cdn.pixelbin.io/v2/throbbing-poetry-5e04c5/original/psychedelic_heart.gif',
      'https://cdn.pixelbin.io/v2/throbbing-poetry-5e04c5/original/gradient_donut.gif',
    ],
  };
};

export enum AssetType {
  Image = 0,
  Video = 1,
  Audio = 2,
  Other = 3,
}

export const asAssetType = (raw: RawAssetType): AssetType => {
  if ('Image' in raw) {
    return AssetType.Image;
  }
  if ('Video' in raw) {
    return AssetType.Video;
  }
  if ('Audio' in raw) {
    return AssetType.Audio;
  }
  return AssetType.Other;
};

export const asRawAssetType = (assetType: AssetType): RawAssetType => {
  switch (assetType) {
    case AssetType.Image:
      return { Image: null };
    case AssetType.Video:
      return { Video: null };
    case AssetType.Audio:
      return { Audio: null };
    default:
      return { Other: null };
  }
};
