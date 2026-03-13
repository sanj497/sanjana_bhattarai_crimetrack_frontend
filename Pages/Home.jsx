import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Shield, Phone, MapPin, FileText, Users, ChevronRight, Menu, X } from "lucide-react";

export default function CrimeReportingHome() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">CrimeTrack</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <a href="#home" className="text-gray-700 hover:text-indigo-600 transition">Home</a>
              <a href="#status" className="text-gray-700 hover:text-indigo-600 transition">Check Status</a>
              <a href="#resources" className="text-gray-700 hover:text-indigo-600 transition">Resources</a>

              {/* Login & Register Buttons */}
              <Link
                to="/Login"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Login
              </Link>
              <Link
                to="/Register"
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
              >
                Register
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              <a href="#home" className="block py-2 text-gray-700 hover:text-indigo-600">Home</a>
              <a href="#report" className="block py-2 text-gray-700 hover:text-indigo-600">Report Crime</a>
              <a href="#status" className="block py-2 text-gray-700 hover:text-indigo-600">Check Status</a>
              <a href="#resources" className="block py-2 text-gray-700 hover:text-indigo-600">Resources</a>

              {/* Mobile Login & Register Buttons */}
              <Link
                to="/login"
                className="block py-2 w-full text-center bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block py-2 w-full text-center bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Report Crime <span className="text-indigo-600">Safely & Anonymously</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your trusted platform for reporting criminal activities and staying connected with local law enforcement. Help make your community safer.
          </p>
        </div>

        {/* Emergency Banner */}
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-12 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
            <div>
              <p className="text-red-800 font-semibold">Emergency? Call 911 immediately</p>
              <p className="text-red-600 text-sm">This system is for non-emergency crime reporting only</p>
            </div>
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <button className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 text-left group">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-indigo-100 p-3 rounded-lg">
                <FileText className="h-8 w-8 text-indigo-600" />
              </div>
              <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-indigo-600 transition" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">File a Report</h3>
            <p className="text-gray-600">Report a crime incident with detailed information. Anonymous reporting available.</p>
          </button>

          <button className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 text-left group">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
              <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-green-600 transition" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Track Report Status</h3>
            <p className="text-gray-600">Check the status of your submitted reports and receive updates from authorities.</p>
          </button>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Confidential</h3>
            <p className="text-gray-600">Your reports are encrypted and handled with the highest level of security and confidentiality.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Anonymous Option</h3>
            <p className="text-gray-600">Report crimes anonymously if you prefer. Your identity remains protected throughout the process.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Phone className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">24/7 Support</h3>
            <p className="text-gray-600">Our support team is available around the clock to assist you with your reports and inquiries.</p>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Our Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-indigo-600 mb-2">12,450</p>
              <p className="text-gray-600">Reports Filed</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-indigo-600 mb-2">8,932</p>
              <p className="text-gray-600">Cases Resolved</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-indigo-600 mb-2">95%</p>
              <p className="text-gray-600">User Satisfaction</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-indigo-600 mb-2">24/7</p>
              <p className="text-gray-600">Availability</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-lg mb-6 opacity-90">Join thousands of citizens helping to create safer communities</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
              File a Report Now
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-6 w-6" />
                <span className="font-bold text-lg">SafeCity</span>
              </div>
              <p className="text-gray-400 text-sm">Making communities safer through technology and collaboration.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Safety Tips</a></li>
                <li><a href="#" className="hover:text-white transition">Crime Prevention</a></li>
                <li><a href="#" className="hover:text-white transition">Contact Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Disclaimer</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-400">
            <p>© 2024 SafeCity Crime Reporting System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
