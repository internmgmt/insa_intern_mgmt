export function generateInternId(academicYear?: string): string {
  const year = extractYear(academicYear);
  const suffix = randomThreeDigit();
  return `INSA-${year}-${suffix}`;
}

function extractYear(academicYear?: string): string {
  if (!academicYear) return String(new Date().getFullYear());
  const match = academicYear.match(/\d{4}/);
  return match ? match[0] : String(new Date().getFullYear());
}

function randomThreeDigit(): string {
  const n = Math.floor(Math.random() * 999) + 1;
  return String(n).padStart(3, '0');
}
