use candid::Nat;
use candid::Principal;

use ic_cdk_macros::{query, update};
mod administrative;
mod admins;
mod communities;
mod courses;
mod creators;
#[cfg(test)]
mod creators_tests;
mod guards;
mod interface;
mod lifecycle;
mod memory;
mod nft_metadata;
mod nfts;

#[cfg(test)]
mod nfts_tests;
mod reactions;
mod types;

use crate::interface::{VibeToken, ICRC1};
use guards::*;
use memory::METADATA;
use reactions::AddRemoveReactionResult;
use types::*;

#[update]
pub fn create_collection(
    name: String,
    description: String,
    transferable: bool,
    limit: Option<Nat>,
    image_url: Option<String>,
    category: String,
) -> Result<CollectionId, String> {
    let creator = ic_cdk::api::caller();

    nfts::create_collection(creator, name, description, transferable, limit, image_url, category)
}

#[update]
pub fn update_collection_metadata(
    id: CollectionId,
    name: String,
    description: String,
    image_url: Option<String>,
    category: Option<String>,
) -> Result<(), String> {
    let caller = ic_cdk::api::caller();

    match nfts::update_metadata(caller, id, name, description, image_url, category) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Error while updating metadata: {:?}", e)),
    }
}

/// Get a specific collection with the provided `CollectionId`.
#[query]
pub fn get_collection(id: CollectionId) -> Option<Collection> {
    nfts::get_collection(id)
}

#[update]
pub fn set_creator_metadata(name: String, avatar: String) -> Result<(), String> {
    let caller = ic_cdk::api::caller();

    if let Some(mut creator) = creators::creator_metadata(caller) {
        creator.name = name.clone();
        creator.avatar = avatar.clone();
        creators::set_creator_metadata(caller, creator)
    } else {
        let creator = Creator::new(name, avatar);
        creators::set_creator_metadata(caller, creator)
    }
}

#[query]
pub fn creator_metadata(creator: Principal) -> Option<(Creator, Badge)> {
    if let Some(creator) = creators::creator_metadata(creator) {
        let badge = creator.badge();
        Some((creator, badge))
    } else {
        None
    }
}

#[query]
pub fn top_n_creators(n: u8) -> Vec<(UserId, Creator, Badge)> {
    creators::top_n_creators(n.into())
}

#[query]
pub fn collections_created_by(creator: Principal) -> Vec<Collection> {
    nfts::collections_created_by(creator)
}

#[query]
pub fn collections_created_by_caller() -> Vec<Collection> {
    let caller = ic_cdk::api::caller();
    nfts::collections_created_by(caller)
}

#[update]
pub fn mint_nft(
    collection_id: CollectionId,
    receiver: Principal,
    name: String,
    description: String,
    asset_url: Option<String>,
    asset_type: Option<AssetType>,
) -> Result<NftId, String> {
    let caller = ic_cdk::api::caller();
    match nfts::mint_nft(caller, receiver, collection_id, name, description, asset_url) {
        Ok(id) => {
            // Register asset type on mint
            if let Some(asset_type) = asset_type {
                METADATA.with(|s| {
                    let mut state = s.borrow_mut();
                    let metadata = state.entry(id.clone()).or_default();
                    metadata.asset_type = asset_type;
                });
            }
            Ok(id)
        }
        Err(e) => Err(format!("Error while minting nft: {:?}", e)),
    }
}

#[update]
pub fn transfer_nft(collection_id: CollectionId, nft_id: Nat, receiver: Principal) -> Result<(), String> {
    let caller = ic_cdk::api::caller();
    match nfts::nft_transfer(caller, receiver, (collection_id, nft_id.into())) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Error while transfering the nft: {:?}", e)),
    }
}

#[query]
pub fn nfts_of_user(user: Principal) -> Vec<Nft> {
    nfts::nfts_of_user(user)
}

#[query]
pub fn nfts_of_caller() -> Vec<Nft> {
    let caller = ic_cdk::api::caller();
    nfts::nfts_of_user(caller)
}

