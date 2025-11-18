"use client";

import Image from "next/image";
import React, { useState, useEffect } from 'react';
import { Code2, Smartphone, Brain, Layers, Globe, Mail, Github, Linkedin, Sparkles, Zap, Database, Moon, Sun, GraduationCap, Briefcase, Calendar, Award, ChevronRight } from 'lucide-react';


export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedSkillCategory, setSelectedSkillCategory] = useState('ai');
  const [selectedExpertise, setSelectedExpertise] = useState('ai');

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#overview' },
    { label: 'Projects', href: '#projects' },
    { label: 'Tech Stack', href: '#skills' },
    { label: 'Education', href: '#education' },
    { label: 'Contacto', href: '#contacto' }
  ];

  const skillCategories = [
    {
      key: 'ai',
      label: 'AI & Innovation',
      gradient: 'from-purple-500 via-pink-500 to-rose-500',
      description: 'Bringing AI-assisted features into products through data science rigor.',
      emphasis: 'UTS Master’s research focused on ML-powered UX enhancements.',
      skills: ['Data Science', 'Machine Learning', 'AI Integration', 'TensorFlow', 'LangChain', 'Data Storytelling']
    },
    {
      key: 'mobile',
      label: 'Mobile Development',
      gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
      description: 'Native iOS and cross-platform builds with buttery-smooth experiences.',
      emphasis: 'Crafted 15+ consumer and enterprise apps.',
      skills: ['Swift', 'SwiftUI', 'Flutter', 'React Native', 'UIKit', 'Core Animation']
    },
    {
      key: 'backend',
      label: 'Backend & Data',
      gradient: 'from-orange-500 via-amber-500 to-red-600',
      description: 'Reliable APIs, realtime sync, and data pipelines powering products.',
      emphasis: 'Designing resilient services with observability baked in.',
      skills: ['Django', 'RESTful APIs', 'CloudKit', 'CoreData', 'RealmDB', 'PostgreSQL']
    },
    {
      key: 'frontend',
      label: 'Frontend & Design',
      gradient: 'from-green-500 via-emerald-500 to-lime-500',
      description: 'Immersive web experiences with meticulous attention to detail.',
      emphasis: 'Responsive design systems crafted with accessibility in mind.',
      skills: ['React', 'Next.js', 'Astro', 'Tailwind CSS', 'Framer Motion', 'Mapbox']
    }
  ];

  const expertise = [
    {
      code: 'ai',
      title: 'AI & Data Science',
      icon: Brain,
      color: 'from-purple-500 to-pink-600',
      description: 'Master\'s in Data Science & Innovation at UTS'
    },
    {
      code: 'mobile',
      title: 'Mobile Innovation',
      icon: Smartphone,
      color: 'from-cyan-500 to-blue-600',
      description: '7+ years crafting native & hybrid mobile experiences'
    },
    {
      code: 'full-stack',
      title: 'Full-Stack Dev',
      icon: Layers,
      color: 'from-orange-500 to-red-600',
      description: 'Backend with Django, Frontend with modern frameworks'
    },
    {
      code: 'gis',
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
      icon: Smartphone,
      expertise_area: 'mobile',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80'
    },
    {
      title: 'Health Tracking Platform',
      description: 'Cross-platform health monitoring app with ML-powered insights and seamless data synchronization.',
      tech: ['Flutter', 'Django', 'TensorFlow', 'PostgreSQL'],
      color: 'from-purple-500 to-pink-600',
      icon: Brain,
      expertise_area: 'ai',
      image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=900&q=80'
    },
    {
      title: 'GIS Analytics Dashboard',
      description: 'Interactive web-based GIS platform for spatial data visualization and real-time geographic analysis.',
      tech: ['React', 'Mapbox', 'Python', 'PostGIS'],
      color: 'from-green-500 to-emerald-600',
      icon: Globe,
      expertise_area: 'gis',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80'
    },
    {
      title: 'Social Media Mobile Client',
      description: 'High-performance social networking app with real-time messaging, media sharing, and engagement features.',
      tech: ['React Native', 'Firebase', 'Redux', 'WebSocket'],
      color: 'from-orange-500 to-red-600',
      icon: Layers,
      expertise_area: 'full-stack',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80'
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

  // Theme classes
  const bgClass = darkMode 
    ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' 
    : 'bg-gradient-to-br from-slate-50 via-gray-300 to-slate-50';
  
  const textClass = darkMode ? 'text-white' : 'text-slate-900';
  const textSecondaryClass = darkMode ? 'text-slate-300' : 'text-slate-700';
  const textTertiaryClass = darkMode ? 'text-slate-400' : 'text-slate-600';
  
  const cardBgClass = darkMode 
    ? 'backdrop-blur-2xl bg-white/5 border-white/10' 
    : 'backdrop-blur-2xl bg-white/60 border-white/40';
  
  const cardHoverClass = darkMode 
    ? 'hover:bg-white/10' 
    : 'hover:bg-white/80';

  const activeSkillCategory = skillCategories.find((category) => category.key === selectedSkillCategory) ?? skillCategories[0];
  const aiCategory = skillCategories.find((category) => category.key === 'ai');

  const activeExpertiseArea = expertise.find((item) => item.code === selectedExpertise) ?? expertise[0];

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

      {/* Navigation */}
      <nav className={`fixed top-4 left-1/2 -translate-x-1/2 z-40 flex flex-wrap items-center justify-center gap-4 px-6 py-3 rounded-3xl border ${cardBgClass} ${cardHoverClass}`}>
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={`text-sm font-semibold tracking-wide uppercase ${textTertiaryClass} hover:text-cyan-400 transition-colors`}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <header id="overview" className="mb-24 mt-16 scroll-mt-32">
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
            user experiences across platforms. Currently pursuing a Master&rsquo;s in Data Science & Innovation at UTS.
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

        {/* Projects Section */}
        <section id="projects" className="mb-24 scroll-mt-24">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-purple-400" />
            Featured Projects
          </h2>
          <p className={`${textSecondaryClass} mb-6 max-w-3xl`}>
            {activeExpertiseArea.description}
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            {expertise.map((item, idx) => (
              <button
                key={idx}
                onClick={()=>setSelectedExpertise(item.code)}
                className={`group relative overflow-hidden ${cardBgClass} rounded-3xl border p-4 ${cardHoverClass} transition-all duration-500 hover:scale-105 cursor-pointer`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${activeExpertiseArea.code == item.code ? 'opacity-10': ''}`}></div>
                <div className="flex items-center gap-2 relative z-10">
                  <div className={`w-10 h-10 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500`}>
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">{item.title}</h3>
                </div>
                <div className={`absolute -bottom-2 -right-2 w-24 h-24 bg-gradient-to-br ${item.color} rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 ${activeExpertiseArea.code == item.code ? 'opacity-30': ''}`}></div>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project, idx) => (
              <article
                key={project.title}
                className={`group flex flex-col ${cardBgClass} rounded-3xl border p-6 ${cardHoverClass} transition-all duration-500`}
              >
                <div className="relative h-48 rounded-2xl overflow-hidden mb-6">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    priority={idx === 0}
                    sizes="(min-width: 1280px) 30vw, (min-width: 1024px) 45vw, 90vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 px-4 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-semibold tracking-wide text-white uppercase">
                    Case Study
                  </div>
                </div>

                <div className="flex-1">
                  <div className={`w-14 h-14 bg-gradient-to-br ${project.color} rounded-2xl flex items-center justify-center mb-4`}>
                    <project.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{project.title}</h3>
                  <p className={`${textSecondaryClass} mb-5 leading-relaxed`}>{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech) => (
                      <span
                        key={tech}
                        className={`px-3 py-1 rounded-full border text-xs font-semibold ${darkMode ? 'bg-white/5 border-white/15 text-white' : 'bg-white/70 border-slate-200/60 text-slate-700'}`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <button className="mt-6 inline-flex items-center gap-2 text-cyan-400 font-semibold hover:gap-3 transition-all">
                  Ver proyecto
                  <ChevronRight className="w-4 h-4" />
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* Technical Skills */}
        <section id="skills" className="mb-24 scroll-mt-24">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <Database className="w-8 h-8 text-orange-400" />
            Technical Arsenal
          </h2>
          <p className={`${textSecondaryClass} mb-6 max-w-3xl`}>
            Cambia entre las áreas de especialización para explorar herramientas, frameworks y metodologías clave.
          </p>
          <div className="flex flex-wrap gap-3 mb-10">
            {skillCategories.map((category) => {
              const isActive = selectedSkillCategory === category.key;
              return (
                <button
                  key={category.key}
                  onClick={() => setSelectedSkillCategory(category.key)}
                  className={`px-5 py-2 cursor-pointer rounded-full text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? `text-white bg-gradient-to-r ${category.gradient} shadow-lg shadow-pink-500/20`
                      : `${textTertiaryClass} ${darkMode ? 'bg-white/5' : ' bg-white/60'}`
                  }`}
                >
                  {category.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`lg:col-span-2 ${cardBgClass} rounded-3xl border p-8 ${cardHoverClass}`}>
              <p className="text-sm uppercase tracking-[0.4em] text-cyan-400 mb-3">
                {activeSkillCategory.label}
              </p>
              <h3 className="text-3xl font-bold mb-4">{activeSkillCategory.emphasis}</h3>
              <p className={`${textSecondaryClass} max-w-2xl`}>{activeSkillCategory.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-8">
                {activeSkillCategory.skills.map((skill) => (
                  <div
                    key={skill}
                    className={`px-4 py-3 rounded-2xl border text-sm font-semibold ${darkMode ? 'border-white/10 bg-white/5' : 'border-white/60 bg-white/70'}`}
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </div>

            {aiCategory && (
              <div className={`relative overflow-hidden ${cardBgClass} rounded-3xl border p-8 flex flex-col justify-between`}>
                <div className={`absolute inset-0 bg-linear-to-br ${darkMode ? 'from-purple-500/40 via-pink-500/30 to-rose-500/20' : 'from-purple-500/70 via-pink-500/60 to-rose-500/50'}`} />
                <div className="relative z-10">
                  <p className="text-sm uppercase tracking-[0.4em] text-white/70">Focus</p>
                  <h3 className="text-3xl font-bold mt-3 text-white">AI & Innovation</h3>
                  <p className="text-white/80 mt-4">
                    Integrando modelos predictivos, copilots y analítica avanzada para potenciar productos móviles.
                  </p>
                </div>
                <div className="relative z-10 mt-8 flex flex-wrap gap-2">
                  {aiCategory.skills.slice(0, 4).map((skill) => (
                    <span key={skill} className="px-3 py-1 text-xs font-semibold rounded-full bg-white/15 text-white">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Education Section */}
        <section id="education" className="mb-24 scroll-mt-24">
          <h2 className="text-3xl font-bold mb-12 flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-cyan-400" />
            Educación
          </h2>
          <div className="relative pl-8">
            <div className={`absolute left-4 top-0 bottom-0 w-px ${darkMode ? 'bg-white/15' : 'bg-slate-200/70'} rounded-full`}></div>
            {education.map((edu) => (
              <div key={edu.degree} className="relative pb-12 last:pb-0">
                <div className="absolute -left-7 top-18 w-6 h-6">
                  <div className={`w-full h-full rounded-full border-2 ${edu.status === 'In Progress' ? 'border-purple-400' : 'border-emerald-400'} ${darkMode ? 'bg-slate-900/30' : 'bg-white/30'} backdrop-blur`}>
                    <div className="absolute inset-0 rounded-full blur-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30"></div>
                  </div>
                </div>
                <div className={`relative ml-6 ${cardBgClass} rounded-3xl border px-6 py-6 ${cardHoverClass}`}>
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-cyan-400 flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        {edu.status}
                      </p>
                      <h3 className="text-2xl font-bold mt-2">{edu.degree}</h3>
                      <p className="text-lg text-cyan-500 font-semibold">{edu.institution}</p>
                      <p className={`${textSecondaryClass} mt-4 leading-relaxed`}>{edu.description}</p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${darkMode ? 'border-white/10 bg-white/5' : 'border-white/40 bg-white/50'}`}>
                      <Calendar className="w-4 h-4" />
                      <span className={`text-sm font-semibold ${textTertiaryClass}`}>{edu.period}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* About Section - Large Feature Card */}
        <section id="about" className="mb-24 scroll-mt-24">
          <div className={`relative overflow-hidden ${cardBgClass} rounded-3xl border p-10`}>
            <div className={`absolute top-0 right-0 w-64 h-64 ${darkMode ? 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20' : 'bg-gradient-to-br from-cyan-500/10 to-purple-500/10'} rounded-full blur-3xl`}></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-yellow-400" />
                About Me
              </h2>
              <div className={`space-y-4 ${textSecondaryClass} leading-relaxed`}>
                <p>
                  I&rsquo;m a <span className="text-cyan-500 font-semibold">mobile developer with over seven years</span> of experience building 
                  high-quality mobile applications using native technologies like <span className={`${darkMode ? 'text-white' : 'text-slate-900'} font-medium`}>Swift</span> and hybrid 
                  frameworks such as <span className={`${darkMode ? 'text-white' : 'text-slate-900'} font-medium`}>Flutter</span> and <span className={`${darkMode ? 'text-white' : 'text-slate-900'} font-medium`}>React Native</span>.
                </p>
                <p>
                  Throughout my career, I&rsquo;ve worked with a variety of libraries including Alamofire, RealmDB, CloudKit, CoreData, and UIKit. 
                  I&rsquo;m skilled in designing custom user interfaces using both <span className="text-purple-500 font-semibold">SwiftUI</span> and traditional 
                  tools like Storyboards, with a focus on clean, scalable code.
                </p>
                <p>
                  Beyond mobile, I&rsquo;ve expanded into <span className="text-orange-500 font-semibold">backend development with Django</span> and 
                  <span className="text-green-500 font-semibold"> frontend web development</span> using ReactJS, Astro, and Tailwind. As the tech industry 
                  evolves, I&rsquo;ve developed a strong interest in <span className="text-pink-500 font-semibold">artificial intelligence</span> and 
                  its real-world applications.
                </p>
                <p>
                  This passion led me to pursue a <span className="text-purple-500 font-semibold">Master&rsquo;s in Data Science and Innovation at UTS</span>, 
                  where I&rsquo;m exploring how AI and emerging technologies are transforming software development and product design. I bring a 
                  multidisciplinary mindset, combining technical excellence with a passion for design, innovation, and continuous learning.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer id="contacto" className="text-center pb-12 scroll-mt-24">
          <div className={`${cardBgClass} rounded-3xl border p-8`}>
            <p className={`${textTertiaryClass} mb-4`}>Let&rsquo;s build something amazing together</p>
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
