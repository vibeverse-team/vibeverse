'use client';

import { useState } from 'react';
import { FaShare } from 'react-icons/fa';
import { useModal } from 'react-modal-hook';

import { useGetCreatorProfile, useGetNftMetadata } from '@/hooks';
import { DetailedNft } from '@/types';

import DetailedNftModal from './DetailedNftModal';
import { Reactions } from '../Emoji';
import { Player } from '../Player';
import { Avatar } from '../Avatar';

const randomBackground = [
  'bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400 text-white',
  'bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 text-white',
  'bg-gradient-to-r from-orange-300 to-rose-300 text-stone-700',
  'bg-gradient-to-r from-emerald-500 to-lime-600 text-white',
  'bg-gradient-to-r from-gray-100 to-gray-300 text-stone-700',
  'bg-gradient-to-tr from-green-300 via-blue-500 to-purple-600 text-white',
  'bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 text-stone-700',
  'bg-gradient-to-r from-cyan-200 to-cyan-400 text-stone-700',
  'bg-gradient-to-r from-teal-200 to-lime-200 text-stone-700',
  'bg-gradient-to-b from-gray-900 to-gray-600 bg-gradient-to-r text-white',
  'bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white',
  'bg-[conic-gradient(at_bottom_left,_var(--tw-gradient-stops))] from-fuchsia-300 via-green-400 to-rose-700 text-stone-700',
];

export function DetailedNftCard({ nft }: { nft: DetailedNft }) {
  const [hovered, setHovered] = useState(false);

  const randomIndex = Math.floor(Math.random() * randomBackground.length);
  const { data: creator } = useGetCreatorProfile({
    collectionId: nft.collectionId,
  });
  const { data: metadata } = useGetNftMetadata({
    collectionId: nft.collectionId,
    nftId: nft.id,
  });

  const [showModal, hideModal] = useModal(
    () => (
      <DetailedNftModal
        isOpen
        nft={nft}
        creator={creator}
        metadata={metadata}
        hideModal={hideModal}
      />
    ),
    [nft, creator, metadata],
  );

  return (
    <div
      className="relative h-64 overflow-hidden rounded-xl border border-blue-400 pb-1"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Player path={nft.assetUrl || '/images/items/item_1.png'}/>
      <div className="absolute inset-0 mb-1">
        <div className="flex h-full flex-col justify-between">
          <div className="flex w-full justify-between p-3">
            {creator && <Avatar profile={creator} />}

            {hovered && (
              <button
                className="z-10 flex items-center justify-center rounded-full border-2 border-green-500/100 bg-sky-950 text-lg text-white xxs:invisible xs:-mb-6 sm:-mb-6 sm:h-12 sm:w-12 md:visible lg:-mb-8"
                onClick={showModal}
              >
                <FaShare />
              </button>
            )}
          </div>
          {/* bg-black, next div */}
          <div className="flex w-full flex-col justify-between px-3">
            <div className="bottom-0 flex items-end justify-between pb-2 text-blue-200">
              <div
                className={`${randomBackground[randomIndex]} rounded-xl px-4 py-2`}
              >
                <h2 className="text-base">{nft.name}</h2>
              </div>

              <div className="rounded-full bg-slate-800 px-4 py-2 text-xs">
                {nft.views} Views
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-black bg-opacity-40 p-2">
              {/* bg-red-300 side, next div */}
              <div
                className="z-1 flex items-center justify-center rounded-full bg-sky-950 px-4 py-1.5 text-xs text-white"
                onMouseEnter={() => setHovered(true)} // Set hovered to true when mouse enters this div
                onMouseLeave={() => setHovered(false)} // Set hovered to false when mouse leaves this div
              >
                ALT
                {/* Pop-up div, shown only when hovered is true */}
                {hovered && (
                  <div className="absolute z-10 -mt-10 ml-32 w-24 rounded-full bg-black p-2 text-white shadow-lg">
                    {/* Your pop-up content here */}
                    coming soon
                  </div>
                )}
              </div>
              <div className=" flex flex-col justify-between">
                <Reactions
                  collectionId={nft.collectionId}
                  nftId={nft.id}
                  reactions={metadata?.reactions || []}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