#[query]
pub fn nfts(collection_id: CollectionId, start_index: Option<u128>, count: Option<u128>) -> Vec<Nft> {
    nfts::nfts_within_collection(collection_id, start_index, count)
}

#[query]
pub fn all_nfts(asset_type: Option<AssetType>, start_index: Option<u128>, count: Option<u128>) -> Vec<Nft> {
    let start_index = start_index.unwrap_or_default();

    let all = nfts::all_nfts();

    let filtered_by_type = all.iter().filter(|n| {
        if asset_type.is_none() {
            return true;
        }
        if let Some(metadata) = n.metadata() {
            metadata.asset_type == *asset_type.as_ref().unwrap()
        } else {
            false
        }
    });

    if let Some(c) = count {
        filtered_by_type
            .skip(start_index.try_into().unwrap())
            .take(c.try_into().unwrap())
            .cloned()
            .collect()
    } else {
        filtered_by_type.skip(start_index.try_into().unwrap()).cloned().collect()
    }
}

#[query]
pub fn collections(start_index: Option<u128>, count: Option<u128>) -> Vec<Collection> {
    nfts::all_collections(start_index, count)
}

#[query]
pub fn collection_count() -> CollectionId {
    nfts::collection_count()
}

// ---- reactions start ----
#[update(guard = "caller_is_not_anonymous")]
pub fn add_remove_reaction(collection_id: CollectionId, nft_id: Nat, emoji: Emoji) -> Result<AddRemoveReactionResult, String> {
    let caller = ic_cdk::api::caller();

    reactions::add_remove_reaction((collection_id, nft_id.into()), caller, emoji)
}

#[update(guard = "caller_is_admin")]
pub fn add_emojis(emojis: Vec<Emoji>) -> Result<Nat, String> {
    reactions::register_emojis(emojis)
}

#[update(guard = "caller_is_admin")]
pub fn remove_emojis(emojis: Vec<Emoji>) -> Result<Nat, String> {
    reactions::unregister_emojis(emojis)
}

#[query]
pub fn get_emojis() -> Vec<Emoji> {
    reactions::emojis()
}

// ---- reactions end ----

#[query]
pub fn get_nft_metadata(collection_id: CollectionId, nft_id: Nat) -> Option<NftMetadata> {
    nft_metadata::get_metadata((collection_id, nft_id.into()))
}

// ----- community start ----

#[update(guard = "caller_is_not_anonymous")]
pub fn create_community(
    slug: CommunityId,
    name: String,
    description: String,
    logo: String,
    hero_image: String,
    metadata: Vec<String>,
    homepage: String,
) -> Result<CommunityId, String> {
    let creator = ic_cdk::api::caller();
    communities::create_community(
        slug.clone(),
        creator,
        name,
        description,
        logo,
        hero_image,
        metadata,
        Socials { home: homepage },
    )?;

    Ok(slug)
}

// #[update(guard = "caller_is_not_anonymous")]
fn _join_community(community: CommunityId) -> Result<(), String> {
    let user = ic_cdk::api::caller();

    communities::join_community(community, user, true)?;

    Ok(())
}

// #[update(guard = "caller_is_not_anonymous")]
fn _leave_community(community: CommunityId) -> Result<(), String> {
    let user = ic_cdk::api::caller();

    communities::leave_community(community, user, true)?;

    Ok(())
}

// #[query]
fn _is_community_member(community: CommunityId, user: Principal) -> bool {
    communities::is_member(community, user)
}

#[update(guard = "caller_is_not_anonymous")]
pub fn follow_community(community: CommunityId) -> Result<(), String> {
    let user = ic_cdk::api::caller();

    communities::follow_community(community, user)?;

    Ok(())
}

#[update(guard = "caller_is_not_anonymous")]
pub fn unfollow_community(community: CommunityId) -> Result<(), String> {
    let user = ic_cdk::api::caller();

    communities::unfollow_community(community, user)?;

    Ok(())
}

#[query]
pub fn is_community_follower(community: CommunityId, user: Principal) -> bool {
    communities::is_follower(community, user)
}

