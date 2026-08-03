const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export type InstructorStudentStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type InstructorStudentSummary = {
  totalStudents: number;
  activeEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
};

export type InstructorCourseOption = {
  id: string;
  title: string;
};

export type InstructorStudent = {
  enrollmentId: string;
  student: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  course: {
    id: string;
    title: string;
  };
  status: InstructorStudentStatus;
  progressPercentage: number;
  enrolledAt: string;
  completedAt: string | null;
};

export type InstructorStudentsResponse = {
  summary: InstructorStudentSummary;
  courses: InstructorCourseOption[];
  students: InstructorStudent[];
};

type ApiSuccessResponse = {
  success: true;
  data: InstructorStudentsResponse;
};

type ApiErrorResponse = {
  success?: false;
  message?: string;
};

type GetInstructorStudentsOptions = {
  courseId?: string;
  search?: string;
};

async function getApiError(response: Response): Promise<string> {
  try {
    const result = (await response.json()) as ApiErrorResponse;
    return result.message ?? 'Unable to load students.';
  } catch {
    return 'Unable to load students.';
  }
}

export async function getInstructorStudents(
  options: GetInstructorStudentsOptions = {}
): Promise<InstructorStudentsResponse> {
  const params = new URLSearchParams();

  if (options.courseId) {
    params.set('courseId', options.courseId);
  }

  if (options.search?.trim()) {
    params.set('search', options.search.trim());
  }

  const queryString = params.toString();

  const response = await fetch(
    `${API_URL}/api/instructor/students${queryString ? `?${queryString}` : ''}`,
    {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error(await getApiError(response));
  }

  const result = (await response.json()) as ApiSuccessResponse;

  return result.data;
}
