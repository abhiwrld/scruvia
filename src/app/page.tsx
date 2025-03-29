import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Products from './components/Products';
import GetStarted from './components/GetStarted';
import CTA from './components/CTA';
import Footer from './components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Features />
        <Products />
        <GetStarted />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
