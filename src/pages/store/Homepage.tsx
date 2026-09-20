import { AnnouncementBar } from '../../components/home/AnnouncementBar';
import { HeroSection } from '../../components/home/HeroSection';
import { CategoriesSection } from '../../components/home/CategoriesSection';
import { BestsellersSection } from '../../components/home/BestsellersSection';
import { ColoringTeaser } from '../../components/home/ColoringTeaser';
import { WhyChooseUs } from '../../components/home/WhyChooseUs';
import { NewsletterSection } from '../../components/home/NewsletterSection';

export const Homepage = () => {
  return (
    <div>
      <AnnouncementBar />
      <HeroSection />
      <CategoriesSection />
      <BestsellersSection />
      <ColoringTeaser />
      <WhyChooseUs />
      <NewsletterSection />
    </div>
  );
};
