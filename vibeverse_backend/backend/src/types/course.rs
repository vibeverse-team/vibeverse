use candid::CandidType;
use ic_stable_structures::{storable::Bound, Storable};
use serde::{Deserialize, Serialize};
use std::borrow::Cow;

use libraries::msgpack::{deserialize_then_unwrap, serialize_then_unwrap};

use super::{Badge, UserId};

pub type CourseId = String;

#[derive(Clone, CandidType, PartialEq, Eq, PartialOrd, Ord, Debug, Serialize, Deserialize, Default)]
#[repr(u8)]
pub enum CourseLevel {
    #[default]
    Beginner,
    Intermediate,
    Advanced,
}

#[derive(Clone, CandidType, PartialEq, Debug, Serialize, Deserialize)]
pub struct Course {
    #[serde(rename = "s", default)]
    pub slug: CourseId,

    #[serde(rename = "t", default)]
    pub title: String,

    #[serde(rename = "d", default)]
    pub description: String,

    #[serde(rename = "lv", default)]
    pub level: CourseLevel,

    #[serde(rename = "l", default)]
    pub logo: String,

    #[serde(rename = "c", default)]
    pub content: String,

    #[serde(rename = "a")]
    pub author: UserId,

    #[serde(rename = "b")]
    pub badge: Badge,
}

impl Storable for Course {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(serialize_then_unwrap(self))
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        deserialize_then_unwrap(bytes.as_ref())
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Course {
    pub fn new(
        slug: CourseId,
        title: String,
        description: String,
        level: CourseLevel,
        logo: String,
        content: String,
        author: UserId,
        badge: Badge,
    ) -> Self {
        Self {
            slug,
            title,
            description,
            level,
            logo,
            content,
            author,
            badge,
        }
    }
}
