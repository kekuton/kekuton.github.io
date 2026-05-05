export const ACCESS_CONFIG = {
  categories: {
    '18+': {
      storageKey: 'paid_access_adult',
      paymentUrl: 'https://yoomoney.ru/to/000000000000',
      codes: [
        'LOVE-7K2P',
        'HOT-93QD',
        'PAIR-X8M1',
      ],
    },
  },
};

export function normalizeAccessCode(code = '') {
  return String(code).trim().toUpperCase().replace(/\s+/g, '');
}

export function getAccessCategory(categoryId) {
  return ACCESS_CONFIG.categories[categoryId] || null;
}
