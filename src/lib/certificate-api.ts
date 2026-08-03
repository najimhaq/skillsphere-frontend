const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export type Certificate = {
  _id: string;
  studentId: string;
  courseId: string;
  enrollmentId: string;
  studentName: string;
  courseTitle: string;
  certificateNumber: string;
  verificationCode: string;
  issuedAt: string;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

async function requestJson<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...options,
  });

  const result = (await response.json()) as ApiResponse<T>;

  if (!response.ok) {
    throw new Error(result.message ?? 'Something went wrong');
  }

  return result.data;
}

export const issueMyCertificate = async (
  courseId: string
): Promise<Certificate> => {
  return requestJson<Certificate>(
    `/api/certificates/my/courses/${courseId}/issue`,
    {
      method: 'POST',
    }
  );
};

export const getMyCourseCertificate = async (
  courseId: string
): Promise<Certificate> => {
  return requestJson<Certificate>(`/api/certificates/my/courses/${courseId}`, {
    method: 'GET',
    cache: 'no-store',
  });
};

export const verifyCertificate = async (
  verificationCode: string
): Promise<
  Pick<
    Certificate,
    | 'studentName'
    | 'courseTitle'
    | 'certificateNumber'
    | 'verificationCode'
    | 'issuedAt'
  >
> => {
  return requestJson(
    `/api/certificates/verify/${encodeURIComponent(verificationCode)}`,
    {
      method: 'GET',
      cache: 'no-store',
    }
  );
};
