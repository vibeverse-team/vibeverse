use candid::Principal;

use crate::{creators::*, types::Creator};

#[test]
fn setting_creator_metadata_works() {
    let creator = get_creator();
    let name = String::from("Creator#1");
    let avatar = String::from("https://example.com/avatar.png");

    set_creator_metadata(creator, name.clone(), avatar.clone()).unwrap();

    assert_eq!(creator_metadata(creator), Some(Creator { name, avatar }));
}

#[test]
fn getting_creator_metadata_returns_none() {
    let creator = get_creator();
    assert_eq!(creator_metadata(creator), None);
}

fn get_creator() -> Principal {
    Principal::anonymous()
}