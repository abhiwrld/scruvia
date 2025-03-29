import Image from 'next/image';
import Link from 'next/link';

export default function Products() {
  const products = [
    {
      title: "Scruvia AI Chatbot",
      description: "Our intelligent AI assistant helps you navigate complex tax regulations, answer compliance questions, and provide guidance on financial matters instantly.",
      features: [
        "24/7 instant tax and compliance support",
        "Natural language understanding of financial queries",
        "Personalized recommendations based on your business",
        "Continuous learning from the latest regulations",
        "No setup required - start using immediately"
      ],
      status: "Available Now",
      cta: "Get Started",
      ctaLink: "#get-started",
      highlight: true
    },
    {
      title: "Premium Data Analytics Dashboard",
      description: "Coming soon: Transform your business data into actionable insights with our comprehensive analytics platform designed for financial decision-making.",
      features: [
        "Interactive data visualization tools",
        "Predictive analytics for financial forecasting",
        "Custom report generation",
        "Integration with major accounting software",
        "Exclusive early access for beta users"
      ],
      status: "Coming Soon - Limited Beta Access",
      cta: "Join Beta",
      ctaLink: "#beta-signup",
      highlight: false
    }
  ];

  return (
    <section id="products" className="py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#0070f3] to-[#00c8ff] bg-clip-text text-transparent">Our Products</span>
          </h2>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto">
            Discover how Scruvia's AI-powered solutions can transform your financial operations today.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {products.map((product, index) => (
            <div 
              key={index} 
              className={`relative overflow-hidden rounded-2xl ${
                product.highlight 
                  ? 'border-2 border-[#0070f3] shadow-lg bg-gray-800' 
                  : 'border border-gray-700 shadow-md bg-gray-800'
              }`}
            >
              {product.highlight && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-[#0070f3] to-[#00c8ff] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  AVAILABLE NOW
                </div>
              )}
              
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-[#0070f3] to-[#00c8ff] bg-clip-text text-transparent">{product.title}</h3>
                <p className="text-gray-200 mb-6">{product.description}</p>
                
                <ul className="space-y-2 mb-8">
                  {product.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <svg className="h-5 w-5 text-[#00c8ff] mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-200">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${
                    product.status.includes('Available') 
                      ? 'text-[#00c8ff]' 
                      : 'text-[#0070f3]'
                  }`}>
                    {product.status}
                  </span>
                  
                  <Link 
                    href={product.ctaLink} 
                    className={`inline-flex items-center justify-center px-6 py-2 border text-base font-medium rounded-md ${
                      product.highlight
                        ? 'text-white bg-gradient-to-r from-[#0070f3] to-[#00c8ff] border-transparent hover:opacity-90'
                        : 'text-[#00c8ff] border-[#0070f3] hover:bg-[#0070f3]/10'
                    } transition-colors`}
                  >
                    {product.cta}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
