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
    'Application Status Update — INSA Internship Management System';

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #111; line-height: 1.5;">
      <h2 style="color: #0b5cff; margin-bottom: 0.5rem;">Application Status Update</h2>
      <p>Hello ${firstName},</p>
      <p>Thank you for your interest in the INSA Internship Program. We have reviewed your application and unfortunately, we are unable to move forward at this time.</p>
      <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 16px; margin: 16px 0;">
        <p style="margin: 0;"><strong>University:</strong> ${universityName}</p>
        <p style="margin: 8px 0;"><strong>Rejection Reason:</strong></p>
        <p style="margin: 4px 0; color: #333;">${rejectionReason}</p>
      </div>
      <h3 style="color: #0b5cff; margin-top: 24px;">What's Next?</h3>
      <p>We encourage you to:</p>
      <ul style="margin: 12px 0; padding-left: 20px;">
        <li>Review the feedback provided above</li>
        <li>Address any gaps or deficiencies in your application</li>
        <li>Consider reapplying in the next internship cycle with updated qualifications</li>
        <li>Contact your university coordinator for guidance on strengthening your application</li>
      </ul>
      <p style="margin: 16px 0;">
        If you would like to discuss your application further, please reach out to:<br/>
        <strong>${universityName}</strong><br/>
        Email: <a href="mailto:${supportEmail}" style="color: #0b5cff; text-decoration: none;">${supportEmail}</a>
      </p>
      <p style="color: #666; margin: 16px 0;">
        We appreciate your interest in the INSA Internship Program and encourage you to try again in the future.
      </p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 24px 0;" />
      <p style="color: #999; font-size: 0.85em;">
        INSA Internship Management System<br/>
        If you have questions, contact support at support@insa.gov.et
      </p>
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
