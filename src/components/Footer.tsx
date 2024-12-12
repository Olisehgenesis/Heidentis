import React from 'react';
import BuiltOnHedera from "../assets/built-on-hedera.svg";
import { Shield, Twitter, Github, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold text-white">He-identis</span>
            </div>
            <p className="text-slate-400 text-sm">
              Secure, verifiable credentials powered by Hedera's distributed ledger technology.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                <Github className="h-5 w-5" />
              </a>
              
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {['Documentation', 'Tutorials', 'API Reference', 'Support'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {['About Us', 'Blog', 'Use Cases', 'Security'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Built on Hedera */}
          <div className="flex flex-col items-start">
            <h3 className="text-white font-semibold mb-4">Powered By</h3>
            <img 
              src={BuiltOnHedera}
              alt="Built on Hedera"
              className="h-12 w-auto hover:opacity-80 transition-opacity"
            />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-slate-400 text-sm">
            © 2024 He-identis. All rights reserved.
          </div>
          <div className="flex space-x-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
              <a 
                key={item}
                href="#" 
                className="text-slate-400 hover:text-blue-400 transition-colors text-sm"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}