import { createAuthClient } from 'better-auth/react';
import { inferAdditionalFields } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000',

  basePath: '/api/auth',

  fetchOptions: {
    credentials: 'include',
  },

  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: 'string',
          input: false,
        },
      },
    }),
  ],
});
