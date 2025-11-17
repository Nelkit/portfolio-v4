"use client";

import Image from "next/image";
import React, { useState, useEffect } from 'react';
import { Code2, Smartphone, Brain, Layers, Globe, Mail, Github, Linkedin, ExternalLink, Sparkles, Zap, Database, Palette, Moon, Sun, GraduationCap, Briefcase, Calendar, Award, ChevronRight } from 'lucide-react';


export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [activeCard, setActiveCard] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const skills = {
    mobile: ['Swift', 'SwiftUI', 'Flutter', 'React Native', 'UIKit'],
    backend: ['Django', 'RESTful APIs', 'CloudKit', 'CoreData', 'RealmDB'],
    frontend: ['React', 'Next.js', 'Astro', 'Tailwind CSS'],
    ai: ['Data Science', 'Machine Learning', 'AI Integration']
  };

  const expertise = [
    {
      title: 'Mobile Innovation',
      icon: Smartphone,
      color: 'from-cyan-500 to-blue-600',
      description: '7+ years crafting native & hybrid mobile experiences'
    },
    {
      title: 'AI & Data Science',
      icon: Brain,
      color: 'from-purple-500 to-pink-600',
      description: 'Master\'s in Data Science & Innovation at UTS'
    },
    {
      title: 'Full-Stack Dev',
      icon: Layers,
      color: 'from-orange-500 to-red-600',
      description: 'Backend with Django, Frontend with modern frameworks'
    },
    {
      title: 'GIS & Web',
      icon: Globe,
      color: 'from-green-500 to-emerald-600',
      description: 'Freelance GIS development & web solutions'
    }
  ];

  const projects = [
    {
      title: 'E-Commerce Mobile App',
      description: 'Full-featured iOS shopping application with real-time inventory, payment integration, and personalized recommendations.',
      tech: ['Swift', 'SwiftUI', 'CoreData', 'CloudKit'],
      color: 'from-cyan-500 to-blue-600',
      icon: Smartphone
    },
    {
      title: 'Health Tracking Platform',
      description: 'Cross-platform health monitoring app with ML-powered insights and seamless data synchronization.',
      tech: ['Flutter', 'Django', 'TensorFlow', 'PostgreSQL'],
      color: 'from-purple-500 to-pink-600',
      icon: Brain
    },
    {
      title: 'GIS Analytics Dashboard',
      description: 'Interactive web-based GIS platform for spatial data visualization and real-time geographic analysis.',
      tech: ['React', 'Mapbox', 'Python', 'PostGIS'],
      color: 'from-green-500 to-emerald-600',
      icon: Globe
    },
    {
      title: 'Social Media Mobile Client',
      description: 'High-performance social networking app with real-time messaging, media sharing, and engagement features.',
      tech: ['React Native', 'Firebase', 'Redux', 'WebSocket'],
      color: 'from-orange-500 to-red-600',
      icon: Layers
    }
  ];

  const education = [
    {
      degree: 'Master of Data Science and Innovation',
      institution: 'University of Technology Sydney (UTS)',
      period: '2024 - Present',
      description: 'Specializing in artificial intelligence, machine learning, and innovative technology applications in software development.',
      status: 'In Progress'
    },
    {
      degree: 'Bachelor of Software Engineering',
      institution: 'University',
      period: '2013 - 2017',
      description: 'Foundation in computer science, software architecture, algorithms, and mobile application development.',
      status: 'Completed'
    }
  ];

  const experience = [
    {
      role: 'Senior Mobile Developer',
      company: 'Tech Company',
      period: '2020 - Present',
      highlights: [
        'Led development of flagship iOS applications using Swift and SwiftUI',
        'Implemented CI/CD pipelines reducing deployment time by 40%',
        'Mentored junior developers in mobile best practices'
      ]
    },
    {
      role: 'Full-Stack Developer',
      company: 'Freelance',
      period: '2018 - Present',
      highlights: [
        'Delivered 20+ web and mobile projects for international clients',
        'Specialized in GIS solutions and location-based services',
        'Built scalable backends with Django and RESTful APIs'
      ]
    }
  ];

  // Theme classes
  const bgClass = darkMode 
    ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' 
    : 'bg-gradient-to-br from-slate-50 via-white to-slate-50';
  
  const textClass = darkMode ? 'text-white' : 'text-slate-900';
  const textSecondaryClass = darkMode ? 'text-slate-300' : 'text-slate-700';
  const textTertiaryClass = darkMode ? 'text-slate-400' : 'text-slate-600';
  
  const cardBgClass = darkMode 
    ? 'backdrop-blur-xl bg-white/5 border-white/10' 
    : 'backdrop-blur-xl bg-white/80 border-slate-200/60 shadow-lg';
  
  const cardHoverClass = darkMode 
    ? 'hover:bg-white/10' 
    : 'hover:bg-white/95 hover:shadow-xl';

  const orbColorDark = darkMode ? 'bg-cyan-500/20' : 'bg-cyan-500/10';
  const orbColorPurple = darkMode ? 'bg-purple-500/20' : 'bg-purple-500/10';
  const orbColorPink = darkMode ? 'bg-pink-500/10' : 'bg-pink-500/8';

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} overflow-hidden transition-colors duration-500`}>
      {/* Animated background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/4 -left-48 w-96 h-96 ${orbColorDark} rounded-full blur-3xl animate-pulse`}
             style={{ transform: `translateY(${scrollY * 0.2}px)` }}></div>
        <div className={`absolute bottom-1/4 -right-48 w-96 h-96 ${orbColorPurple} rounded-full blur-3xl animate-pulse`}
             style={{ transform: `translateY(${-scrollY * 0.2}px)`, animationDelay: '1s' }}></div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 ${orbColorPink} rounded-full blur-3xl animate-pulse`}
             style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Theme Toggle Button */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`fixed top-6 right-6 z-50 p-4 ${cardBgClass} rounded-2xl border ${cardHoverClass} transition-all duration-300 hover:scale-110 group`}
      >
        {darkMode ? (
          <Sun className="w-6 h-6 text-yellow-400 group-hover:rotate-180 transition-transform duration-500" />
        ) : (
          <Moon className="w-6 h-6 text-slate-700 group-hover:rotate-180 transition-transform duration-500" />
        )}
      </button>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <header className="mb-20 mt-12">
          <div className="flex items-center gap-3 mb-6 group cursor-pointer">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-500"></div>
              <div className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-400 rounded-2xl -rotate-6 group-hover:-rotate-12 transition-transform duration-500 flex items-center justify-center">
                <Code2 className="w-10 h-10 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Nelkit Chavez
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                <p className={`text-xl ${textSecondaryClass}`}>Software Engineer & AI Enthusiast</p>
              </div>
            </div>
          </div>

          <p className={`text-lg ${textSecondaryClass} max-w-3xl leading-relaxed mb-8 ${cardBgClass} p-6 rounded-2xl border`}>
            Multidisciplinary developer with <span className="text-cyan-400 font-semibold">7+ years</span> building mobile applications, 
            expanding into <span className="text-purple-400 font-semibold">AI & Data Science</span>, and crafting exceptional 
            user experiences across platforms. Currently pursuing a Master's in Data Science & Innovation at UTS.
          </p>

          <div className="flex flex-wrap gap-4">
            <a href="mailto:contact@nelkit.dev" 
               className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105">
              <Mail className="w-5 h-5" />
              <span className="font-semibold">Get in Touch</span>
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer"
               className={`group flex items-center gap-2 px-6 py-3 ${cardBgClass} rounded-xl border ${cardHoverClass} transition-all duration-300 hover:scale-105`}>
              <Github className="w-5 h-5" />
              <span className="font-semibold">GitHub</span>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
               className={`group flex items-center gap-2 px-6 py-3 ${cardBgClass} rounded-xl border ${cardHoverClass} transition-all duration-300 hover:scale-105`}>
              <Linkedin className="w-5 h-5" />
              <span className="font-semibold">LinkedIn</span>
            </a>
          </div>
        </header>

        {/* Bento Grid - Expertise Areas */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <Zap className="w-8 h-8 text-yellow-400" />
            Expertise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {expertise.map((item, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setActiveCard(idx)}
                onMouseLeave={() => setActiveCard(null)}
                className={`group relative overflow-hidden ${cardBgClass} rounded-3xl border p-6 ${cardHoverClass} transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                <div className="relative z-10">
                  <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform duration-500`}>
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className={`${textTertiaryClass} text-sm`}>{item.description}</p>
                </div>
                <div className={`absolute -bottom-2 -right-2 w-24 h-24 bg-gradient-to-br ${item.color} rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`}></div>
              </div>
            ))}
          </div>
        </section>

        {/* Projects Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-purple-400" />
            Featured Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project, idx) => (
              <div
                key={idx}
                className={`group relative overflow-hidden ${cardBgClass} rounded-3xl border p-8 ${cardHoverClass} transition-all duration-300`}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${project.color} opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`}></div>
                <div className="relative z-10">
                  <div className={`w-16 h-16 bg-gradient-to-br ${project.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <project.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{project.title}</h3>
                  <p className={`${textSecondaryClass} mb-4 leading-relaxed`}>{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech, techIdx) => (
                      <span
                        key={techIdx}
                        className={`px-3 py-1 ${darkMode ? 'bg-white/10 border-white/20' : 'bg-slate-100 border-slate-300'} border rounded-full text-xs font-medium ${textTertiaryClass}`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <button className="mt-6 flex items-center gap-2 text-cyan-500 font-semibold hover:gap-3 transition-all duration-300">
                    View Details <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Education Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-cyan-400" />
            Education
          </h2>
          <div className="space-y-6">
            {education.map((edu, idx) => (
              <div
                key={idx}
                className={`group relative overflow-hidden ${cardBgClass} rounded-3xl border p-8 ${cardHoverClass} transition-all duration-300`}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <Award className={`w-6 h-6 ${edu.status === 'In Progress' ? 'text-purple-500' : 'text-green-500'} mt-1 flex-shrink-0`} />
                      <div>
                        <h3 className="text-2xl font-bold mb-1">{edu.degree}</h3>
                        <p className="text-lg text-cyan-500 font-semibold">{edu.institution}</p>
                      </div>
                    </div>
                    <p className={`${textSecondaryClass} leading-relaxed mt-3`}>{edu.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`flex items-center gap-2 px-4 py-2 ${darkMode ? 'bg-white/10' : 'bg-slate-100'} rounded-full`}>
                      <Calendar className="w-4 h-4" />
                      <span className={`text-sm font-medium ${textTertiaryClass}`}>{edu.period}</span>
                    </div>
                    <span className={`px-4 py-1 rounded-full text-sm font-semibold ${
                      edu.status === 'In Progress' 
                        ? 'bg-purple-500/20 text-purple-600 border border-purple-500/30' 
                        : 'bg-green-500/20 text-green-600 border border-green-500/30'
                    }`}>
                      {edu.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Technical Skills - Bento Grid */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <Database className="w-8 h-8 text-orange-400" />
            Technical Arsenal
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mobile Development */}
            <div className={`${cardBgClass} rounded-3xl border p-8 ${cardHoverClass} transition-all duration-300 group`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Mobile Development</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.mobile.map((skill, idx) => (
                  <span key={idx} className={`px-4 py-2 ${darkMode ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300' : 'bg-cyan-50 border-cyan-200 text-cyan-700'} border rounded-full text-sm font-medium hover:scale-105 transition-transform duration-200`}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Backend Development */}
            <div className={`${cardBgClass} rounded-3xl border p-8 ${cardHoverClass} transition-all duration-300 group`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Backend & Data</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.backend.map((skill, idx) => (
                  <span key={idx} className={`px-4 py-2 ${darkMode ? 'bg-orange-500/20 border-orange-500/30 text-orange-300' : 'bg-orange-50 border-orange-200 text-orange-700'} border rounded-full text-sm font-medium hover:scale-105 transition-transform duration-200`}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Frontend Development */}
            <div className={`${cardBgClass} rounded-3xl border p-8 ${cardHoverClass} transition-all duration-300 group`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Frontend & Design</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.frontend.map((skill, idx) => (
                  <span key={idx} className={`px-4 py-2 ${darkMode ? 'bg-green-500/20 border-green-500/30 text-green-300' : 'bg-green-50 border-green-200 text-green-700'} border rounded-full text-sm font-medium hover:scale-105 transition-transform duration-200`}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* AI & Data Science */}
            <div className={`${cardBgClass} rounded-3xl border p-8 ${cardHoverClass} transition-all duration-300 group`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold">AI & Innovation</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.ai.map((skill, idx) => (
                  <span key={idx} className={`px-4 py-2 ${darkMode ? 'bg-purple-500/20 border-purple-500/30 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-700'} border rounded-full text-sm font-medium hover:scale-105 transition-transform duration-200`}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* About Section - Large Feature Card */}
        <section className="mb-20">
          <div className={`relative overflow-hidden ${cardBgClass} rounded-3xl border p-10`}>
            <div className={`absolute top-0 right-0 w-64 h-64 ${darkMode ? 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20' : 'bg-gradient-to-br from-cyan-500/10 to-purple-500/10'} rounded-full blur-3xl`}></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-yellow-400" />
                About Me
              </h2>
              <div className={`space-y-4 ${textSecondaryClass} leading-relaxed`}>
                <p>
                  I'm a <span className="text-cyan-500 font-semibold">mobile developer with over seven years</span> of experience building 
                  high-quality mobile applications using native technologies like <span className={`${darkMode ? 'text-white' : 'text-slate-900'} font-medium`}>Swift</span> and hybrid 
                  frameworks such as <span className={`${darkMode ? 'text-white' : 'text-slate-900'} font-medium`}>Flutter</span> and <span className={`${darkMode ? 'text-white' : 'text-slate-900'} font-medium`}>React Native</span>.
                </p>
                <p>
                  Throughout my career, I've worked with a variety of libraries including Alamofire, RealmDB, CloudKit, CoreData, and UIKit. 
                  I'm skilled in designing custom user interfaces using both <span className="text-purple-500 font-semibold">SwiftUI</span> and traditional 
                  tools like Storyboards, with a focus on clean, scalable code.
                </p>
                <p>
                  Beyond mobile, I've expanded into <span className="text-orange-500 font-semibold">backend development with Django</span> and 
                  <span className="text-green-500 font-semibold"> frontend web development</span> using ReactJS, Astro, and Tailwind. As the tech industry 
                  evolves, I've developed a strong interest in <span className="text-pink-500 font-semibold">artificial intelligence</span> and 
                  its real-world applications.
                </p>
                <p>
                  This passion led me to pursue a <span className="text-purple-500 font-semibold">Master's in Data Science and Innovation at UTS</span>, 
                  where I'm exploring how AI and emerging technologies are transforming software development and product design. I bring a 
                  multidisciplinary mindset, combining technical excellence with a passion for design, innovation, and continuous learning.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center pb-12">
          <div className={`${cardBgClass} rounded-3xl border p-8`}>
            <p className={`${textTertiaryClass} mb-4`}>Let's build something amazing together</p>
            <div className="flex justify-center gap-6">
              <a href="mailto:contact@nelkit.dev" className="text-cyan-500 hover:text-cyan-600 transition-colors hover:scale-110 transform duration-200">
                <Mail className="w-6 h-6" />
              </a>
              <a href="https://github.com" className="text-cyan-500 hover:text-cyan-600 transition-colors hover:scale-110 transform duration-200">
                <Github className="w-6 h-6" />
              </a>
              <a href="https://linkedin.com" className="text-cyan-500 hover:text-cyan-600 transition-colors hover:scale-110 transform duration-200">
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
            <p className={`${darkMode ? 'text-slate-500' : 'text-slate-400'} text-sm mt-6`}>© 2026 Nelkit Chavez. Crafted with passion.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
