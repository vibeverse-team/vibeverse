import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './About.module.scss';
import { classnames } from 'tailwindcss-classnames';
import { FaAward } from 'react-icons/fa';
import { FiUsers } from 'react-icons/fi';
import { VscFolderLibrary } from 'react-icons/vsc';
import BackendActor from '@/components/BackendActor';

const About = () => {
  const [nfts, setNfts] = useState([]);

  useEffect(async() => { 
    const actor = new BackendActor();
    const result = await actor.getNfts(
      "2vxsx-fae",
    );
    console.log(result);
    setNfts(result);
  }, []);

  return (
    <section id="about">
      <div className="pt-8 pb-10">
        <h5 className="text-center text-sm text-gray-200">Creator</h5>
        <h2 className="text-xl text-center text-[#4db5ff]">Alexander Milton</h2>
      </div>

      <div className={classnames(styles.about__container)}>
        <div className={classnames(styles.about__me)}>
          <div className={classnames(styles.about__me_image)}>
            <Image
              src="/images/dashboard/Avatar.svg"
              alt="avatar"
              className="block w-full object-cover"
              width="400"
              height="400"
            />
          </div>
        </div>

        <div className={classnames(styles.about__content)}>
          <div className={classnames(styles.about__cards)}>
            <article className={classnames(styles.about__card)}>
              <VscFolderLibrary className={classnames(styles.about__icon)} />
              <h5>NFTs</h5>
              <small>0</small>
            </article>

            <article className={classnames(styles.about__card)}>
              <FaAward className={classnames(styles.about__icon)} />
              <h5>Rewards</h5>
              <small>0</small>
            </article>

            <article className={classnames(styles.about__card)}>
              <FiUsers className={classnames(styles.about__icon)} />
              <h5>Communities</h5>
              <small>10+ Worldwide</small>
            </article>
          </div>

          <div className="flex gap-6 justify-center lg:justify-start mt-10 text-base">
            <a
              href="#contact"
              className="py-2 px-4 rounded-lg bg-gradient-to-r from-[#a855f7] to-[#3b82f6] hover:from-[#4ade80] hover:to-[#3b82f6]"
            >
              Settings
            </a>
            <a
              href="#contact"
              className="py-2 px-4 rounded-lg bg-gradient-to-r from-[#a855f7] to-[#3b82f6] hover:from-[#4ade80] hover:to-[#3b82f6]"
            >
              Create
            </a>
            <a
              href="#contact"
              className="py-2 px-4 rounded-lg bg-gradient-to-r from-[#a855f7] to-[#3b82f6] hover:from-[#4ade80] hover:to-[#3b82f6]"
            >
              Explore
            </a>
          </div>
        </div>
      </div>
      {nfts.map((nft) => {
        return (
        <article key={nft.id} className={classnames(styles.portfolio__item)}>
          <div className={classnames(styles.portfolio__item_image)}>
            <img className="rounded-t-lg" src={nft.asset_url[0]? nft.asset_url[0] : "/images/dashboard/NFT.png"} alt={'asset'} />
          </div>
          <div>
            <h3>{nft.name}</h3>
            <h3>{nft.description}</h3>
            <div className={classnames(styles.portfolio__item_cta)}>
              <button
                className="py-2 px-4 rounded-lg bg-gradient-to-r from-[#a855f7] to-[#3b82f6] hover:from-[#4ade80] hover:to-[#3b82f6]"
              >
                Transfer
              </button>
            </div>
          </div>
        </article>
        );
      })}
    </section>
  );
};

export default About;
