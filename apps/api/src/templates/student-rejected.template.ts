export interface StudentRejectedPayload {
  firstName: string;
  universityName: string;
  rejectionReason: string;
  supportEmail: string;
}

export function studentRejectedTemplate({
  firstName,
  universityName,
  rejectionReason,
  supportEmail,
}: StudentRejectedPayload) {
  const subject =
    'Official Update: INSA Internship Application Status';

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0b5cff; padding: 24px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.5px;">INSA Internship Management</h1>
        <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px;">Information Network Security Administration</p>
      </div>
      
      <div style="padding: 32px; background-color: #ffffff;">
        <h2 style="color: #1a1a1a; margin-top: 0; font-size: 18px;">Application Status Notification</h2>
        <p>Dear ${firstName},</p>
        <p>Thank you for expressing your interest in the National Internship Program hosted by the <strong>Information Network Security Administration (INSA)</strong>.</p>
        
        <p>After a comprehensive review of your credentials submitted via <strong>${universityName}</strong>, we regret to inform you that your application was not selected for the current intake cycle.</p>
        
        <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 6px; padding: 20px; margin: 24px 0;">
          <p style="margin: 0; color: #92400e; font-size: 13px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Review Finding</p>
          <p style="margin: 8px 0 0 0; color: #78350f; font-style: italic;">"${rejectionReason}"</p>
        </div>

        <p style="font-size: 14px;">This decision is final for the current period. We encourage you to continue your academic pursuits and consider applying for future opportunities that align with your professional development.</p>

        <p style="font-size: 13px; color: #64748b; margin-top: 24px;">
          For specific inquiries regarding your university's submission, please contact:<br/>
          <strong style="color: #334155;">${universityName}</strong> (<a href="mailto:${supportEmail}" style="color: #0b5cff; text-decoration: none;">${supportEmail}</a>)
        </p>
      </div>

      <div style="background-color: #f1f5f9; padding: 24px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;">
        <p style="margin: 0 0 8px 0; font-weight: bold; color: #475569;">Information Network Security Administration (INSA)</p>
        <p style="margin: 0;">Addis Ababa, Ethiopia</p>
        <p style="margin: 12px 0 0 0;">This is a system-generated message. Please do not reply directly to this email.</p>
      </div>
    </div>
  `;

  const textLines = [
    `Application Status Update`,
    ``,
    `Hello ${firstName},`,
    ``,
    `Thank you for your interest in the INSA Internship Program. We have reviewed your application and unfortunately, we are unable to move forward at this time.`,
    ``,
    `University: ${universityName}`,
    ``,
    `Rejection Reason:`,
    `${rejectionReason}`,
    ``,
    `What's Next?`,
    ``,
    `We encourage you to:`,
    `• Review the feedback provided above`,
    `• Address any gaps or deficiencies in your application`,
    `• Consider reapplying in the next internship cycle with updated qualifications`,
    `• Contact your university coordinator for guidance on strengthening your application`,
    ``,
    `If you would like to discuss your application further, please reach out to:`,
    `${universityName}`,
    `Email: ${supportEmail}`,
    ``,
    `We appreciate your interest in the INSA Internship Program and encourage you to try again in the future.`,
    ``,
    `Best regards,`,
    `INSA Team`,
  ];

  const text = textLines.join('\n');

  return { subject, html, text };
}
