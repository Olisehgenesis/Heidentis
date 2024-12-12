import React, { useState } from 'react';
import { Shield, Key, RefreshCw, ChevronRight, Clock, Lock, Users, Layers, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const Home = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Hero Section */}
      <div className="h-screen flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
        {/* Background Effect */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 animate-pulse" />
          <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl animate-blob" />
          <div className="absolute left-0 bottom-0 w-96 h-96 bg-indigo-500/20 rounded-full filter blur-3xl animate-blob animation-delay-2000" />
        </div>

        <div className="relative animate-fade-in-up z-10">
          <div className="flex items-center justify-center mb-6 space-x-2">
            <Shield className="h-12 w-12 text-blue-400" />
            <h1 className="text-7xl font-bold text-white">
              He-identis
            </h1>
          </div>
          <p className="text-2xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Transform Your Digital Identity Management with 
            <span className="text-blue-400 font-semibold"> Secure</span>, 
            <span className="text-indigo-400 font-semibold"> Verifiable</span>, and 
            <span className="text-blue-300 font-semibold"> Reusable</span> Credentials
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button 
              className={`
                bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500
                text-white px-8 py-6 text-xl rounded-xl
                transform transition-all duration-300 shadow-lg hover:shadow-2xl
                ${isHovered ? 'scale-105' : ''}
              `}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              // onClick got to app/wallet route
              onClick={() => window.location.href = '/app/institutions'}
            >
              Launch App <ArrowRight className="ml-2" />
            </Button>
            <Button 
              variant="outline"
              className="border-2 border-white/20 text-white hover:bg-white/10 px-8 py-6 text-xl rounded-xl"
            >
              Learn More
            </Button>
          </div>
        </div>
        
        <div className="absolute bottom-10 flex flex-col items-center animate-bounce">
          <p className="text-slate-400 mb-2">Explore More</p>
          <ChevronRight className="transform rotate-90 text-white/50" />
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-white mb-4">Why Choose He-identis?</h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Experience the next generation of digital identity management, powered by Hedera's secure and scalable network.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {[
            {
              icon: Shield,
              title: "Enterprise-Grade Security",
              desc: "Military-grade encryption with zero-knowledge proofs ensures your credentials remain private and secure.",
              features: [
                "End-to-end encryption",
                "Zero-knowledge verification",
                "Tamper-proof records",
                "Distributed security"
              ]
            },
            {
              icon: RefreshCw,
              title: "Seamless Integration",
              desc: "Connect and deploy with ease using our comprehensive suite of APIs and development tools.",
              features: [
                "RESTful API access",
                "Multiple SDK options",
                "Custom workflows",
                "Quick implementation"
              ]
            },
            {
              icon: Users,
              title: "Universal Access",
              desc: "Create, verify, and manage credentials across any platform or service with ease.",
              features: [
                "Cross-platform support",
                "Standardized formats",
                "Easy verification",
                "Global accessibility"
              ]
            }
          ].map((card, idx) => (
            <Card 
              key={idx}
              className="group bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 
                transition-all duration-500 hover:transform hover:scale-105 hover:shadow-xl"
            >
              <CardHeader>
                <div className="h-12 w-12 text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-500">
                  <card.icon className="w-full h-full" />
                </div>
                <CardTitle className="text-white group-hover:text-blue-300 transition-colors">
                  {card.title}
                </CardTitle>
                <CardDescription className="text-slate-300">
                  {card.desc}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {card.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-slate-300">
                      <CheckCircle className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Statistics Section */}
        <div className="grid md:grid-cols-4 gap-8 mb-24">
          {[
            { value: "99.9%", label: "Platform Uptime" },
            { value: "Quick", label: "Verification Time" },
            { value: "Reusable", label: "Creditials" },
            { value: "Secure", label: "Running on Hedera" }
          ].map((stat, idx) => (
            <div key={idx} className="group bg-slate-800/30 rounded-xl p-6 hover:transform hover:scale-105 transition-all duration-300">
              <div className="text-4xl font-bold text-blue-400 mb-2 group-hover:animate-pulse">
                {stat.value}
              </div>
              <div className="text-slate-300">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="relative text-center bg-gradient-to-r from-blue-900/50 to-indigo-900/50 rounded-3xl p-16 transform hover:scale-105 transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/50" />
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Digital Identity?
            </h2>
            <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto">
              Join the future of secure, verifiable, and reusable digital credentials powered by Hedera's cutting-edge technology.
            </p>
            <div className="flex gap-6 justify-center">
              <Button 
                className="bg-white text-slate-900 hover:bg-slate-100 px-8 py-6 text-lg rounded-xl">
                View Documentation
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-xl">
                Start Building
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;