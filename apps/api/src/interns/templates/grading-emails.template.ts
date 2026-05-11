import { InternEntity } from "src/entities/intern.entity";

export const internGradingApprovedTemplate = (
  intern: InternEntity,
) => {
  const internName = intern.user ? `${intern.user.firstName} ${intern.user.lastName}` : 'N/A';
  const subject = `Intern Grading Approved: ${internName}`;
  const text = `The final grading for intern ${internName} (ID: ${intern.internId}) has been approved.`;
  const html = `<p>The final grading for intern <strong>${internName}</strong> (ID: ${intern.internId}) has been approved.</p>`;

  return { subject, text, html };
};

export const internGradingRejectedTemplate = (
  intern: InternEntity,
  reason: string,
) => {
  const internName = intern.user ? `${intern.user.firstName} ${intern.user.lastName}` : 'N/A';
  const subject = `Intern Grading Rejected: ${internName}`;
  const text = `The final grading for intern ${internName} (ID: ${intern.internId}) has been rejected for the following reason: ${reason}`;
  const html = `<p>The final grading for intern <strong>${internName}</strong> (ID: ${intern.internId}) has been rejected for the following reason:</p><p>${reason}</p>`;

  return { subject, text, html };
};
