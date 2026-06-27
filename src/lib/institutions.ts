import type { ApiInstitution } from '../api/types';
import {
  INSTITUTION_CATEGORIES,
  INSTITUTION_META,
  type InstitutionCategory,
  type LinkableInstitution,
} from '../constants/institutions';

export function enrichInstitution(api: ApiInstitution): LinkableInstitution {
  const meta = INSTITUTION_META[api.name] ?? {
    color: '#6b7280',
    initial: api.name.charAt(0),
  };

  return {
    id: api.id,
    name: api.name,
    category: INSTITUTION_CATEGORIES[api.name] ?? ('Banks' as InstitutionCategory),
    meta,
  };
}