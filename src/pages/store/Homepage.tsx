import { AnnouncementBar } from '../../components/home/AnnouncementBar';
import { HeroSection } from '../../components/home/HeroSection';
import { CategoriesSection } from '../../components/home/CategoriesSection';
import { BestsellersSection } from '../../components/home/BestsellersSection';
import { NewArrivalsSection } from '../../components/home/NewArrivalsSection';
import { ReviewsSection } from '../../components/home/ReviewsSection';
import { NewsletterSection } from '../../components/home/NewsletterSection';
import { useDocumentTitle } from '@hooks/useDocumentTitle';

export const Homepage = () => {
  useDocumentTitle();
  return (
    <div className="w-full">
      <AnnouncementBar />
      <HeroSection />
      <CategoriesSection />
      <BestsellersSection />
      <NewArrivalsSection />
      <ReviewsSection />
      <NewsletterSection />
    </div>
  );
};
