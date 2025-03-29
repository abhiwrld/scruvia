export default function Testimonials() {
  const testimonials = [
    {
      quote: "Scruvia's AI chatbot has revolutionized how we handle tax inquiries. It's like having a tax expert available 24/7.",
      author: "Sarah Johnson",
      position: "CFO, TechGrowth Inc.",
      rating: 5
    },
    {
      quote: "The data analytics dashboard gives us insights we never had before. We've been able to identify cost-saving opportunities that were previously invisible to us.",
      author: "Michael Chen",
      position: "Finance Director, Global Retail Solutions",
      rating: 5
    },
    {
      quote: "Internal audits used to take weeks. With Scruvia, we've cut that time in half while improving the thoroughness of our process.",
      author: "Priya Patel",
      position: "Audit Manager, Financial Services Group",
      rating: 4
    }
  ];

  return (
    <section id="testimonials" className="py-20 px-6 md:px-12 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our Clients Say
          </h2>
          <p className="text-lg text-gray-dark max-w-2xl mx-auto">
            Businesses across industries trust Scruvia to transform their financial operations.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-gray-light/10 p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i} 
                    className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray'}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              
              <blockquote className="text-lg italic mb-6">"{testimonial.quote}"</blockquote>
              
              <div>
                <p className="font-bold">{testimonial.author}</p>
                <p className="text-sm text-gray-dark">{testimonial.position}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
