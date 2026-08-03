const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type EnrolledCourse = {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  thumbnailUrl: string | null;
  category: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  price: number;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED';
};

export type StudentEnrollment = {
  _id: string;
  studentId: string;
  courseId: EnrolledCourse;
  status: EnrollmentStatus;
  progressPercentage: number;
  enrolledAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type ApiErrorResponse = {
  message?: string;
};

async function getApiError(response: Response): Promise<string> {
  try {
    const result = (await response.json()) as ApiErrorResponse;
    return result.message ?? 'Something went wrong';
  } catch {
    return 'Something went wrong';
  }
}

export async function getMyEnrollments(): Promise<StudentEnrollment[]> {
  const response = await fetch(`${API_URL}/api/enrollments/my-enrollments`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(await getApiError(response));
  }

  const result = (await response.json()) as {
    data: StudentEnrollment[];
  };

  return result.data;
}
