import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  const l = (locale ?? 'en') as 'en' | 'vi';
  const messages = (await import(`../src/locales/${l}.json`)).default;
  return { locale: l, messages };
});

