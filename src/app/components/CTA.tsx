import Link from 'next/link';

export default function CTA() {
  return (
    <section id="contact-us" className="py-20 px-6 md:px-12">
      <div className="max-w-5xl mx-auto bg-gradient-to-r from-[#0070f3] to-[#00c8ff] rounded-3xl overflow-hidden shadow-xl">
        <div className="p-8 md:p-12 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Experience the Power of Scruvia AI Today
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Get started with Scruvia AI and transform how you handle taxation and financial analytics. Our powerful AI assistant is ready to help you right now.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0070f3]/50 shadow-inner"
              />
              <a
                href="/auth"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 bg-gray-900 text-white hover:bg-gray-800 transition-colors rounded-full font-medium shadow-lg flex items-center justify-center"
              >
                Get Started
              </a>
            </div>
            
            <div className="mt-8 bg-gray-900/30 p-4 rounded-lg inline-block border border-white/20 shadow-inner">
              <p className="text-sm">
                <span className="font-semibold">Start today!</span> Enter your email to get immediate access to Scruvia AI.
              </p>
            </div>
            
            <p className="mt-4 text-sm opacity-80">
              By signing up, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
