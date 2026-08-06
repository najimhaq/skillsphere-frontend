const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export type StudentDashboardCourse = {
  enrollmentId: string;
  courseId: string;
  title: string;
  slug: string;
  shortDescription: string;
  thumbnailUrl: string | null;
  category: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  progressPercentage: number;
  enrolledAt: string;
  updatedAt: string;
};

export type StudentDashboardOverview = {
  student: {
    name: string;
  };
  stats: {
    coursesEnrolled: number;
    lessonsCompleted: number;
    certificatesEarned: number;
  };
  continueLearning: StudentDashboardCourse[];
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

type ApiErrorResponse = {
  success?: false;
  message?: string;
};

export type UploadStudentProfileImageResponse = {
  image: string;
};

async function getApiError(response: Response): Promise<string> {
  try {
    const result = (await response.json()) as ApiErrorResponse;

    return result.message ?? 'Unable to upload profile image.';
  } catch {
    return 'Unable to upload profile image.';
  }
}

export const getStudentDashboardOverview =
  async (): Promise<StudentDashboardOverview> => {
    const response = await fetch(`${API_URL}/api/dashboard/student/overview`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });

    const result =
      (await response.json()) as ApiResponse<StudentDashboardOverview>;

    if (!response.ok) {
      throw new Error(result.message ?? 'Unable to load dashboard data.');
    }

    return result.data;
  };

export const uploadStudentProfileImage = async (
  file: File
): Promise<UploadStudentProfileImageResponse> => {
  const formData = new FormData();

  formData.append('image', file);

  const response = await fetch(
    `${API_URL}/api/dashboard/student/profile/image`,
    {
      method: 'POST',
      credentials: 'include',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(await getApiError(response));
  }

  const result = (await response.json()) as {
    success: true;
    message?: string;
    data: UploadStudentProfileImageResponse;
  };

  return result.data;
};
