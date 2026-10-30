/**
 * Photos cut from Edwin's reference designs, for design builds only. They
 * live inside src/mock, so deployment builds (which resolve @/mock to an
 * empty module) never carry them.
 */
type Photo = number;

export const photos = {
  homeHero: require('./images/home-hero.jpg') as Photo,
  homeLive: [
    require('./images/home-live-1.jpg') as Photo,
    require('./images/home-live-2.jpg') as Photo,
    require('./images/home-live-3.jpg') as Photo,
    require('./images/home-live-4.jpg') as Photo,
    require('./images/home-live-5.jpg') as Photo,
  ],
  homeSampleVideo: require('./images/home-sample-video.jpg') as Photo,
  courseTrailer: require('./images/course-trailer.jpg') as Photo,
  courseTeacher: require('./images/course-teacher.jpg') as Photo,
  courseRelated: [require('./images/course-related-1.jpg') as Photo, require('./images/course-related-2.jpg') as Photo],
  explore: [
    require('./images/explore-1.jpg') as Photo,
    require('./images/explore-2.jpg') as Photo,
    require('./images/explore-3.jpg') as Photo,
    require('./images/explore-4.jpg') as Photo,
    require('./images/explore-5.jpg') as Photo,
    require('./images/explore-6.jpg') as Photo,
    require('./images/explore-7.jpg') as Photo,
    require('./images/explore-8.jpg') as Photo,
  ],
  shorts: [
    require('./images/short-1.jpg') as Photo,
    require('./images/short-2.jpg') as Photo,
    require('./images/short-3.jpg') as Photo,
    require('./images/short-4.jpg') as Photo,
    require('./images/short-5.jpg') as Photo,
    require('./images/short-6.jpg') as Photo,
    require('./images/short-7.jpg') as Photo,
    require('./images/short-8.jpg') as Photo,
    require('./images/short-9.jpg') as Photo,
    require('./images/short-10.jpg') as Photo,
  ],
  shortsHero: require('./images/shorts-hero.jpg') as Photo,
  liveHero: require('./images/live-hero.jpg') as Photo,
  liveMore: [
    require('./images/live-more-1.jpg') as Photo,
    require('./images/live-more-2.jpg') as Photo,
    require('./images/live-more-3.jpg') as Photo,
    require('./images/live-more-4.jpg') as Photo,
  ],
  classStage: require('./images/class-stage.jpg') as Photo,
  classTiles: [
    require('./images/class-tile-1.jpg') as Photo,
    require('./images/class-tile-2.jpg') as Photo,
    require('./images/class-tile-3.jpg') as Photo,
    require('./images/class-tile-4.jpg') as Photo,
    require('./images/class-tile-5.jpg') as Photo,
  ],
  classFaces: [
    require('./images/class-face-1.jpg') as Photo,
    require('./images/class-face-2.jpg') as Photo,
    require('./images/class-face-3.jpg') as Photo,
    require('./images/class-face-4.jpg') as Photo,
    require('./images/class-face-5.jpg') as Photo,
    require('./images/class-face-6.jpg') as Photo,
  ],
  teacherBanner: require('./images/teacher-banner.jpg') as Photo,
  teacherAvatar: require('./images/teacher-avatar.jpg') as Photo,
  teacherCourses: [require('./images/teacher-course-1.jpg') as Photo, require('./images/teacher-course-2.jpg') as Photo, require('./images/teacher-course-3.jpg') as Photo],
  teacherShorts: [require('./images/teacher-short-1.jpg') as Photo, require('./images/teacher-short-2.jpg') as Photo, require('./images/teacher-short-3.jpg') as Photo],
};
