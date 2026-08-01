const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

type EnrollmentResponse = {
  success: boolean;
  message: string;
  data?: {
    _id: string;
    studentId: string;
    courseId: string;
    status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    progressPercentage: number;
    enrolledAt: string;
  };
};

export async function enrollInCourse(
  courseId: string
): Promise<EnrollmentResponse> {
  const response = await fetch(
    `${API_URL}/api/enrollments/courses/${courseId}/enroll`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  const result = (await response.json().catch(() => null)) as
    | EnrollmentResponse
    | { success?: boolean; message?: string }
    | null;

  if (!response.ok) {
    const error = new Error(
      result?.message ?? 'Could not enroll in this course'
    ) as Error & { status?: number };

    error.status = response.status;

    throw error;
  }

  return result as EnrollmentResponse;
}
