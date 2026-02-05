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
    'secret',
    'apiKey',
    'authorization',
  ];

  if (Array.isArray(data)) {
    return data.map((item) => maskSensitiveData(item));
  }

  const result = { ...data };

  for (const key in result) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveFields.some(field => lowerKey.includes(field.toLowerCase()));
    
    if (isSensitive) {
      result[key] = '********';
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      result[key] = maskSensitiveData(result[key]);
    }
  }

  return result;
}