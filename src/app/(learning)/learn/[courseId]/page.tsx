'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CirclePlay,
  FileText,
  GraduationCap,
  LoaderCircle,
  Menu,
  PlayCircle,
  X,
} from 'lucide-react';

import {
  getEnrolledCourseLearningContent,
  getMyCourseProgress,
  markLessonAsComplete,
  markLessonAsIncomplete,
  type CourseLearningContent,
  type CourseProgress,
  type LearningLesson,
} from '@/lib/student-learning-api';

const getYouTubeEmbedUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname === 'youtu.be') {
      const videoId = parsedUrl.pathname.slice(1);

      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (
      parsedUrl.hostname === 'www.youtube.com' ||
      parsedUrl.hostname === 'youtube.com'
    ) {
      if (parsedUrl.pathname === '/watch') {
        const videoId = parsedUrl.searchParams.get('v');

        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      }

      if (parsedUrl.pathname.startsWith('/embed/')) {
        return url;
      }

      if (parsedUrl.pathname.startsWith('/shorts/')) {
        const videoId = parsedUrl.pathname.split('/')[2];

        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      }
    }

    return null;
  } catch {
    return null;
  }
};

export default function LearningCoursePage() {
  const params = useParams<{ courseId: string }>();
  const courseId = Array.isArray(params.courseId)
    ? params.courseId[0]
    : params.courseId;

  const [content, setContent] = useState<CourseLearningContent | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    let isCancelled = false;

    const loadCourse = async () => {
      try {
        const [learningContent, courseProgress] = await Promise.all([
          getEnrolledCourseLearningContent(courseId),
          getMyCourseProgress(courseId),
        ]);

        if (isCancelled) {
          return;
        }

        const allLessons = learningContent.sections.flatMap(
          (section) => section.lessons
        );

        const firstIncompleteLesson =
          allLessons.find(
            (lesson) => !courseProgress.completedLessonIds.includes(lesson._id)
          ) ?? allLessons[0];

        setContent(learningContent);
        setProgress(courseProgress);
        setSelectedLessonId(firstIncompleteLesson?._id ?? '');
        setExpandedSections(
          learningContent.sections.map((section) => section._id)
        );
        setError('');
      } catch (caughtError) {
        if (!isCancelled) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : 'Unable to load this course.'
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadCourse();

    return () => {
      isCancelled = true;
    };
  }, [courseId]);

  const allLessons = useMemo(() => {
    return content?.sections.flatMap((section) => section.lessons) ?? [];
  }, [content]);

  const selectedLessonIndex = useMemo(() => {
    return allLessons.findIndex((lesson) => lesson._id === selectedLessonId);
  }, [allLessons, selectedLessonId]);

  const selectedLesson =
    selectedLessonIndex >= 0 ? allLessons[selectedLessonIndex] : null;

  const previousLesson =
    selectedLessonIndex > 0 ? allLessons[selectedLessonIndex - 1] : null;

  const nextLesson =
    selectedLessonIndex >= 0 && selectedLessonIndex < allLessons.length - 1
      ? allLessons[selectedLessonIndex + 1]
      : null;

  const completedLessonIds = useMemo(() => {
    return new Set(progress?.completedLessonIds ?? []);
  }, [progress]);

  const isSelectedLessonCompleted = selectedLesson
    ? completedLessonIds.has(selectedLesson._id)
    : false;

  const selectLesson = (lesson: LearningLesson) => {
    setSelectedLessonId(lesson._id);
    setIsSidebarOpen(false);
    setActionError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((previous) =>
      previous.includes(sectionId)
        ? previous.filter((item) => item !== sectionId)
        : [...previous, sectionId]
    );
  };

  const updateLessonCompletion = async () => {
    if (!selectedLesson || !progress || isUpdatingProgress) {
      return;
    }

    const wasCompleted = isSelectedLessonCompleted;

    setIsUpdatingProgress(true);
    setActionError('');

    try {
      const result = wasCompleted
        ? await markLessonAsIncomplete(selectedLesson._id)
        : await markLessonAsComplete(selectedLesson._id);

      const updatedCompletedIds = new Set(progress.completedLessonIds);

      if (result.completed) {
        updatedCompletedIds.add(selectedLesson._id);
      } else {
        updatedCompletedIds.delete(selectedLesson._id);
      }

      setProgress((previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          completedLessonIds: Array.from(updatedCompletedIds),
          totalLessons: result.totalLessons,
          completedLessons: result.completedLessons,
          progressPercentage: result.progressPercentage,
          status: result.isCourseCompleted ? 'COMPLETED' : 'ACTIVE',
          completedAt: result.isCourseCompleted
            ? (result.enrollment?.completedAt ?? new Date().toISOString())
            : null,
        };
      });

      if (!wasCompleted && !result.isCourseCompleted) {
        const nextIncompleteLesson = allLessons
          .slice(selectedLessonIndex + 1)
          .find((lesson) => !updatedCompletedIds.has(lesson._id));

        if (nextIncompleteLesson) {
          selectLesson(nextIncompleteLesson);
        }
      }
    } catch (caughtError) {
      setActionError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to update lesson progress.'
      );
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  if (isLoading) {
    return (
      <main className='grid min-h-screen place-items-center bg-slate-50 p-6'>
        <div className='flex items-center gap-2 text-sm font-medium text-slate-500'>
          <LoaderCircle className='h-5 w-5 animate-spin' />
          Loading your course...
        </div>
      </main>
    );
  }

  if (error || !content || !progress) {
    return (
      <main className='grid min-h-screen place-items-center bg-slate-50 p-6'>
        <div className='max-w-md rounded-2xl border border-rose-200 bg-white p-6 text-center shadow-sm'>
          <div className='mx-auto grid h-12 w-12 place-items-center rounded-full bg-rose-100 text-rose-600'>
            <AlertCircle className='h-6 w-6' />
          </div>

          <h1 className='mt-4 text-xl font-bold text-slate-900'>
            Unable to open course
          </h1>

          <p className='mt-2 text-sm leading-6 text-slate-600'>
            {error || 'Course learning content is unavailable.'}
          </p>

          <Link
            href='/dashboard/student/my-learning'
            className='mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700'
          >
            <ArrowLeft className='h-4 w-4' />
            Back to my learning
          </Link>
        </div>
      </main>
    );
  }

  const videoEmbedUrl =
    selectedLesson?.type === 'VIDEO' && selectedLesson.videoUrl
      ? getYouTubeEmbedUrl(selectedLesson.videoUrl)
      : null;

  return (
    <div className='min-h-screen bg-slate-50'>
      <header className='sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur'>
        <div className='mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6'>
          <div className='flex min-w-0 items-center gap-3'>
            <Link
              href='/dashboard/student/my-learning'
              className='grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50'
              aria-label='Back to my learning'
            >
              <ArrowLeft className='h-4 w-4' />
            </Link>

            <div className='min-w-0'>
              <p className='truncate text-sm font-bold text-slate-900'>
                {content.course.title}
              </p>

              <p className='text-xs text-slate-500'>
                {progress.progressPercentage}% complete
              </p>
            </div>
          </div>

          <button
            type='button'
            onClick={() => setIsSidebarOpen(true)}
            className='inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 lg:hidden'
          >
            <Menu className='h-4 w-4' />
            Content
          </button>
        </div>
      </header>

      <div className='mx-auto flex max-w-[1600px]'>
        {isSidebarOpen && (
          <button
            type='button'
            aria-label='Close course content'
            onClick={() => setIsSidebarOpen(false)}
            className='fixed inset-0 z-40 bg-slate-950/35 lg:hidden'
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-[min(22rem,88vw)] flex-col border-r border-slate-200 bg-white transition-transform lg:sticky lg:top-16 lg:z-10 lg:h-[calc(100vh-4rem)] lg:w-80 lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className='border-b border-slate-200 px-5 py-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-bold text-slate-900'>
                  Course content
                </p>

                <p className='mt-0.5 text-xs text-slate-500'>
                  {content.sections.length} sections · {allLessons.length}{' '}
                  lessons
                </p>
              </div>

              <button
                type='button'
                onClick={() => setIsSidebarOpen(false)}
                className='grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 lg:hidden'
                aria-label='Close course content'
              >
                <X className='h-4 w-4' />
              </button>
            </div>

            <div className='mt-4'>
              <div className='flex items-center justify-between text-xs font-semibold text-slate-600'>
                <span>
                  {progress.completedLessons} of {progress.totalLessons}{' '}
                  completed
                </span>

                <span>{progress.progressPercentage}%</span>
              </div>

              <div className='mt-2 h-2 overflow-hidden rounded-full bg-slate-100'>
                <div
                  className='h-full rounded-full bg-indigo-600 transition-all duration-300'
                  style={{ width: `${progress.progressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <nav className='min-h-0 flex-1 overflow-y-auto py-2'>
            {content.sections.length === 0 && (
              <div className='px-5 py-8 text-center text-sm text-slate-500'>
                Course lessons are being prepared.
              </div>
            )}

            {content.sections.map((section) => {
              const isExpanded = expandedSections.includes(section._id);

              return (
                <div key={section._id} className='border-b border-slate-100'>
                  <button
                    type='button'
                    onClick={() => toggleSection(section._id)}
                    className='flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-slate-50'
                  >
                    <span className='min-w-0'>
                      <span className='block text-xs font-bold tracking-wide text-indigo-600 uppercase'>
                        Section {section.order}
                      </span>

                      <span className='mt-1 block truncate text-sm font-semibold text-slate-800'>
                        {section.title}
                      </span>
                    </span>

                    {isExpanded ? (
                      <ChevronDown className='h-4 w-4 shrink-0 text-slate-500' />
                    ) : (
                      <ChevronRight className='h-4 w-4 shrink-0 text-slate-500' />
                    )}
                  </button>

                  {isExpanded && (
                    <div className='pb-2'>
                      {section.lessons.length === 0 && (
                        <p className='px-5 py-3 text-xs text-slate-500'>
                          No lessons in this section yet.
                        </p>
                      )}

                      {section.lessons.map((lesson) => {
                        const isSelected = lesson._id === selectedLessonId;
                        const isCompleted = completedLessonIds.has(lesson._id);
                        const LessonIcon =
                          lesson.type === 'VIDEO' ? PlayCircle : FileText;

                        return (
                          <button
                            key={lesson._id}
                            type='button'
                            onClick={() => selectLesson(lesson)}
                            className={`flex w-full items-start gap-3 px-5 py-3 text-left transition ${
                              isSelected
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className='mt-0.5 h-4 w-4 shrink-0 text-emerald-600' />
                            ) : (
                              <LessonIcon className='mt-0.5 h-4 w-4 shrink-0' />
                            )}

                            <span className='min-w-0 flex-1'>
                              <span
                                className={`block text-sm font-medium leading-5 ${
                                  isCompleted
                                    ? 'text-slate-500 line-through'
                                    : ''
                                }`}
                              >
                                {lesson.order}. {lesson.title}
                              </span>

                              <span className='mt-1 block text-xs text-slate-500'>
                                {lesson.type === 'VIDEO' ? 'Video' : 'Article'}{' '}
                                · {lesson.durationMinutes} min
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        <main className='min-w-0 flex-1 p-4 sm:p-6 lg:p-8'>
          {!selectedLesson && (
            <section className='grid min-h-[60vh] place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center'>
              <div className='max-w-md'>
                <div className='mx-auto grid h-14 w-14 place-items-center rounded-full bg-indigo-100 text-indigo-600'>
                  <GraduationCap className='h-7 w-7' />
                </div>

                <h1 className='mt-4 text-xl font-bold text-slate-900'>
                  Course content is coming soon
                </h1>

                <p className='mt-2 text-sm leading-6 text-slate-500'>
                  This course does not have any lessons yet.
                </p>
              </div>
            </section>
          )}

          {selectedLesson && (
            <article className='mx-auto max-w-5xl'>
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <div className='flex flex-wrap items-center gap-2 text-xs font-semibold text-indigo-600'>
                  <span className='rounded-full bg-indigo-50 px-2.5 py-1'>
                    {selectedLesson.type === 'VIDEO'
                      ? 'Video lesson'
                      : 'Article lesson'}
                  </span>

                  <span className='rounded-full bg-slate-100 px-2.5 py-1 text-slate-600'>
                    {selectedLesson.durationMinutes} min
                  </span>

                  <span className='rounded-full bg-slate-100 px-2.5 py-1 text-slate-600'>
                    Lesson {selectedLessonIndex + 1} of {allLessons.length}
                  </span>

                  {isSelectedLessonCompleted && (
                    <span className='inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-700'>
                      <Check className='h-3.5 w-3.5' />
                      Completed
                    </span>
                  )}
                </div>
              </div>

              <h1 className='mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl'>
                {selectedLesson.title}
              </h1>

              {selectedLesson.type === 'VIDEO' && (
                <section className='mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-sm'>
                  {videoEmbedUrl ? (
                    <div className='aspect-video'>
                      <iframe
                        src={videoEmbedUrl}
                        title={selectedLesson.title}
                        className='h-full w-full'
                        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className='grid aspect-video place-items-center p-6 text-center'>
                      <div className='max-w-md'>
                        <CirclePlay className='mx-auto h-12 w-12 text-indigo-300' />

                        <h2 className='mt-4 text-lg font-bold text-white'>
                          Video player unavailable
                        </h2>

                        <p className='mt-2 text-sm leading-6 text-slate-300'>
                          This lesson uses a video link that cannot be embedded
                          here.
                        </p>

                        {selectedLesson.videoUrl && (
                          <a
                            href={selectedLesson.videoUrl}
                            target='_blank'
                            rel='noreferrer'
                            className='mt-5 inline-flex items-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100'
                          >
                            Open video in a new tab
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {selectedLesson.type === 'ARTICLE' && (
                <section className='mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8'>
                  <div className='whitespace-pre-wrap text-[15px] leading-8 text-slate-700'>
                    {selectedLesson.content ||
                      'This article has no content yet.'}
                  </div>
                </section>
              )}

              {actionError && (
                <div className='mt-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700'>
                  <AlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
                  <p>{actionError}</p>
                </div>
              )}

              <section className='mt-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between'>
                <div>
                  <h2 className='font-bold text-slate-900'>
                    {isSelectedLessonCompleted
                      ? 'Lesson completed'
                      : 'Ready to finish this lesson?'}
                  </h2>

                  <p className='mt-1 text-sm leading-6 text-slate-600'>
                    {isSelectedLessonCompleted
                      ? 'You can mark it incomplete if you want to review it later.'
                      : 'Mark it complete when you finish watching or reading.'}
                  </p>
                </div>

                <button
                  type='button'
                  disabled={isUpdatingProgress}
                  onClick={updateLessonCompletion}
                  className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    isSelectedLessonCompleted
                      ? 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {isUpdatingProgress ? (
                    <>
                      <LoaderCircle className='h-4 w-4 animate-spin' />
                      Updating...
                    </>
                  ) : isSelectedLessonCompleted ? (
                    <>
                      <X className='h-4 w-4' />
                      Mark as incomplete
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className='h-4 w-4' />
                      Mark as complete
                    </>
                  )}
                </button>
              </section>

              <section className='mt-5 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between'>
                <button
                  type='button'
                  disabled={!previousLesson}
                  onClick={() => previousLesson && selectLesson(previousLesson)}
                  className='inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40'
                >
                  <ChevronLeft className='h-4 w-4' />
                  Previous lesson
                </button>

                <button
                  type='button'
                  disabled={!nextLesson}
                  onClick={() => nextLesson && selectLesson(nextLesson)}
                  className='inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40'
                >
                  Next lesson
                  <ArrowRight className='h-4 w-4' />
                </button>
              </section>

              {progress.status === 'COMPLETED' && (
                <section className='mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5'>
                  <div className='flex items-start gap-3'>
                    <GraduationCap className='mt-0.5 h-5 w-5 shrink-0 text-emerald-700' />

                    <div>
                      <h2 className='font-bold text-emerald-900'>
                        Course completed!
                      </h2>

                      <p className='mt-1 text-sm leading-6 text-emerald-800'>
                        Great work—you completed every lesson in this course.
                      </p>
                    </div>
                  </div>
                </section>
              )}
            </article>
          )}
        </main>
      </div>
    </div>
  );
}
