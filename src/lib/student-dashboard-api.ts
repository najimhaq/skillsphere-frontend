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
