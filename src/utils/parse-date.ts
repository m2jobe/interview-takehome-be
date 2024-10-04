import { parse, isValid } from 'date-fns';

export default function parseDate(dateString: string): Date | null {
  // Try parsing as "YYYY-MM-DD HH:mm:ss" format
  const parsedDate = parse(dateString, 'yyyy-MM-dd HH:mm:ss', new Date());
  if (isValid(parsedDate)) {
    return parsedDate;
  }

  return null;
}
