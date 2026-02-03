export interface UserCreatedPayload {
  firstName: string;
  lastName: string;
  email: string;
  temporaryPassword: string;
  loginUrl: string;
  role: string;
}

export function userCreatedTemplate({
  firstName,
  lastName,
  email,
  temporaryPassword,
  loginUrl,
  role,
}: UserCreatedPayload) {
  const subject = 'Your INSA Account Has Been Created';

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #111; line-height: 1.5;">
      <h2 style="color: #0b5cff; margin-bottom: 0.5rem;">Welcome to INSA Internship Management System</h2>
      <p>Hello ${firstName} ${lastName},</p>
      <p>Your account has been created successfully in the INSA Internship Management System. Your account details are provided below.</p>
      <div style="background: #f0f8ff; border-left: 4px solid #0b5cff; padding: 16px; margin: 16px 0;">
        <p style="margin: 0;"><strong>Email:</strong> ${email}</p>
        <p style="margin: 8px 0;"><strong>Role:</strong> ${role}</p>
        <p style="margin: 8px 0;"><strong>Temporary Password:</strong> <code style="background: #fff; font-family: monospace; padding: 4px 8px; border: 1px solid #ddd; border-radius: 4px;">${temporaryPassword}</code></p>
      </div>
      <p style="color: #d9534f; font-weight: 600; margin: 16px 0;">
        🔒 Important: You must change your password on your first login. Never share this temporary password with anyone.
      </p>
      <h3 style="color: #0b5cff; margin-top: 24px;">Getting Started:</h3>
      <ol style="margin: 16px 0; padding-left: 20px;">
        <li>Click the button below to sign in</li>
        <li>Enter your email and temporary password</li>
        <li>You will be prompted to change your password</li>
        <li>Create a strong password (minimum 8 characters with uppercase, number, and special character)</li>
        <li>After password change, you can access all features</li>
      </ol>
      <p style="margin: 24px 0; text-align: center;">
        <a href="${loginUrl}" style="background: #0b5cff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: 600;">Sign In to INSA</a>
      </p>
      <p style="color: #999; font-size: 0.85em; margin: 16px 0;">
        <strong>Password Requirements:</strong><br/>
        • Minimum 8 characters<br/>
        • At least 1 uppercase letter (A-Z)<br/>
        • At least 1 lowercase letter (a-z)<br/>
        • At least 1 number (0-9)<br/>
        • At least 1 special character (@$!%*?&)
      </p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 24px 0;" />
      <p style="color: #999; font-size: 0.85em;">
        INSA Internship Management System<br/>
        If you have questions, contact support at support@insa.gov.et
      </p>
    </div>
  `;

  const textLines = [
    `Welcome to INSA Internship Management System`,
    ``,
    `Hello ${firstName} ${lastName},`,
    ``,
    `Your account has been created successfully in the INSA Internship Management System.`,
    ``,
    `Account Details:`,
    `Email: ${email}`,
    `Role: ${role}`,
    `Temporary Password: ${temporaryPassword}`,
    ``,
    `IMPORTANT: You must change your password on your first login. Never share this temporary password with anyone.`,
    ``,
    `Getting Started:`,
    `1. Sign in using the link below`,
    `2. Enter your email and temporary password`,
    `3. You will be prompted to change your password`,
    `4. Create a strong password (minimum 8 characters with uppercase, number, and special character)`,
    `5. After password change, you can access all features`,
    ``,
    `Sign in: ${loginUrl}`,
    ``,
    `Password Requirements:`,
    `• Minimum 8 characters`,
    `• At least 1 uppercase letter (A-Z)`,
    `• At least 1 lowercase letter (a-z)`,
    `• At least 1 number (0-9)`,
    `• At least 1 special character (@$!%*?&)`,
    ``,
    `Best regards,`,
    `INSA Team`,
  ];

  const text = textLines.join('\n');

  return { subject, html, text };
}
