export function formatCurrencyBoth(amount: number): string {
  return new Intl.NumberFormat('en-IQ', { style: 'currency', currency: 'IQD', maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}/${month}/${day}`;
}

const kurdishMonths = [
  "کانوونی دووەم", "شوبات", "ئازار", "نیسان", "ئایار", "حوزەیران",
  "تەممووز", "ئاب", "ئەیلول", "تشرینی یەکەم", "تشرینی دووەم", "کانوونی یەکەم"
];

const englishMonths = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const convertToEasternArabicNumerals = (num: number | string) => {
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().replace(/[0-9]/g, (w) => arabicNumbers[+w]);
};

export function formatCleanDate(dateInput: string | Date, locale: string = 'ku'): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "";

  if (locale === 'en') {
    const day = date.getDate();
    const month = englishMonths[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  } else {
    const day = convertToEasternArabicNumerals(date.getDate());
    const month = kurdishMonths[date.getMonth()];
    const year = convertToEasternArabicNumerals(date.getFullYear());
    return `${day}ی ${month} ${year}`;
  }
}
