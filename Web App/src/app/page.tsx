// app/page.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ChevronRight,
  AlertTriangle,
  Shield,
  Zap,
  LineChart,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const headingVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const spanVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, delay: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-sm fixed w-full z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-xl font-bold text-white flex items-center">
                  <Shield className="h-6 w-6 mr-2 text-blue-400" />
                  Rail<span className="text-blue-400">Kavach</span>
                </span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  href="#features"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-slate-800"
                >
                  Features
                </Link>
                <Link
                  href="#how-it-works"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-slate-800"
                >
                  How It Works
                </Link>
                <Link
                  href="#business"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-slate-800"
                >
                  Business Model
                </Link>
                <Link
                  href="#contact"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-slate-800"
                >
                  Contact
                </Link>
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer ml-4"
                >
                  Get Started
                </Button>
              </div>
            </div>
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-slate-900 border-t border-slate-800">
              <Link
                href="#features"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-slate-800"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-slate-800"
              >
                How It Works
              </Link>
              <Link
                href="#business"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-slate-800"
              >
                Business Model
              </Link>
              <Link
                href="#contact"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-slate-800"
              >
                Contact
              </Link>
              <div className="pt-2">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6 }}
              variants={fadeIn}
              className="text-center md:text-left"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <motion.span
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={headingVariants}
                >
                  Protecting Wildlife on{" "}
                </motion.span>
                <motion.span
                  className="text-blue-400"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={spanVariants}
                >
                  Railway Tracks
                </motion.span>
              </h1>
              <p className="mt-4 text-xl text-gray-300 max-w-lg mx-auto md:mx-0">
                AI-powered detection system that prevents animal accidents on
                railway tracks with real-time monitoring and alerts.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center md:justify-start gap-4">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg">
                  Learn More <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-600 bg-transparent text-gray-300 hover:bg-slate-800 hover:text-white px-6 py-3 text-lg"
                >
                  Contact Us
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative h-64 md:h-96 w-full rounded-lg overflow-hidden shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-slate-900/80 z-10"></div>
              <div className="absolute inset-0 bg-[url('/api/placeholder/800/600')] bg-cover bg-center"></div>
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="text-center px-4">
                  <AlertTriangle className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold">
                    Preventing Animal Accidents
                  </h3>
                  <p className="mt-2 text-gray-300">
                    Using AI to save wildlife and improve railway safety
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-slate-700 p-6 rounded-lg"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-900/50 mr-4">
                  <AlertTriangle className="h-8 w-8 text-yellow-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">
                    Annual Wildlife Accidents
                  </p>
                  <p className="text-white text-2xl font-bold">200+</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-slate-700 p-6 rounded-lg"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-900/50 mr-4">
                  <Clock className="h-8 w-8 text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Response Time</p>
                  <p className="text-white text-2xl font-bold">&lt; 2 mins</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-slate-700 p-6 rounded-lg"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-900/50 mr-4">
                  <Zap className="h-8 w-8 text-green-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Detection Accuracy</p>
                  <p className="text-white text-2xl font-bold">95%</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-slate-700 p-6 rounded-lg"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-900/50 mr-4">
                  <LineChart className="h-8 w-8 text-purple-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Potential Savings</p>
                  <p className="text-white text-2xl font-bold">₹100Cr+</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Key Features
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Rail Kavach offers a comprehensive solution to prevent animal
              accidents on railway tracks with AI-powered detection and alerts.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="bg-slate-800 border-slate-700 h-full">
                <CardHeader>
                  <div className="p-3 w-12 h-12 rounded-full bg-blue-900/50 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-blue-400" />
                  </div>
                  <CardTitle className="text-white">Animal Detection</CardTitle>
                  <CardDescription className="text-gray-400">
                    Advanced AI-powered detection system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                      <span>Cameras capture images at regular intervals</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                      <span>ML model detects animals on tracks</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                      <span>Triggers alerts after 2 minutes of detection</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="bg-slate-800 border-slate-700 h-full">
                <CardHeader>
                  <div className="p-3 w-12 h-12 rounded-full bg-blue-900/50 flex items-center justify-center mb-4">
                    <AlertTriangle className="h-6 w-6 text-yellow-400" />
                  </div>
                  <CardTitle className="text-white">
                    Alert & Buzzer System
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Real-time notifications and animal deterrent
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                      <span>
                        Alerts sent to nearest station and train driver
                      </span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                      <span>
                        On-track buzzer activates to scare away animals
                      </span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                      <span>Voice alerts minimize driver distraction</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Card className="bg-slate-800 border-slate-700 h-full">
                <CardHeader>
                  <div className="p-3 w-12 h-12 rounded-full bg-blue-900/50 flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-green-400" />
                  </div>
                  <CardTitle className="text-white">
                    Train Speed Control
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Automated speed reduction for safer operations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                      <span>Slight reduction at 5km distance</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                      <span>Gradual slowdown at 2km if animal remains</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                      <span>Progressive braking to prevent collisions</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-24 bg-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              How Rail Kavach Works
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              A comprehensive system that monitors, alerts, and takes action to
              prevent animal accidents.
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-900"></div>

            {/* Timeline items */}
            <div className="space-y-12 md:space-y-0">
              {/* Step 1 */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="md:grid md:grid-cols-2 md:gap-8 items-center"
              >
                <div className="md:text-right pb-8 md:pb-0">
                  <div className="inline-block p-6 rounded-lg bg-slate-700 mb-4 shadow-lg">
                    <h3 className="text-2xl font-bold text-white mb-3">
                      1. Detection
                    </h3>
                    <p className="text-gray-300">
                      Strategically placed cameras along railway tracks capture
                      and analyze images to detect animals.
                    </p>
                  </div>
                </div>
                <div className="relative md:ml-8">
                  {/* Timeline dot */}
                  <div className="hidden md:block absolute -left-12 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-blue-600 border-4 border-slate-800 z-10"></div>

                  <div className="rounded-lg overflow-hidden h-48 relative shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 opacity-75 z-10"></div>
                    <img
                      src="/images/detection.jpg"
                      alt="Detection"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="md:grid md:grid-cols-2 md:gap-8 items-center"
              >
                <div className="md:order-2 md:text-left pb-8 md:pb-0">
                  <div className="inline-block p-6 rounded-lg bg-slate-700 mb-4 shadow-lg">
                    <h3 className="text-2xl font-bold text-white mb-3">
                      2. Alert System
                    </h3>
                    <p className="text-gray-300">
                      When an animal is detected, alerts are sent to the nearest
                      station and approaching trains.
                    </p>
                  </div>
                </div>
                <div className="relative md:order-1 md:mr-8">
                  {/* Timeline dot */}
                  <div className="hidden md:block absolute -right-12 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-blue-600 border-4 border-slate-800 z-10"></div>

                  <div className="rounded-lg overflow-hidden h-48 relative shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 opacity-75 z-10"></div>
                    <img
                      src="/images/alert-system.jpg"
                      alt="Alert System"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="md:grid md:grid-cols-2 md:gap-8 items-center"
              >
                <div className="md:text-right pb-8 md:pb-0">
                  <div className="inline-block p-6 rounded-lg bg-slate-700 mb-4 shadow-lg">
                    <h3 className="text-2xl font-bold text-white mb-3">
                      3. Speed Reduction
                    </h3>
                    <p className="text-gray-300">
                      Trains automatically reduce speed at 5km and further slow
                      down at 2km if the animal remains on track.
                    </p>
                  </div>
                </div>
                <div className="relative md:ml-8">
                  {/* Timeline dot */}
                  <div className="hidden md:block absolute -left-12 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-blue-600 border-4 border-slate-800 z-10"></div>

                  <div className="rounded-lg overflow-hidden h-48 relative shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 opacity-75 z-10"></div>
                    <img
                      src="/images/speed-reduction.jpg"
                      alt="Speed Reduction"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Model Section */}
      <section id="business" className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Business Model
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Rail Kavach offers multiple revenue streams for sustainable growth
              and impact.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <Card className="bg-slate-800 border-slate-700 h-full">
                <CardHeader>
                  <CardTitle className="text-white">Revenue Streams</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <div className="bg-blue-900/40 p-2 rounded-full mr-3 flex-shrink-0">
                        <ChevronRight className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">
                          Government & Railway Contracts
                        </h4>
                        <p className="text-gray-400 mt-1">
                          Collaborate with railway authorities for large-scale
                          deployment
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-blue-900/40 p-2 rounded-full mr-3 flex-shrink-0">
                        <ChevronRight className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">
                          Subscription-Based Monitoring
                        </h4>
                        <p className="text-gray-400 mt-1">
                          Provide railway operators with AI-powered monitoring
                          services
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-blue-900/40 p-2 rounded-full mr-3 flex-shrink-0">
                        <ChevronRight className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">
                          Hardware Sales & Installation
                        </h4>
                        <p className="text-gray-400 mt-1">
                          Sell and install cameras, sensors, and buzzer systems
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-blue-900/40 p-2 rounded-full mr-3 flex-shrink-0">
                        <ChevronRight className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">
                          Maintenance & Support
                        </h4>
                        <p className="text-gray-400 mt-1">
                          Annual contracts for hardware servicing and software
                          updates
                        </p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <Card className="bg-slate-800 border-slate-700 h-full">
                <CardHeader>
                  <CardTitle className="text-white">
                    Market Opportunity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <div className="bg-blue-900/40 p-2 rounded-full mr-3 flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">
                          Wildlife Protection
                        </h4>
                        <p className="text-gray-400 mt-1">
                          Thousands of wild animals are killed annually due to
                          train collisions
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-blue-900/40 p-2 rounded-full mr-3 flex-shrink-0">
                        <LineChart className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">
                          Financial Impact
                        </h4>
                        <p className="text-gray-400 mt-1">
                          200+ train-animal collisions per year cause
                          significant financial losses
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-blue-900/40 p-2 rounded-full mr-3 flex-shrink-0">
                        <Zap className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">
                          Global Expansion
                        </h4>
                        <p className="text-gray-400 mt-1">
                          Railways worldwide face similar challenges in
                          wildlife-rich zones
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-blue-900/40 p-2 rounded-full mr-3 flex-shrink-0">
                        <Shield className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">
                          Government Support
                        </h4>
                        <p className="text-gray-400 mt-1">
                          Governments worldwide are pushing for AI and smart
                          railway solutions
                        </p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* USP Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-xl">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Our Unique Approach
                </h3>
                <p className="text-gray-300 mb-6">
                  Rail Kavach differentiates itself by using fixed remote
                  cameras along the railway tracks instead of mounting detection
                  systems on moving trains.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-blue-900/40 p-2 rounded-full mr-3 flex-shrink-0">
                      <ChevronRight className="h-5 w-5 text-blue-400" />
                    </div>
                    <p className="text-gray-300">
                      <span className="font-medium text-white">
                        Early Detection:
                      </span>{" "}
                      Static cameras provide real-time monitoring over a larger
                      area
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-900/40 p-2 rounded-full mr-3 flex-shrink-0">
                      <ChevronRight className="h-5 w-5 text-blue-400" />
                    </div>
                    <p className="text-gray-300">
                      <span className="font-medium text-white">
                        Proactive Response:
                      </span>{" "}
                      Animals are detected much earlier, allowing for gradual
                      speed reduction
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-900/40 p-2 rounded-full mr-3 flex-shrink-0">
                      <ChevronRight className="h-5 w-5 text-blue-400" />
                    </div>
                    <p className="text-gray-300">
                      <span className="font-medium text-white">
                        Enhanced Safety:
                      </span>{" "}
                      Better warning systems and increased safety margins
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2 relative"
            >
              <div className="relative h-64 md:h-96 rounded-lg overflow-hidden shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-slate-900/80 z-10"></div>
                <div className="absolute inset-0 bg-[url('/api/placeholder/800/600')] bg-cover bg-center"></div>
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="text-center px-4">
                    <Shield className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold">
                      Fixed Camera Advantage
                    </h3>
                    <p className="mt-2 text-gray-300">
                      More effective and proactive solution for prevention
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Technology Stack
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Powered by cutting-edge technologies for reliable performance.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-slate-800 p-6 rounded-lg border border-slate-700"
            >
              <h3 className="text-xl font-bold text-white mb-4">
                Camera Processing
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-900/40 text-blue-400 px-3 py-1 rounded-full text-sm">
                  OpenCV
                </span>
                <span className="bg-blue-900/40 text-blue-400 px-3 py-1 rounded-full text-sm">
                  TensorFlow
                </span>
                <span className="bg-blue-900/40 text-blue-400 px-3 py-1 rounded-full text-sm">
                  PyTorch
                </span>
                <span className="bg-blue-900/40 text-blue-400 px-3 py-1 rounded-full text-sm">
                  YOLOv8
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-slate-800 p-6 rounded-lg border border-slate-700"
            >
              <h3 className="text-xl font-bold text-white mb-4">
                Backend Development
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-900/40 text-blue-400 px-3 py-1 rounded-full text-sm">
                  Node.js
                </span>
                <span className="bg-blue-900/40 text-blue-400 px-3 py-1 rounded-full text-sm">
                  MONGODB
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-slate-800 p-6 rounded-lg border border-slate-700"
            >
              <h3 className="text-xl font-bold text-white mb-4">
                Communication
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-900/40 text-blue-400 px-3 py-1 rounded-full text-sm">
                  WebSockets
                </span>
                <span className="bg-blue-900/40 text-blue-400 px-3 py-1 rounded-full text-sm">
                  MQTT
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-slate-800 p-6 rounded-lg border border-slate-700"
            >
              <h3 className="text-xl font-bold text-white mb-4">
                Frontend & Dashboards
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-900/40 text-blue-400 px-3 py-1 rounded-full text-sm">
                  Next.js
                </span>
                <span className="bg-blue-900/40 text-blue-400 px-3 py-1 rounded-full text-sm">
                  Tailwind CSS
                </span>
                <span className="bg-blue-900/40 text-blue-400 px-3 py-1 rounded-full text-sm">
                  Framer Motion
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              viewport={{ once: true }}
              className="bg-slate-800 p-6 rounded-lg border border-slate-700"
            >
              <h3 className="text-xl font-bold text-white mb-4">
                Storage & Cloud
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-900/40 text-blue-400 px-3 py-1 rounded-full text-sm">
                  Cloudinary
                </span>
                <span className="bg-blue-900/40 text-blue-400 px-3 py-1 rounded-full text-sm">
                  AWS S3
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              viewport={{ once: true }}
              className="bg-slate-800 p-6 rounded-lg border border-slate-700"
            >
              <h3 className="text-xl font-bold text-white mb-4">
                Edge Computing
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-900/40 text-blue-400 px-3 py-1 rounded-full text-sm">
                  TensorFlow Lite
                </span>
                <span className="bg-blue-900/40 text-blue-400 px-3 py-1 rounded-full text-sm">
                  Raspberry Pi
                </span>
                <span className="bg-blue-900/40 text-blue-400 px-3 py-1 rounded-full text-sm">
                  Solar Power
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-16 md:py-24 bg-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-xl p-8 md:p-12 shadow-xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to safeguard wildlife?
                </h2>
                <p className="text-gray-300 mb-8">
                  Join us in revolutionizing railway safety with AI-powered
                  animal detection. Request a demo or consultation today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="bg-white hover:bg-gray-200 text-slate-900 px-6 py-3 text-lg">
                    Request Demo
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white text-white bg-transparent px-6 py-3 text-lg"
                  >
                    Contact Sales
                  </Button>
                </div>
              </div>
              <div className="relative h-64 rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 to-blue-900/60 z-10"></div>
                <div className="absolute inset-0 bg-[url('/api/placeholder/600/400')] bg-cover bg-center"></div>
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <Shield className="h-20 w-20 text-white" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <Shield className="h-8 w-8 mr-2 text-blue-400" />
                <span className="text-2xl font-bold text-white">
                  Rail<span className="text-blue-400">Kavach</span>
                </span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                AI-powered railway safety system protecting wildlife and
                preventing accidents on railway tracks.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Company</h2>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Case Studies
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Contact</h2>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Get Demo
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Support
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Sales
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Partnership
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Media Inquiries
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Rail Kavach. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">
                Cookies Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
