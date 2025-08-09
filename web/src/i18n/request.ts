import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  const l = (locale ?? 'en') as string; // ensure non-undefined locale for typing
  const messages = (await import(`../locales/${l}.json`)).default;
  return { locale: l, messages };
});

