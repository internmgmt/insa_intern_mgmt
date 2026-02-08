import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns the current and next two academic years in YYYY/YYYY format.
 * Current academic year is determined by assuming it starts in September.
 */
export function getAcademicYears() {
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-indexed (0=Jan, 11=Dec)
  const currentCalendarYear = now.getFullYear();
  
  // If we're before September (month index 8), 
  // the current academic year started in the previous calendar year.
  const startYear = currentMonth < 8 ? currentCalendarYear - 1 : currentCalendarYear;
  
  return [
    `${startYear}/${startYear + 1}`,
    `${startYear + 1}/${startYear + 2}`,
    `${startYear + 2}/${startYear + 3}`,
  ];
}
