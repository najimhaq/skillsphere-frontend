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
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react';

import {
  createInstructorCourseSection,
  createInstructorLesson,
  deleteInstructorLesson,
  deleteInstructorSection,
  getInstructorCourseContent,
  updateInstructorLesson,
  updateInstructorSection,
  type CourseContent,
  type CourseLesson,
  type CourseSection,
  type LessonType,
} from '@/lib/instructor-course-api';

type LessonFormState = {
  title: string;
  type: LessonType;
  videoUrl: string;
  content: string;
  durationMinutes: string;
  isPreview: boolean;
};

const initialLessonForm: LessonFormState = {
  title: '',
  type: 'VIDEO',
  videoUrl: '',
  content: '',
  durationMinutes: '0',
  isPreview: false,
};

export default function CourseContentPage() {
  const params = useParams<{ courseId: string }>();

  const courseId = Array.isArray(params.courseId)
    ? params.courseId[0]
    : params.courseId;

  const [content, setContent] = useState<CourseContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [sectionTitle, setSectionTitle] = useState('');
  const [isSubmittingSection, setIsSubmittingSection] = useState(false);
  const [error, setError] = useState('');

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<CourseLesson | null>(null);
  const [lessonForm, setLessonForm] =
    useState<LessonFormState>(initialLessonForm);
  const [isSavingLesson, setIsSavingLesson] = useState(false);
  const [actionLessonId, setActionLessonId] = useState<string | null>(null);

  const [editingSection, setEditingSection] = useState<CourseSection | null>(
    null
  );
  const [editingSectionTitle, setEditingSectionTitle] = useState('');
  const [isSavingSection, setIsSavingSection] = useState(false);
  const [actionSectionId, setActionSectionId] = useState<string | null>(null);

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

  const resetLessonModal = () => {
    if (isSavingLesson) return;

    setActiveSectionId(null);
    setEditingLesson(null);
    setLessonForm(initialLessonForm);
  };

  const openCreateLessonModal = (sectionId: string) => {
    setError('');
    setEditingLesson(null);
    setLessonForm(initialLessonForm);
    setActiveSectionId(sectionId);
  };

  const openEditLessonModal = (lesson: CourseLesson) => {
    setError('');
    setActiveSectionId(lesson.sectionId);
    setEditingLesson(lesson);

    setLessonForm({
      title: lesson.title,
      type: lesson.type,
      videoUrl: lesson.videoUrl ?? '',
      content: lesson.content ?? '',
      durationMinutes: String(lesson.durationMinutes),
      isPreview: lesson.isPreview,
    });
  };

  const updateLessonForm = <Key extends keyof LessonFormState>(
    key: Key,
    value: LessonFormState[Key]
  ) => {
    setLessonForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleCreateSection = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!courseId || !sectionTitle.trim()) return;

    try {
      setIsSubmittingSection(true);
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
      setIsSubmittingSection(false);
    }
  };

  const handleSaveLesson = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!content || !activeSectionId) return;

    const title = lessonForm.title.trim();
    const durationMinutes = Number(lessonForm.durationMinutes);

    if (!title) {
      setError('Lesson title is required.');
      return;
    }

    if (!Number.isInteger(durationMinutes) || durationMinutes < 0) {
      setError('Duration must be a whole number greater than or equal to 0.');
      return;
    }

    if (lessonForm.type === 'VIDEO' && !lessonForm.videoUrl.trim()) {
      setError('Video URL is required for a video lesson.');
      return;
    }

    if (
      lessonForm.type === 'ARTICLE' &&
      lessonForm.content.trim().length < 20
    ) {
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
      setIsSavingLesson(true);
      setError('');

      const basePayload = {
        title,
        durationMinutes,
        isPreview: lessonForm.isPreview,
      };

      const payload =
        lessonForm.type === 'VIDEO'
          ? {
              ...basePayload,
              type: 'VIDEO' as const,
              videoUrl: lessonForm.videoUrl.trim(),
            }
          : {
              ...basePayload,
              type: 'ARTICLE' as const,
              content: lessonForm.content.trim(),
            };

      if (editingLesson) {
        const updatedLesson = await updateInstructorLesson(
          editingLesson._id,
          payload
        );

        setContent((previous) => {
          if (!previous) return previous;

          return {
            ...previous,
            sections: previous.sections.map((section) => ({
              ...section,
              lessons: section.lessons.map((lesson) =>
                lesson._id === updatedLesson._id ? updatedLesson : lesson
              ),
            })),
          };
        });
      } else {
        const createPayload = {
          ...payload,
          order: selectedSection.lessons.length + 1,
        };

        const newLesson = await createInstructorLesson(
          activeSectionId,
          createPayload
        );

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
      }

      resetLessonModal();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : editingLesson
            ? 'Unable to update lesson.'
            : 'Unable to create lesson.'
      );
    } finally {
      setIsSavingLesson(false);
    }
  };

  const handleDeleteLesson = async (lesson: CourseLesson) => {
    const confirmed = window.confirm(
      `Delete "${lesson.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setActionLessonId(lesson._id);
      setError('');

      await deleteInstructorLesson(lesson._id);

      setContent((previous) => {
        if (!previous) return previous;

        return {
          ...previous,
          sections: previous.sections.map((section) => {
            if (section._id !== lesson.sectionId) {
              return section;
            }

            const remainingLessons = section.lessons
              .filter((item) => item._id !== lesson._id)
              .map((item, index) => ({
                ...item,
                order: index + 1,
              }));

            return {
              ...section,
              lessons: remainingLessons,
            };
          }),
        };
      });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to delete lesson.'
      );
    } finally {
      setActionLessonId(null);
    }
  };

  const openEditSectionModal = (section: CourseSection) => {
    setError('');
    setEditingSection(section);
    setEditingSectionTitle(section.title);
  };

  const closeEditSectionModal = () => {
    if (isSavingSection) return;

    setEditingSection(null);
    setEditingSectionTitle('');
  };

  const handleUpdateSection = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingSection) return;

    const title = editingSectionTitle.trim();

    if (title.length < 2) {
      setError('Section title must be at least 2 characters.');
      return;
    }

    try {
      setIsSavingSection(true);
      setError('');

      const updatedSection = await updateInstructorSection(editingSection._id, {
        title,
      });

      setContent((previous) => {
        if (!previous) return previous;

        return {
          ...previous,
          sections: previous.sections.map((section) =>
            section._id === updatedSection._id
              ? {
                  ...section,
                  ...updatedSection,
                  lessons: section.lessons,
                }
              : section
          ),
        };
      });

      closeEditSectionModal();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to update section.'
      );
    } finally {
      setIsSavingSection(false);
    }
  };

  const handleDeleteSection = async (section: CourseSection) => {
    const confirmed = window.confirm(
      `Delete "${section.title}" and all ${section.lessons.length} lesson${
        section.lessons.length === 1 ? '' : 's'
      }? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setActionSectionId(section._id);
      setError('');

      await deleteInstructorSection(section._id);

      setContent((previous) => {
        if (!previous) return previous;

        const remainingSections = previous.sections
          .filter((item) => item._id !== section._id)
          .map((item, index) => ({
            ...item,
            order: index + 1,
          }));

        return {
          ...previous,
          sections: remainingSections,
        };
      });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to delete section.'
      );
    } finally {
      setActionSectionId(null);
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
                    disabled={isSubmittingSection || !sectionTitle.trim()}
                    className='inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60'
                  >
                    {isSubmittingSection ? (
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

                      <div className='flex shrink-0 items-center gap-2'>
                        <button
                          type='button'
                          disabled={actionSectionId === section._id}
                          onClick={() => openEditSectionModal(section)}
                          className='grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'
                          title='Edit section'
                          aria-label={`Edit ${section.title}`}
                        >
                          <Pencil className='h-4 w-4' />
                        </button>

                        <button
                          type='button'
                          disabled={actionSectionId === section._id}
                          onClick={() => handleDeleteSection(section)}
                          className='grid h-9 w-9 place-items-center rounded-lg border border-rose-200 text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50'
                          title='Delete section'
                          aria-label={`Delete ${section.title}`}
                        >
                          {actionSectionId === section._id ? (
                            <LoaderCircle className='h-4 w-4 animate-spin' />
                          ) : (
                            <Trash2 className='h-4 w-4' />
                          )}
                        </button>

                        <button
                          type='button'
                          disabled={actionSectionId === section._id}
                          onClick={() => openCreateLessonModal(section._id)}
                          className='inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'
                        >
                          <Plus className='h-4 w-4' />
                          Add lesson
                        </button>

                        <ChevronDown className='h-5 w-5 text-slate-400' />
                      </div>
                    </div>

                    <div className='divide-y divide-slate-100'>
                      {section.lessons.length === 0 ? (
                        <div className='px-5 py-5 text-sm text-slate-500'>
                          No lessons in this section yet.
                        </div>
                      ) : (
                        section.lessons.map((lesson) => {
                          const isBusy = actionLessonId === lesson._id;

                          return (
                            <div
                              key={lesson._id}
                              className='flex items-center gap-3 px-5 py-4'
                            >
                              <GripVertical className='h-4 w-4 shrink-0 text-slate-300' />

                              <div className='grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600'>
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
                                  {lesson.type === 'VIDEO'
                                    ? 'Video'
                                    : 'Article'}
                                  {' · '}
                                  {lesson.durationMinutes} min
                                  {lesson.isPreview ? ' · Free preview' : ''}
                                </p>
                              </div>

                              <div className='flex shrink-0 items-center gap-2'>
                                <button
                                  type='button'
                                  disabled={isBusy}
                                  onClick={() => openEditLessonModal(lesson)}
                                  className='grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'
                                  title='Edit lesson'
                                  aria-label={`Edit ${lesson.title}`}
                                >
                                  <Pencil className='h-4 w-4' />
                                </button>

                                <button
                                  type='button'
                                  disabled={isBusy}
                                  onClick={() => handleDeleteLesson(lesson)}
                                  className='grid h-9 w-9 place-items-center rounded-lg border border-rose-200 text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50'
                                  title='Delete lesson'
                                  aria-label={`Delete ${lesson.title}`}
                                >
                                  {isBusy ? (
                                    <LoaderCircle className='h-4 w-4 animate-spin' />
                                  ) : (
                                    <Trash2 className='h-4 w-4' />
                                  )}
                                </button>

                                <ChevronRight className='h-4 w-4 text-slate-400' />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </article>
                ))
              )}
            </section>
          </>
        )}
      </div>

      {editingSection && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4'
          role='dialog'
          aria-modal='true'
          aria-labelledby='section-modal-title'
        >
          <form
            onSubmit={handleUpdateSection}
            className='w-full max-w-md rounded-2xl bg-white shadow-2xl'
          >
            <div className='flex items-center justify-between border-b border-slate-200 px-6 py-5'>
              <div>
                <h2
                  id='section-modal-title'
                  className='text-xl font-bold text-slate-900'
                >
                  Edit section
                </h2>

                <p className='mt-1 text-sm text-slate-500'>
                  Update this section title.
                </p>
              </div>

              <button
                type='button'
                onClick={closeEditSectionModal}
                disabled={isSavingSection}
                aria-label='Close section form'
                className='grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            <div className='p-6'>
              <label
                htmlFor='editSectionTitle'
                className='text-sm font-semibold text-slate-800'
              >
                Section title
              </label>

              <input
                id='editSectionTitle'
                autoFocus
                required
                minLength={2}
                maxLength={120}
                value={editingSectionTitle}
                onChange={(event) => setEditingSectionTitle(event.target.value)}
                className='mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
              />
            </div>

            <div className='flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:justify-end'>
              <button
                type='button'
                onClick={closeEditSectionModal}
                disabled={isSavingSection}
                className='rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'
              >
                Cancel
              </button>

              <button
                type='submit'
                disabled={
                  isSavingSection || editingSectionTitle.trim().length < 2
                }
                className='inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60'
              >
                {isSavingSection && (
                  <LoaderCircle className='h-4 w-4 animate-spin' />
                )}
                Save changes
              </button>
            </div>
          </form>
        </div>
      )}

      {activeSectionId && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4'
          role='dialog'
          aria-modal='true'
          aria-labelledby='lesson-modal-title'
        >
          <form
            onSubmit={handleSaveLesson}
            className='max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl'
          >
            <div className='flex items-center justify-between border-b border-slate-200 px-6 py-5'>
              <div>
                <h2
                  id='lesson-modal-title'
                  className='text-xl font-bold text-slate-900'
                >
                  {editingLesson ? 'Edit lesson' : 'Add lesson'}
                </h2>

                <p className='mt-1 text-sm text-slate-500'>
                  {editingLesson
                    ? 'Update the lesson details below.'
                    : 'Choose the lesson type and add its content.'}
                </p>
              </div>

              <button
                type='button'
                onClick={resetLessonModal}
                disabled={isSavingLesson}
                aria-label='Close lesson form'
                className='grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50'
              >
                <X className='h-5 w-5' />
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
                  value={lessonForm.title}
                  onChange={(event) =>
                    updateLessonForm('title', event.target.value)
                  }
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
                  value={lessonForm.type}
                  onChange={(event) => {
                    const nextType = event.target.value as LessonType;

                    setLessonForm((previous) => ({
                      ...previous,
                      type: nextType,
                    }));
                  }}
                  className='mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
                >
                  <option value='VIDEO'>Video lesson</option>
                  <option value='ARTICLE'>Article lesson</option>
                </select>
              </div>

              {lessonForm.type === 'VIDEO' ? (
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
                    value={lessonForm.videoUrl}
                    onChange={(event) =>
                      updateLessonForm('videoUrl', event.target.value)
                    }
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
                    rows={8}
                    value={lessonForm.content}
                    onChange={(event) =>
                      updateLessonForm('content', event.target.value)
                    }
                    placeholder='Write your lesson content here...'
                    className='mt-2 w-full resize-y rounded-xl border border-slate-300 px-3 py-2.5 text-sm leading-6 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
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
                    value={lessonForm.durationMinutes}
                    onChange={(event) =>
                      updateLessonForm('durationMinutes', event.target.value)
                    }
                    className='mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
                  />
                </div>

                <label className='flex cursor-pointer items-center gap-3 pt-7 text-sm font-semibold text-slate-800'>
                  <input
                    type='checkbox'
                    checked={lessonForm.isPreview}
                    onChange={(event) =>
                      updateLessonForm('isPreview', event.target.checked)
                    }
                    className='h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500'
                  />
                  Free preview
                </label>
              </div>
            </div>

            <div className='flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:justify-end'>
              <button
                type='button'
                onClick={resetLessonModal}
                disabled={isSavingLesson}
                className='rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'
              >
                Cancel
              </button>

              <button
                type='submit'
                disabled={isSavingLesson}
                className='inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60'
              >
                {isSavingLesson && (
                  <LoaderCircle className='h-4 w-4 animate-spin' />
                )}
                {editingLesson ? 'Save changes' : 'Create lesson'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