// #[query]
pub fn _get_communities_joinned(user: Principal) -> Vec<Community> {
    communities::get_communities_joinned(user)
}

#[query]
pub fn get_communities_followed(user: Principal) -> Vec<Community> {
    communities::get_communities_followed(user)
}

#[query]
pub fn get_communities_created_by(user: Principal) -> Vec<Community> {
    communities::get_communities_created_by(user)
}

#[query]
pub fn total_communities() -> u64 {
    communities::total_communities()
}

#[query]
pub fn get_communities(start_index: Option<u128>, count: Option<u128>) -> Vec<Community> {
    communities::get_communities(start_index, count)
}

#[query]
pub fn get_community(slug: CommunityId) -> Option<Community> {
    communities::get_community(slug)
}

// ----- community end ----

// ----- course start ----
#[allow(clippy::too_many_arguments)]
#[update(guard = "caller_is_not_anonymous")]
pub fn create_course(
    slug: CourseId,
    title: String,
    description: String,
    level: CourseLevel,
    logo: String,
    content: String,
) -> Result<CourseId, String> {
    let user = ic_cdk::api::caller();

    courses::create_course(slug, title, description, level, logo, content, user)
}

#[update(guard = "caller_is_not_anonymous")]
pub fn finish_course(slug: CourseId) -> Result<(), String> {
    let user = ic_cdk::api::caller();

    courses::finish_course(user, slug)
}

#[query]
pub fn total_courses() -> u64 {
    courses::total_courses()
}

#[query]
pub fn get_courses(start_index: Option<u128>, count: Option<u128>) -> Vec<Course> {
    courses::get_courses(start_index, count)
}

#[query]
pub fn get_course(course_id: CourseId) -> Option<Course> {
    courses::get_course(course_id)
}

// ----- course end ----

// ----- token ----
#[update(guard = "caller_is_not_anonymous")]
pub async fn claim_rewards() -> Result<(), String> {
    let caller = ic_cdk::api::caller();

    let mut user = creators::creator_metadata(caller).ok_or("User not found")?;

    let rewards = user.claimable_rewards.clone();

    user.claim_rewards(rewards, caller, ic_cdk::api::time()).await?;

    creators::set_creator_metadata(caller, user)?;

    Ok(())
}

// ----- token end ----

// Administrative functions
#[update(guard = "caller_is_admin")]
pub fn set_collection_fee(fee: u64) -> Result<(), &'static str> {
    administrative::set_collection_fee(fee)
}

#[update(guard = "caller_is_admin")]
pub fn set_mint_fee(fee: u64) -> Result<(), &'static str> {
    administrative::set_mint_fee(fee)
}

#[update(guard = "caller_is_admin")]
pub fn set_vibe_token(vibe: Principal) -> Result<(), &'static str> {
    administrative::set_vibe_token(vibe)
}

#[update(guard = "caller_is_admin")]
pub fn add_admin(admin: Principal) -> Result<(), String> {
    let caller = ic_cdk::api::caller();
    admins::add_admins(caller, [admin].to_vec())
}

#[update(guard = "caller_is_admin")]
pub fn remove_admin(admin: Principal) -> Result<(), String> {
    let caller = ic_cdk::api::caller();
    admins::remove_admins(caller, [admin].to_vec())
}

#[query]
pub fn collection_fee() -> u64 {
    administrative::collection_fee()
}

#[query]
pub fn mint_fee() -> u64 {
    administrative::mint_fee()
}

#[query]
pub fn vibe_token() -> Option<Principal> {
    administrative::vibe_token()
}

/// Inter canister call should be `update` not `query`
// #[update]
pub async fn vibe_token_name() -> Option<String> {
    let principal = administrative::vibe_token();

    let vibe = principal.map(VibeToken::new);

    vibe.as_ref()?;

    Some(vibe.unwrap().icrc1_name().await.unwrap_or_default())
}

#[query]
pub fn is_admin(user: Principal) -> bool {
    admins::is_admin(user)
}

ic_cdk::export_candid!();
