import { ApiReference } from '@scalar/nextjs-api-reference';

const config = {
  spec: {
    url: '/openapi.yaml',
  },
  theme: 'default',
};

export const GET = ApiReference(config);

