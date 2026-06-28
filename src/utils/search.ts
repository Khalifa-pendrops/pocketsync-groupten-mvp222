export function normalizeSearchTerm(value: string): string {
  return value.trim().toLowerCase();
}

export function hasSearchTerm(term: string): boolean {
  return normalizeSearchTerm(term).length > 0;
}

export function matchesSearchTerm(haystack: string, term: string): boolean {
  const normalized = normalizeSearchTerm(term);
  if (!normalized) {
    return true;
  }

  return haystack.toLowerCase().includes(normalized);
}

export function matchesAnySearchTerm(term: string, ...fields: string[]): boolean {
  const normalized = normalizeSearchTerm(term);
  if (!normalized) {
    return true;
  }

  return fields.some((field) => field.toLowerCase().includes(normalized));
}