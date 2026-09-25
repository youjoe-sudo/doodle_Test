import { useState, useEffect } from 'react';

type Language = 'ar' | 'en';

const translations: Record<Language, Record<string, string>> = {
  ar: {
    navbar_home: 'الرئيسية',
    navbar_shop: 'المتجر',
    navbar_categories: 'التصنيفات',
    navbar_coloring: 'التلوين',
    navbar_about: 'من نحن',
    navbar_contact: 'اتصل بنا',
    navbar_cart: 'سلة التسوق',
    navbar_account: 'الحساب',
    navbar_search: 'بحث',
    navbar_profile: 'حسابي',
    navbar_wishlist: 'المفضلة',
    navbar_signout: 'تسجيل الخروج',
    home_hero_title: 'Small Books Big Dreams',
    home_hero_subtitle: 'اكتشف عالم من الإبداع والتلوين',
    home_hero_button: 'ابدأ الآن',
    coloring_books_title: 'كتب التلوين',
    coloring_books_view_all: 'عرض الكل',
    shop_by_category: 'تسوق حسب التصنيف',
    coloring_books_pink: 'كتب التلوين',
    coloring_supplies_mint: 'مستلزمات التلوين',
    stickers_lavender: 'ستيكرز',
    pencil_cases_peach: 'أقلام رصاص',
    see_more: 'رؤية المزيد',
    reviews_title: 'التقييمات',
    newsletter_title: 'تواصل معنا',
    newsletter_subtitle: 'اشترك في نشرتنا الإخبارية',
    newsletter_email: 'البريد الإلكتروني',
    newsletter_phone: 'رقم الهاتف',
    newsletter_location: 'الموقع',
    newsletter_badge: 'Color your world ♡',
    footer_copyright: 'جميع الحقوق محفوظة',
    product_title: 'اسم المنتج',
    product_price: 'السعر',
    product_wishlist: 'المفضلة',
    no_products: 'لا توجد منتجات',
    cart_empty: 'سلة التسوق فارغة',
    checkout: 'تنفيذ الطلب',
    back_to_shopping: 'العودة للتسوق',
    error_something: 'حدث خطأ ما',
    success_action: 'تم التنفيذ بنجاح',
  },
  en: {
    navbar_home: 'Home',
    navbar_shop: 'Shop',
    navbar_categories: 'Categories',
    navbar_coloring: 'Coloring',
    navbar_about: 'About',
    navbar_contact: 'Contact',
    navbar_cart: 'Cart',
    navbar_account: 'Account',
    navbar_search: 'Search',
    navbar_profile: 'Profile',
    navbar_wishlist: 'Wishlist',
    navbar_signout: 'Sign Out',
    home_hero_title: 'Small Books Big Dreams',
    home_hero_subtitle: 'Discover a world of creativity and coloring',
    home_hero_button: 'Get Started',
    coloring_books_title: 'Coloring Books',
    coloring_books_view_all: 'View All',
    shop_by_category: 'Shop by Category',
    coloring_books_pink: 'Coloring Books',
    coloring_supplies_mint: 'Coloring Supplies',
    stickers_lavender: 'Stickers',
    pencil_cases_peach: 'Pencil Cases',
    see_more: 'See More',
    reviews_title: 'Reviews',
    newsletter_title: 'Stay in Touch',
    newsletter_subtitle: 'Subscribe to our newsletter',
    newsletter_email: 'Email',
    newsletter_phone: 'Phone',
    newsletter_location: 'Location',
    newsletter_badge: 'Color your world ♡',
    footer_copyright: 'All rights reserved',
    product_title: 'Product',
    product_price: 'Price',
    product_wishlist: 'Wishlist',
    no_products: 'No products found',
    cart_empty: 'Your cart is empty',
    checkout: 'Checkout',
    back_to_shopping: 'Back to Shopping',
    error_something: 'Something went wrong',
    success_action: 'Action completed successfully',
  },
};

const readStoredLanguage = (): Language => {
  try {
    const stored = localStorage.getItem('doodle_language') as Language | null;
    return stored === 'en' || stored === 'ar' ? stored : 'ar';
  } catch {
    return 'ar';
  }
};

export const applyLanguage = (language: Language) => {
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', language);
  document.documentElement.style.setProperty(
    'font-family',
    language === 'ar'
      ? '"Cairo", "Inter", sans-serif'
      : '"Inter", "Cairo", sans-serif'
  );
  try {
    localStorage.setItem('doodle_language', language);
  } catch {
    // Storage unavailable — language still applies for this session
  }
  window.dispatchEvent(new CustomEvent('languagechange', { detail: language }));
};

export const LanguageSwitcher = () => {
  const [language, setLanguage] = useState<Language>(readStoredLanguage);

  useEffect(() => {
    applyLanguage(language);
  }, [language]);

  useEffect(() => {
    const handler = (e: Event) => {
      const next = (e as CustomEvent).detail as Language;
      if (next && next !== language) setLanguage(next);
    };
    window.addEventListener('languagechange', handler);
    return () => window.removeEventListener('languagechange', handler);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="px-3 py-1.5 rounded-full text-xs font-bold transition-colors border-2"
      style={{
        backgroundColor: language === 'ar' ? '#C25350' : 'transparent',
        color: language === 'ar' ? '#FFFFFF' : '#2C1E1B',
        borderColor: language === 'ar' ? '#C25350' : '#E2E8F0',
      }}
      aria-label={language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
    >
      {language === 'ar' ? 'EN' : 'AR'}
    </button>
  );
};

export const useLanguage = (): Language => {
  const [language, setLanguage] = useState<Language>(readStoredLanguage);

  useEffect(() => {
    const handler = (e: Event) => {
      setLanguage((e as CustomEvent).detail as Language);
    };
    window.addEventListener('languagechange', handler);
    const current = document.documentElement.getAttribute('lang') as Language | null;
    if (current === 'en' || current === 'ar') setLanguage(current);
    return () => window.removeEventListener('languagechange', handler);
  }, []);

  return language;
};
