import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 导入翻译文件
import zhCommon from './locales/zh/common.json';
import zhManage from './locales/zh/manage.json';
import zhErrors from './locales/zh/errors.json';
import zhSettings from './locales/zh/settings.json';
import zhDebug from './locales/zh/debug.json';
import zhMods from './locales/zh/mods.json';
import zhAddons from './locales/zh/addons.json';
import zhMcenter from './locales/zh/mcenter.json';

import enCommon from './locales/en/common.json';
import enManage from './locales/en/manage.json';
import enErrors from './locales/en/errors.json';
import enSettings from './locales/en/settings.json';
import enDebug from './locales/en/debug.json';
import enMods from './locales/en/mods.json';
import enAddons from './locales/en/addons.json';
import enMcenter from './locales/en/mcenter.json';

import jaCommon from './locales/ja/common.json';
import jaManage from './locales/ja/manage.json';
import jaErrors from './locales/ja/errors.json';
import jaSettings from './locales/ja/settings.json';
import jaDebug from './locales/ja/debug.json';
import jaMods from './locales/ja/mods.json';
import jaAddons from './locales/ja/addons.json';
import jaMcenter from './locales/ja/mcenter.json';

const resources = {
  zh: {
    translation: { ...zhCommon, ...zhManage, ...zhErrors, ...zhSettings, ...zhDebug, ...zhMods, ...zhMcenter },
    addons: zhAddons,
  },
  en: {
    translation: { ...enCommon, ...enManage, ...enErrors, ...enSettings, ...enDebug, ...enMods, ...enMcenter },
    addons: enAddons,
  },
  ja: {
    translation: { ...jaCommon, ...jaManage, ...jaErrors, ...jaSettings, ...jaDebug, ...jaMods, ...jaMcenter },
    addons: jaAddons,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'zh',
    debug: process.env.NODE_ENV === 'development',
    
    // 语言检测配置
    detection: {
      order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
      lookupQuerystring: 'lang',
      lookupLocalStorage: 'mods-locker-language',
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false,
    },

    // 命名空间配置
    defaultNS: 'translation',
  });

export default i18n;
