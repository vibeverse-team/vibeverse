'use client';

import { useState, useEffect } from 'react';
import { PhotoIcon } from '@heroicons/react/24/solid';

import { Mixpanel } from '@/components/Mixpanel';
import { useActor } from '@/hooks';
import { uploadFile } from '@/helpers/upload';

import Img_Option from './img_option.jsx';

function CreateCollection({ showCreateCollection }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState();

  const [limit, setLimit] = useState('');
  const [imageOption, setImageOption] = useState('upload');

  const { actor } = useActor();

  useEffect(() => {
    setImageUrl(null);
  }, [imageOption]);

  const handleClose = () => {
    showCreateCollection(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!actor) {
      alert('empty actor');
      return;
    }

    console.log('Creating a collection');

    const isTranferable = true; // TODO have this passed from the UI.

    const result = await actor.create_collection(
      name,
      description,
      isTranferable,
      limit !== '' ? [BigInt(limit)] : [],
      [imageUrl],
      'category', // TODO Update
    );
    if ('Err' in result) {
      alert(result.Err);
      return;
    } else {
      alert(`Success id:${result.Ok}`);
    }
  };

  const upload = async (e) => {
    const file = e.target.files[0];

    const imageUrl = await uploadFile(file);

    console.log(imageUrl);
    setImageUrl(imageUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      <div className="mx-4 my-8 max-h-[calc(100%-2rem)] w-full max-w-2xl overflow-y-auto rounded-lg border border-indigo-600 bg-gray-900 p-8">
        <form onSubmit={handleSubmit}>
          <div className="space-y-12">
            <div className="border-b border-white/10 pb-12">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-3xl font-semibold leading-7 text-white">
                  Create Collection
                </h2>
                <button
                  onClick={handleClose}
                  type="button"
                  class="inline-flex items-center justify-center rounded-md p-1 text-gray-400 hover:bg-purple-300 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                >
                  <span class="sr-only">Close menu</span>

                  <svg
                    class="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <p className="mt-1 text-sm leading-6 text-gray-400">
                This information will be displayed publicly so be careful what
                you share.
              </p>

              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium leading-6 text-white"
                  >
                    Collection Title
                  </label>
                  <div className="mt-2">
                    <div className="flex rounded-md bg-white/5 ring-1 ring-inset ring-white/10 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500">
                      <span className="flex select-none items-center px-3 pl-3 text-gray-500 sm:text-sm">
                        vibeverse.com/
                      </span>
                      <input
                        type="text"
                        name="title"
                        id="title"
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                        autoComplete="title"
                        className="flex-1 border-0 bg-transparent py-1.5 pl-1 text-white focus:ring-0 sm:text-sm sm:leading-6"
                        placeholder="my_collection"
                      />
                    </div>
                  </div>
                </div>

                <div className="col-span-full">
                  <label
                    htmlFor="about"
                    className="block text-sm font-medium leading-6 text-white"
                  >
                    Description
                  </label>
                  <div className="mt-2">
                    <textarea
                      id="about"
                      name="about"
                      rows={3}
                      onChange={(e) => setDescription(e.target.value)}
                      value={description}
                      className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                    />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-gray-400">
                    Write a few sentences about what you are creating.
                  </p>
                </div>

                <div className="col-span-full">
                  <Img_Option
                    imageOption={imageOption}
                    setImageOption={setImageOption}
                  />
                  <label
                    htmlFor="cover-photo"
                    className="mt-4 block text-sm font-medium leading-6 text-white"
                  >
                    Cover photo
                  </label>
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="h-64 w-64 rounded-lg"
                      src={imageUrl}
                      alt={name}
                    />
                  ) : imageOption == 'upload' ? (
                    <div className="mt-2 flex justify-center rounded-lg border border-dashed border-white/25 px-6 py-10">
                      <div className="text-center">
                        <PhotoIcon
                          className="mx-auto h-12 w-12 text-gray-500"
                          aria-hidden="true"
                        />
                        <div className="mt-4 flex text-sm leading-6 text-gray-400">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md bg-gray-900 font-semibold text-white focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 hover:text-indigo-500"
                          >
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              onChange={upload}
                              type="file"
                              className="sr-only"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs leading-5 text-gray-400">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <input
                        type="text"
                        name="existing_url"
                        id="existing_url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="add link to your asset here :)"
                        autoComplete="given-name"
                        className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-b border-white/10 pb-12">
              <h2 className="text-base font-semibold leading-7 text-white">
                Mint Information
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-400">
                Maximum number of nfts in a collection, can be unlimited
              </p>

              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label
                    htmlFor="first-name"
                    className="block text-sm font-medium leading-6 text-white"
                  >
                    Max. amount of NFTs
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="first-name"
                      id="first-name"
                      onChange={(e) => setLimit(e.target.value)}
                      value={limit}
                      autoComplete="given-name"
                      className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-x-6">
            <button
              onClick={handleClose}
              type="button"
              className="text-sm font-semibold leading-6 text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            >
              Create Collection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateCollectionWrapped({ showCreateCollection }) {
  useEffect(() => {
    Mixpanel.track('Creating a collection');
  }, []);

  return <CreateCollection showCreateCollection={showCreateCollection} />;
}
