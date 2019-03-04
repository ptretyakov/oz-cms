import * as expressJwt from 'express-jwt';
import config from 'src/server/shared/config';

export const jwt = () => {
  const { secret } = config;

  return expressJwt({ secret }).unless({
    ext: ['js', 'ico', 'jpg', 'woff2'],
    path: [
      // Routing paths
      '/',
      '/login',
      '/registration',
      /\/admin/i,

      // Backend api routes
      '/api/registration',
      /\/api\/users/i,
      /\/api\/auth/i,
      /\/api\/models/i,
    ]
  });
};