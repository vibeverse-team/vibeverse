use crate::{
    creators,
    memory::COURSES,
    types::{score, Course, CourseId, CourseLevel, UserId},
};

#[allow(clippy::too_many_arguments)]
pub fn create_course(
    slug: CourseId,
    title: String,
    description: String,
    level: CourseLevel,
    logo: String,
    content: String,
    author: UserId,
) -> Result<CourseId, String> {
    let course = Course::new(slug.clone(), title, description, level, logo, content, author);
    COURSES.with(|courses| {
        // If course exists, throw error
        if courses.borrow().contains_key(&slug) {
            return Err(format!("Course {} already exists", slug));
        }

        courses.borrow_mut().insert(slug.clone(), course);

        Ok(())
    })?;

    let mut binding = creators::creator_metadata(author);
    let author_profile = binding.as_mut().expect("Not exist creator");
    author_profile.add_created_course_now(slug.clone())?;
    author_profile.add_score(score::CREATE_COURSE);
    creators::set_creator_metadata(author, author_profile.clone())?;

    Ok(slug)
}

pub fn finish_course(user_id: UserId, course_id: CourseId) -> Result<(), String> {
    COURSES.with(|courses| {
        let mut course = courses
            .borrow()
            .get(&course_id)
            .ok_or(format!("Course {} does not exist", course_id))?;
        course.add_learner(user_id);
        courses.borrow_mut().insert(course_id.clone(), course);

        Ok::<(), String>(())
    })?;

    let mut binding = creators::creator_metadata(user_id);
    let user_profile = binding.as_mut().expect("Not exist creator");
    user_profile.add_completed_course_now(course_id.clone())?;
    user_profile.add_score(score::FINISH_COURSE);

    creators::set_creator_metadata(user_id, user_profile.clone())
}

pub fn total_courses() -> u64 {
    COURSES.with(|c| {
        let courses = c.borrow();
        courses.len()
    })
}

pub fn get_courses(start_index: Option<u128>, count: Option<u128>) -> Vec<Course> {
    let start_index = start_index.unwrap_or_default();
    let count = count.unwrap_or(total_courses().into());

    let end = Into::<u128>::into(total_courses()).min(
        start_index
            .checked_add(count)
            .expect("adding `start_index` and `count` together overflowed."),
    );

    COURSES.with(|c| {
        let mut communities = Vec::new();

        for id in start_index..end {
            if let Some((_, community)) = c.borrow().iter().nth(id.try_into().unwrap()) {
                communities.push(community.clone());
            }
        }

        communities
    })
}

pub fn get_course(course_id: CourseId) -> Option<Course> {
    COURSES.with(|courses| courses.borrow().get(&course_id))
}
