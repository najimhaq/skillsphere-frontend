// src/app/(dashboard)/dashboard/instructor/courses/[courseId]/content/page.tsx
'use client';

import { useEffect, useState, type SubmitEvent } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronRight,
  CirclePlus,
  FileText,
  Film,
  GripVertical,
  LoaderCircle,
  Plus,
} from 'lucide-react';

import {
  createInstructorCourseSection,
  createInstructorLesson,
  getInstructorCourseContent,
  type CourseContent,
  type LessonType,
} from '@/lib/instructor-course-api';

export default function CourseContentPage() {
  const params = useParams<{ courseId: string }>();

  const courseId = Array.isArray(params.courseId)
    ? params.courseId[0]
    : params.courseId;

  const [content, setContent] = useState<CourseContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [sectionTitle, setSectionTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonType, setLessonType] = useState<LessonType>('VIDEO');
  const [videoUrl, setVideoUrl] = useState('');
  const [articleContent, setArticleContent] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('0');
  const [isPreview, setIsPreview] = useState(false);
  const [isCreatingLesson, setIsCreatingLesson] = useState(false);

  useEffect(() => {
    if (!courseId) {
      queueMicrotask(() => {
        setError('Invalid course identifier.');
        setIsLoading(false);
      });

      return;
    }

    let isCancelled = false;

    const loadContent = async () => {
      try {
        const data = await getInstructorCourseContent(courseId);

        if (!isCancelled) {
          setContent(data);
          setError('');
        }
      } catch (caughtError) {
        if (!isCancelled) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : 'Unable to load course content.'
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadContent();

    return () => {
      isCancelled = true;
    };
  }, [courseId]);

  const resetLessonForm = () => {
    setActiveSectionId(null);
    setLessonTitle('');
    setLessonType('VIDEO');
    setVideoUrl('');
    setArticleContent('');
    setDurationMinutes('0');
    setIsPreview(false);
  };

  const handleCreateSection = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!courseId || !sectionTitle.trim()) return;

    try {
      setIsSubmitting(true);
      setError('');

      const newSection = await createInstructorCourseSection(courseId, {
        title: sectionTitle.trim(),
        order: (content?.sections.length ?? 0) + 1,
      });

      setContent((previous) => {
        if (!previous) return previous;

        return {
          ...previous,
          sections: [
            ...previous.sections,
            {
              ...newSection,
              lessons: [],
            },
          ],
        };
      });

      setSectionTitle('');
      setIsCreatingSection(false);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to create section.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateLesson = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!activeSectionId || !content) return;

    const title = lessonTitle.trim();
    const parsedDuration = Number(durationMinutes);

    if (!title) {
      setError('Lesson title is required.');
      return;
    }

    if (!Number.isInteger(parsedDuration) || parsedDuration < 0) {
      setError('Duration must be a whole number greater than or equal to 0.');
      return;
    }

    if (lessonType === 'VIDEO' && !videoUrl.trim()) {
      setError('Video URL is required for a video lesson.');
      return;
    }

    if (lessonType === 'ARTICLE' && articleContent.trim().length < 20) {
      setError('Article content must contain at least 20 characters.');
      return;
    }

    const selectedSection = content.sections.find(
      (section) => section._id === activeSectionId
    );

    if (!selectedSection) {
      setError('Selected section was not found.');
      return;
    }

    try {
      setIsCreatingLesson(true);
      setError('');

      const basePayload = {
        title,
        durationMinutes: parsedDuration,
        isPreview,
        order: selectedSection.lessons.length + 1,
      };

      const payload =
        lessonType === 'VIDEO'
          ? {
              ...basePayload,
              type: 'VIDEO' as const,
              videoUrl: videoUrl.trim(),
            }
          : {
              ...basePayload,
              type: 'ARTICLE' as const,
              content: articleContent.trim(),
            };

      const newLesson = await createInstructorLesson(activeSectionId, payload);

      setContent((previous) => {
        if (!previous) return previous;

        return {
          ...previous,
          sections: previous.sections.map((section) =>
            section._id === activeSectionId
              ? {
                  ...section,
                  lessons: [...section.lessons, newLesson],
                }
              : section
          ),
        };
      });

      resetLessonForm();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to create lesson.'
      );
    } finally {
      setIsCreatingLesson(false);
    }
  };

  if (isLoading) {
    return (
      <div className='grid min-h-80 place-items-center'>
        <div className='flex items-center gap-2 text-sm font-medium text-slate-500'>
          <LoaderCircle className='h-5 w-5 animate-spin' />
          Loading course content...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='mx-auto max-w-5xl'>
        <Link
          href='/dashboard/instructor/courses'
          className='inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-indigo-600'
        >
          <ArrowLeft className='h-4 w-4' />
          Back to my courses
        </Link>

        {error && (
          <div className='mt-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700'>
            <AlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
            <p>{error}</p>
          </div>
        )}

        {content && (
          <>
            <section className='mt-6 flex flex-col gap-4 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between'>
              <div>
                <p className='text-sm font-semibold text-indigo-600'>
                  Course builder
                </p>

                <h1 className='mt-1 text-3xl font-bold tracking-tight text-slate-900'>
                  {content.course.title}
                </h1>

                <p className='mt-2 text-sm text-slate-600'>
                  Organize your course into sections and lessons.
                </p>
              </div>

              <button
                type='button'
                onClick={() => setIsCreatingSection((previous) => !previous)}
                className='inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700'
              >
                <CirclePlus className='h-4 w-4' />
                Add section
              </button>
            </section>

            {isCreatingSection && (
              <form
                onSubmit={handleCreateSection}
                className='mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-5'
              >
                <label
                  htmlFor='sectionTitle'
                  className='text-sm font-semibold text-slate-800'
                >
                  Section title
                </label>

                <div className='mt-3 flex flex-col gap-3 sm:flex-row'>
                  <input
                    id='sectionTitle'
                    autoFocus
                    required
                    value={sectionTitle}
                    onChange={(event) => setSectionTitle(event.target.value)}
                    placeholder='e.g. Introduction and setup'
                    className='min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
                  />

                  <button
                    type='submit'
                    disabled={isSubmitting || !sectionTitle.trim()}
                    className='inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60'
                  >
                    {isSubmitting ? (
                      <LoaderCircle className='h-4 w-4 animate-spin' />
                    ) : (
                      <Plus className='h-4 w-4' />
                    )}
                    Create section
                  </button>
                </div>
              </form>
            )}

            <section className='mt-8 space-y-4'>
              {content.sections.length === 0 ? (
                <div className='grid min-h-72 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center'>
                  <div>
                    <div className='mx-auto grid h-14 w-14 place-items-center rounded-full bg-indigo-100 text-indigo-600'>
                      <BookOpen className='h-7 w-7' />
                    </div>

                    <h2 className='mt-4 text-lg font-bold text-slate-900'>
                      Start building your course
                    </h2>

                    <p className='mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500'>
                      Add your first section, then create lessons inside it.
                    </p>

                    <button
                      type='button'
                      onClick={() => setIsCreatingSection(true)}
                      className='mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700'
                    >
                      <CirclePlus className='h-4 w-4' />
                      Add your first section
                    </button>
                  </div>
                </div>
              ) : (
                content.sections.map((section) => (
                  <article
                    key={section._id}
                    className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'
                  >
                    <div className='flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4'>
                      <GripVertical className='h-5 w-5 text-slate-400' />

                      <div className='grid h-7 w-7 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700'>
                        {section.order}
                      </div>

                      <div className='min-w-0 flex-1'>
                        <h2 className='truncate font-bold text-slate-900'>
                          {section.title}
                        </h2>

                        <p className='mt-0.5 text-xs text-slate-500'>
                          {section.lessons.length} lesson
                          {section.lessons.length === 1 ? '' : 's'}
                        </p>
                      </div>

                      <button
                        type='button'
                        onClick={() => setActiveSectionId(section._id)}
                        className='inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50'
                      >
                        <Plus className='h-4 w-4' />
                        Add lesson
                      </button>

                      <ChevronDown className='h-5 w-5 text-slate-400' />
                    </div>

                    <div className='divide-y divide-slate-100'>
                      {section.lessons.length === 0 ? (
                        <div className='px-5 py-5 text-sm text-slate-500'>
                          No lessons in this section yet.
                        </div>
                      ) : (
                        section.lessons.map((lesson) => (
                          <div
                            key={lesson._id}
                            className='flex items-center gap-3 px-5 py-4'
                          >
                            <GripVertical className='h-4 w-4 text-slate-300' />

                            <div className='grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-600'>
                              {lesson.type === 'VIDEO' ? (
                                <Film className='h-4 w-4' />
                              ) : (
                                <FileText className='h-4 w-4' />
                              )}
                            </div>

                            <div className='min-w-0 flex-1'>
                              <p className='truncate text-sm font-semibold text-slate-800'>
                                {lesson.order}. {lesson.title}
                              </p>

                              <p className='mt-0.5 text-xs text-slate-500'>
                                {lesson.type === 'VIDEO' ? 'Video' : 'Article'}
                                {' · '}
                                {lesson.durationMinutes} min
                                {lesson.isPreview ? ' · Free preview' : ''}
                              </p>
                            </div>

                            <ChevronRight className='h-4 w-4 text-slate-400' />
                          </div>
                        ))
                      )}
                    </div>
                  </article>
                ))
              )}
            </section>
          </>
        )}
      </div>

      {activeSectionId && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4'
          role='dialog'
          aria-modal='true'
          aria-labelledby='add-lesson-title'
        >
          <form
            onSubmit={handleCreateLesson}
            className='max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl'
          >
            <div className='flex items-center justify-between border-b border-slate-200 px-6 py-5'>
              <div>
                <h2
                  id='add-lesson-title'
                  className='text-xl font-bold text-slate-900'
                >
                  Add lesson
                </h2>

                <p className='mt-1 text-sm text-slate-500'>
                  Choose the lesson type and add its content.
                </p>
              </div>

              <button
                type='button'
                onClick={resetLessonForm}
                disabled={isCreatingLesson}
                className='rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50'
              >
                Close
              </button>
            </div>

            <div className='space-y-5 p-6'>
              <div>
                <label
                  htmlFor='lessonTitle'
                  className='text-sm font-semibold text-slate-800'
                >
                  Lesson title
                </label>

                <input
                  id='lessonTitle'
                  autoFocus
                  required
                  value={lessonTitle}
                  onChange={(event) => setLessonTitle(event.target.value)}
                  placeholder='e.g. Welcome to the course'
                  className='mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
                />
              </div>

              <div>
                <label
                  htmlFor='lessonType'
                  className='text-sm font-semibold text-slate-800'
                >
                  Lesson type
                </label>

                <select
                  id='lessonType'
                  value={lessonType}
                  onChange={(event) =>
                    setLessonType(event.target.value as LessonType)
                  }
                  className='mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
                >
                  <option value='VIDEO'>Video lesson</option>
                  <option value='ARTICLE'>Article lesson</option>
                </select>
              </div>

              {lessonType === 'VIDEO' ? (
                <div>
                  <label
                    htmlFor='videoUrl'
                    className='text-sm font-semibold text-slate-800'
                  >
                    Video URL
                  </label>

                  <input
                    id='videoUrl'
                    type='url'
                    required
                    value={videoUrl}
                    onChange={(event) => setVideoUrl(event.target.value)}
                    placeholder='https://youtube.com/...'
                    className='mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
                  />
                </div>
              ) : (
                <div>
                  <label
                    htmlFor='articleContent'
                    className='text-sm font-semibold text-slate-800'
                  >
                    Article content
                  </label>

                  <textarea
                    id='articleContent'
                    required
                    minLength={20}
                    rows={7}
                    value={articleContent}
                    onChange={(event) => setArticleContent(event.target.value)}
                    placeholder='Write your lesson content here...'
                    className='mt-2 w-full resize-y rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
                  />

                  <p className='mt-2 text-xs text-slate-500'>
                    Minimum 20 characters.
                  </p>
                </div>
              )}

              <div className='grid gap-4 sm:grid-cols-2'>
                <div>
                  <label
                    htmlFor='durationMinutes'
                    className='text-sm font-semibold text-slate-800'
                  >
                    Duration (minutes)
                  </label>

                  <input
                    id='durationMinutes'
                    type='number'
                    min='0'
                    step='1'
                    value={durationMinutes}
                    onChange={(event) => setDurationMinutes(event.target.value)}
                    className='mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
                  />
                </div>

                <label className='flex cursor-pointer items-center gap-3 pt-7 text-sm font-semibold text-slate-800'>
                  <input
                    type='checkbox'
                    checked={isPreview}
                    onChange={(event) => setIsPreview(event.target.checked)}
                    className='h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500'
                  />
                  Free preview
                </label>
              </div>
            </div>

            <div className='flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:justify-end'>
              <button
                type='button'
                onClick={resetLessonForm}
                disabled={isCreatingLesson}
                className='rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'
              >
                Cancel
              </button>

              <button
                type='submit'
                disabled={isCreatingLesson}
                className='inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60'
              >
                {isCreatingLesson && (
                  <LoaderCircle className='h-4 w-4 animate-spin' />
                )}
                Create lesson
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
