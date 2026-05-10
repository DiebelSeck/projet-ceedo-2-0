import Hero from '../components/home/Hero'
import WhySection from '../components/home/WhySection'
import InstitutionalIntro from '../components/home/InstitutionalIntro'
import MainAxes from '../components/home/MainAxes'
import OrientationSection from '../components/home/OrientationSection'
import FeaturedPublications from '../components/home/FeaturedPublications'
import MethodologyBlock from '../components/home/MethodologyBlock'
import EventsPreview from '../components/home/EventsPreview'
import CTABlock from '../components/ui/CTABlock'

export default function HomePage() {
  return (
    <>
      <Hero />
      
      {/* 2. Narrative Foundation: Why the project exists */}
      <WhySection />
      
      {/* 3. The Infrastructure Answer: What it builds */}
      <InstitutionalIntro />
      
      {/* 4. Ecosystem Axes: How it deploys */}
      <MainAxes />
      
      {/* 5. Orientation: How to enter the ecosystem */}
      <OrientationSection />
      
      {/* 6. Intellectual Production: Latest work */}
      <FeaturedPublications />
      
      {/* 7. Epistemic Backbone: Rigor & Vision */}
      <MethodologyBlock />
      
      {/* 8. Collective Life: Events & Meetups */}
      <EventsPreview />
      
      {/* 9. Final Engagement: Structured Participation */}
      <CTABlock
        eyebrow="Adhésion & Participation"
        title="Rejoindre une infrastructure de production du savoir."
        subtitle="Votre engagement contribue à la structuration et à la transmission d’un savoir souverain."
        primaryLabel="Accéder à la plateforme"
        primaryHref="/contact"
        secondaryLabel="Lire le cadre méthodologique"
        secondaryHref="/projet"
        theme="dark"
      />


    </>
  )
}
