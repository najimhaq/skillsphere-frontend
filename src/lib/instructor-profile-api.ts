//src/lib/instructor-profile-api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export type InstructorUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

export type InstructorProfile = {
  headline: string;
  bio: string;
  expertise: string[];
  website: string;
  linkedinUrl: string;
  githubUrl: string;
};

export type InstructorSettings = {
  notifyNewEnrollment: boolean;
  notifyCourseReview: boolean;
  notifyStudentCompletion: boolean;
};

export type InstructorProfileResponse = {
  user: InstructorUser;
  profile: InstructorProfile;
  settings: InstructorSettings;
};

export type UpdateInstructorProfilePayload = {
  headline: string;
  bio: string;
  expertise: string[];
  website: string;
  linkedinUrl: string;
  githubUrl: string;
};

export type UpdateInstructorSettingsPayload = InstructorSettings;

type ApiSuccessResponse = {
  success: true;
  message?: string;
  data: InstructorProfileResponse;
};

type ApiErrorResponse = {
  success?: false;
  message?: string;
};

async function getApiError(response: Response): Promise<string> {
  try {
    const result = (await response.json()) as ApiErrorResponse;
    return result.message ?? 'Something went wrong.';
  } catch {
    return 'Something went wrong.';
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    cache: 'no-store',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(await getApiError(response));
  }

  const result = (await response.json()) as ApiSuccessResponse;

  return result.data as T;
}

export async function getInstructorProfile(): Promise<InstructorProfileResponse> {
  return request<InstructorProfileResponse>('/api/instructor/profile', {
    method: 'GET',
  });
}

export async function updateInstructorProfile(
  payload: UpdateInstructorProfilePayload
): Promise<InstructorProfileResponse> {
  return request<InstructorProfileResponse>('/api/instructor/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function updateInstructorSettings(
  payload: UpdateInstructorSettingsPayload
): Promise<InstructorProfileResponse> {
  return request<InstructorProfileResponse>('/api/instructor/settings', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}


//image upload
type UploadProfileImageResponse = {
  image: string;
};

export async function uploadInstructorProfileImage(
  file: File
): Promise<UploadProfileImageResponse> {
  const formData = new FormData();

  formData.append('image', file);

  const response = await fetch(`${API_URL}/api/instructor/profile/image`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await getApiError(response));
  }

  const result = (await response.json()) as {
    success: true;
    message: string;
    data: UploadProfileImageResponse;
  };

  return result.data;
}


