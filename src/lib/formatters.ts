export function formatAr(amount: number): string {
  if (isNaN(amount)) return '0 Ar';
  return amount.toLocaleString('fr-FR').replace(/\s/g, ' ') + ' Ar';
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  if (dateString.includes('/')) return dateString;
  const parts = dateString.split('T')[0].split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString;
}

export function getCurrentDateISO(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}
