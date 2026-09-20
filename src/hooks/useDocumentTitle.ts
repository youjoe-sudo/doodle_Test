import { useEffect } from 'react';

const SITE_NAME = 'Doodle Room';
const SITE_SUFFIX = `| ${SITE_NAME}`;

export function useDocumentTitle(pageTitle?: string) {
  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} ${SITE_SUFFIX}` : `متجر المطبوعات والتصاميم المبتكرة ${SITE_SUFFIX}`;
  }, [pageTitle]);
}
