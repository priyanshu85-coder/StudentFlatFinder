import React from "react";
import { motion } from "framer-motion";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import { Search, Users, Shield, ArrowRight, GraduationCap } from "lucide-react";
import Background from '../images/Background.jpg';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const slides = [
  {
    title: "Find Your Perfect",
    highlight: "Student Flat",
    description:
      "Discover affordable student accommodations near your university. Connect with trusted brokers and find your ideal home away from home.",
  },
  {
    title: "Comfortable & Safe",
    highlight: "Living Experience",
    description:
      "We ensure every student finds a secure, comfortable, and welcoming environment to focus on their studies.",
  },
  {
    title: "Trusted by Thousands",
    highlight: "of Students",
    description:
      "Join a large network of happy students who have found the perfect place to stay using FlatFinder.",
  },
  {
    title: "Explore More Options",
    highlight: "...",
    description:
      "Swipe to discover more about how FlatFinder can make your student life easier and more convenient.",
  },
];

const Home = () => {
  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    speed: 1000,
    autoplaySpeed: 5010,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    pauseOnHover: false,
  };
  
  return (
    
    <div className="min-h-[300px]">
      {/* Hero Slider Section */}
         <div
      style={{
        backgroundImage: `url(${Background})`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        height: '50vh',
      }}
      className="flex items-center justify-center"
    >
      <h1 className="text-red-500 text-5xl font-bold shadow-lg">  </h1>
    </div>
       <section className="relative overflow-hidden"> 
        
        <Slider {...settings}>
          
          {slides.map((slide, index) => (
            
            <div
              key={index}
              className="relative bg-gradient-to-br from-[#0f172a] via-[#334155] to-[#475569] text-white py-24"
            >



              <div className="absolute inset-0 bg-black opacity-30"></div>
              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-center"
                >
                  <h1 className="text-4xl md:text-6xl font-bold mb-6">
                    {slide.title}
                    <span className="block text-yellow-300">
                      {slide.highlight}
                    </span>
                  </h1>
                  <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
                    {slide.description}
                  </p>
                  <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
                    <Link
                      to="/flats"
                      className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-transform duration-300 transform hover:scale-105 shadow-md"
                    >
                      <Search className="h-5 w-5 mr-2" />
                      Find Flats Now
                    </Link>
                    <a
                      href="/register"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-transform duration-300 transform hover:scale-105 shadow-md"
                    >
                      Sign Up
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </a>
                  </div>
                  
                </motion.div>
              </div>
            </div>
            
          ))}
        </Slider>
       </section> 

      {/* Features Section */}
      <section className="py-20 bg-white"> 
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose FlatFinder?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We make finding student accommodation simple, safe, and affordable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center p-8 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-lg mb-6">
                <GraduationCap className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                University-Focused
              </h3>
              <p className="text-gray-600">
                Search specifically by university name to find accommodations
                near your campus
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center p-8 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 text-white rounded-lg mb-6">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Verified Brokers
              </h3>
              <p className="text-gray-600">
                All brokers are verified and trusted to ensure safe and reliable
                transactions
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center p-8 rounded-xl bg-teal-50 hover:bg-teal-100 transition-colors"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-600 text-white rounded-lg mb-6">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Student Community
              </h3>
              <p className="text-gray-600">
                Join a community of students and find flatmates in your area
              </p>
            </motion.div>
          </div>
        </div>
       </section>

      {/* CTA Section */}
       <section className="py-20 bg-gradient-to-r from-purple-600 to-neutral-600 text-black"> 
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Ready to Find Your Perfect Flat?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl mb-8 opacity-90"
          >
            Join thousands of students who have found their ideal accommodation
          </motion.p>
          <Link
            to="/register"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-lg"
          >
            Start Your Search Today
            <ArrowRight className="h-5 w-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
