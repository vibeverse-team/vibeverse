use candid::Nat;
use creators::Creator;
use ic_cdk::export::Principal;
use ic_cdk_macros::*;
use nfts::{Collection, CollectionId, Nft, NftId};

#[update]
fn create_collection(
    name: String,
    description: String,
    transferable: bool,
    limit: Option<Nat>,
    image_url: Option<String>,
) -> String {
    let creator = ic_cdk::api::caller();
    nfts::create_collection(creator, name, description, transferable, limit, image_url);

    format!("Collection created successfully.")
}

#[update]
fn update_collection_metadata(
    id: CollectionId,
    name: String,
    description: String,
    image_url: Option<String>,
) -> String {
    let caller = ic_cdk::api::caller();

    match nfts::update_metadata(caller, id, name, description, image_url) {
        Ok(_) => format!("Metadata updated successfully."),
        Err(e) => format!("Error while updating metadata: {:?}", e),
    }
}

/// Get a specific collection with the provided `CollectionId`.
#[ic_cdk_macros::query]
fn get_collection(id: CollectionId) -> Option<Collection> {
    nfts::get_collection(id)
}

#[update]
fn set_creator_metadata(name: String) -> String {
    let caller = ic_cdk::api::caller();
    creators::set_creator_metadata(caller, name);

    format!("Creator metadata set successfully.")
}

#[ic_cdk_macros::query]
fn creator_metadata() -> Option<Creator> {
    let caller = ic_cdk::api::caller();
    creators::creator_metadata(caller)
}

#[ic_cdk_macros::query]
fn collections_created_by(creator: Principal) -> Vec<Collection> {
    nfts::collections_created_by(creator)
}

#[ic_cdk_macros::query]
fn collections_created_by_caller() -> Vec<Collection> {
    let caller = ic_cdk::api::caller();
    nfts::collections_created_by(caller)
}

#[update]
fn mint_nft(
    collection_id: CollectionId,
    receiver: Principal,
    name: String,
    description: String,
    asset_url: Option<String>,
) -> String {
    let caller = ic_cdk::api::caller();
    match nfts::mint_nft(
        caller,
        receiver,
        collection_id,
        name,
        description,
        asset_url,
    ) {
        Ok(_) => format!("Collection minted successfully."),
        Err(e) => format!("Error while minting nft: {:?}", e),
    }
}

#[update]
fn transfer_nft(nft: NftId, receiver: Principal) -> String {
    let caller = ic_cdk::api::caller();
    match nfts::nft_transfer(caller, receiver, nft) {
        Ok(_) => format!("Collection transfered successfully."),
        Err(e) => format!("Error while transfering the nft: {:?}", e),
    }
}

#[ic_cdk_macros::query]
fn nfts_of_user(user: Principal) -> Vec<Nft> {
    nfts::nfts_of_user(user)
}

#[ic_cdk_macros::query]
fn collection_count() -> CollectionId {
    nfts::collection_count()
}
