/**
 * Masks sensitive fields in an object (recursively)
 */
export function maskSensitiveData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitiveFields = [
    'password',
    'passwordHash',
    'token',
    'accessToken',
    'refreshToken',
    'oldPassword',
    'newPassword',
    'confirmPassword',
    'credentials',
  ];

  if (Array.isArray(data)) {
    return data.map((item) => maskSensitiveData(item));
  }

  const result = { ...data };

  for (const key in result) {
    if (sensitiveFields.includes(key)) {
      result[key] = '********';
    } else if (typeof result[key] === 'object') {
      result[key] = maskSensitiveData(result[key]);
    }
  }

  return result;
}
