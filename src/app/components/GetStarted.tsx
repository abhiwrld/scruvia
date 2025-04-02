import Link from 'next/link';

export default function GetStarted() {
  const models = [
    {
      name: "Scruvia AI",
      description: "Our standard AI model optimized for tax and financial queries, providing accurate information and guidance for everyday financial questions.",
      features: [
        "Tax regulation assistance",
        "Financial document analysis",
        "Compliance guidance",
        "Financial compliance support",
        "24/7 availability"
      ],
      isFree: true,
      cta: "Start Using Free",
      ctaLink: "/login"
    },
    {
      name: "Scruvia AI Pro",
      description: "Our advanced reasoning model with enhanced capabilities for complex financial analysis, strategic planning, and in-depth regulatory compliance.",
      features: [
        "Advanced reasoning capabilities",
        "Complex financial scenario analysis",
        "Strategic tax planning",
        "Advanced compliance assistance",
        "Regulatory compliance forecasting"
      ],
      isFree: false,
      cta: "Upgrade to Pro",
      ctaLink: "/pricing"
    }
  ];

  return (
    <section id="get-started" className="py-20 px-6 md:px-12 bg-gradient-to-br from-[#0070f3]/5 to-[#00c8ff]/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#0070f3] to-[#00c8ff] bg-clip-text text-transparent">Our AI Models</span>
          </h2>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto">
            Choose between our standard AI assistant or upgrade to our advanced reasoning model for complex financial challenges.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {models.map((model, index) => (
            <div 
              key={index} 
              className={`bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border ${model.isFree ? 'border-gray-700' : 'border-[#0070f3]'}`}
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-[#0070f3] to-[#00c8ff] bg-clip-text text-transparent">{model.name}</h3>
                {!model.isFree && (
                  <span className="px-3 py-1 bg-gradient-to-r from-[#0070f3] to-[#00c8ff] text-white text-xs font-bold rounded-full">
                    PREMIUM
                  </span>
                )}
              </div>
              
              <p className="text-gray-200 mb-6">{model.description}</p>
              
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-white mb-3">Key Features:</h4>
                <ul className="space-y-2">
                  {model.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <svg className="h-5 w-5 text-[#00c8ff] mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-200">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-auto">
                <Link 
                  href={model.ctaLink}

                  className={`inline-flex items-center justify-center px-8 py-3 border text-base font-medium rounded-md w-full ${model.isFree 
                    ? 'text-white bg-gradient-to-r from-[#0070f3] to-[#00c8ff] border-transparent hover:opacity-90' 
                    : 'text-[#00c8ff] border-[#0070f3] hover:bg-[#0070f3]/10'} transition-colors`}
                >
                  {model.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
