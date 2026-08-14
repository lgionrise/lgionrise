'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';

// ============================================================
// CONFIGURATION
// ============================================================
const CONFIG = {
  // FRONTEND DOMAIN - replace with your actual domain if needed
  FRONTEND_BASE: 'https://lgionrise.vercel.app',
  LOGIN_URL: '/login',
  REGISTER_URL: '/register',
  STUDENT_DASHBOARD: '/student',
  TEACHER_DASHBOARD: '/teacher',

  // API
  API_BASE: 'https://api.lgion.qalbconverfy.in/api/v1',
  ENDPOINTS: {
    batches: '/batches/',
  },
  TOKEN_COOKIE: 'lgion_access',
  TOKEN_STORAGE: 'lgion_access_token',
  ROLE_STORAGE: 'lgion_user_role',

  // GitHub gallery base URL - replace YOUR_USER and YOUR_REPO with actual
 GALLERY_BASE: 'https://raw.githubusercontent.com/lgionrise/assets/main/gallery',
 GALLERY_IMAGES: Array.from({ length: 20 }, (_, i) => `image${i + 1}.jpg`),

  // Request timeout
  REQUEST_TIMEOUT: 10000,
};

// ============================================================
// MOCK DATA (fallback when API fails)
// ============================================================
const MOCK_BATCHES = [
  { id: 1, title: 'JEE Main 2026 Complete Batch', teacher: 'Dr. Rajesh Kumar Sharma', language: 'Hindi + English', price: 15000, discounted_price: 12999, validity: '12 months', status: 'Active', thumbnail_url: '', icon: '⚛️', color: 'linear-gradient(135deg,#4F46E5,#7C3AED)' },
  { id: 2, title: 'NEET UG 2026 Biology Masterclass', teacher: 'Prof. Anita Desai', language: 'Hindi + English', price: 12000, discounted_price: 9999, validity: '10 months', status: 'Active', thumbnail_url: '', icon: '🧬', color: 'linear-gradient(135deg,#7C3AED,#EC4899)' },
  { id: 3, title: 'Class 12 CBSE Board 2026 — All Subjects', teacher: 'Multiple Expert Teachers', language: 'English', price: 8000, discounted_price: 6499, validity: '8 months', status: 'Active', thumbnail_url: '', icon: '📚', color: 'linear-gradient(135deg,#F59E0B,#EF4444)' },
  { id: 4, title: 'SSC CGL 2025 Complete Course', teacher: 'Mr. Vikram Singh', language: 'Hindi', price: 7500, discounted_price: 5999, validity: '6 months', status: 'Active', thumbnail_url: '', icon: '📊', color: 'linear-gradient(135deg,#10B981,#0EA5E9)' },
  { id: 5, title: 'UPSC Prelims 2026 Foundation', teacher: 'Multiple Expert Teachers', language: 'Hindi + English', price: 25000, discounted_price: 19999, validity: '14 months', status: 'Active', thumbnail_url: '', icon: '🇮🇳', color: 'linear-gradient(135deg,#F97316,#DC2626)' },
  { id: 6, title: 'IIT-JAM Mathematics 2026', teacher: 'Mr. Vikram Singh', language: 'English', price: 9000, discounted_price: 7499, validity: '8 months', status: 'Active', thumbnail_url: '', icon: '📐', color: 'linear-gradient(135deg,#0EA5E9,#4F46E5)' },
];

const MOCK_TEACHERS = [
  { name: 'Dr. Rajesh Kumar Sharma', subject: 'Physics (JEE / NEET)', experience: '15+ years exp', bio: 'Former IIT professor with a passion for making Physics intuitive. Has mentored 5000+ successful JEE aspirants.', verified: true, photo: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { name: 'Prof. Anita Desai', subject: 'Biology (NEET)', experience: '12+ years exp', bio: 'Gold medalist in Botany. Known for her engaging teaching style and comprehensive NEET biology notes.', verified: true, photo: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { name: 'Mr. Vikram Singh', subject: 'Mathematics (JEE / IIT-JAM)', experience: '10+ years exp', bio: 'Math olympiad trainer and author. Specializes in making complex problems simple and approachable.', verified: true, photo: 'https://randomuser.me/api/portraits/men/46.jpg' },
  { name: 'Ms. Priya Patel', subject: 'Chemistry (JEE / NEET)', experience: '8+ years exp', bio: 'PhD in Organic Chemistry. Beloved by students for her clear explanations and practical approach.', verified: true, photo: 'https://randomuser.me/api/portraits/women/68.jpg' },
];

const MOCK_FEATURES = [
  { icon: '📡', title: 'Live Interactive Classes', desc: 'Real-time classes with expert teachers. Ask questions, participate in polls, and stay engaged.' },
  { icon: '🎥', title: 'Recorded Lectures', desc: 'Missed a class? Access high-quality recordings anytime and revise at your own pace.' },
  { icon: '📝', title: 'Notes & Study Material', desc: 'Comprehensive chapter-wise notes, formula sheets, and practice worksheets for every subject.' },
  { icon: '📋', title: 'Tests & Practice', desc: 'Regular mock tests, previous year papers, and topic-wise quizzes to track your progress.' },
  { icon: '💬', title: '24/7 Doubt Support', desc: 'Get your doubts resolved within minutes by expert mentors and dedicated doubt-solving teams.' },
  { icon: '📱', title: 'Mobile-Friendly Learning', desc: 'Learn on the go with our fully responsive platform. Your classroom is in your pocket.' },
];

const MOCK_TESTIMONIALS = [
  { quote: 'LGIONRISE completely changed my JEE preparation. The live classes are incredibly engaging and the doubt support is lightning fast. I scored 98.5 percentile!', name: 'Ananya Sharma', role: 'JEE Aspirant • Secured AIR 4,582', initials: 'AS' },
  { quote: 'The biology lectures by Prof. Anita are the best I have ever attended. The notes are so thorough that I barely needed any other resource for NEET.', name: 'Rahul Verma', role: 'NEET Student • MBBS 2026', initials: 'RV' },
  { quote: 'As a working professional preparing for SSC, the recorded lectures and mock tests were a game-changer. Flexible and extremely well-structured.', name: 'Sneha Patel', role: 'SSC CGL Aspirant', initials: 'SP' },
  { quote: 'I was struggling with Math until I joined Mr. Vikram\'s batch. His teaching style is simple, clear, and incredibly effective. Highly recommended!', name: 'Arjun Singh', role: 'Class 12 Student • CBSE', initials: 'AS' },
];

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================
export default function HomePage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const galleryTrackRef = useRef<HTMLDivElement>(null);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ---- Toast helper ----
  const showToast = useCallback((message: string, type: string = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3600);
  }, []);

  // ---- Auth redirect on mount ----
  useEffect(() => {
    const token = localStorage.getItem(CONFIG.TOKEN_STORAGE) || (document.cookie.match(new RegExp('(^| )' + CONFIG.TOKEN_COOKIE + '=([^;]+)')) || [])[2];
    if (token) {
      const role = localStorage.getItem(CONFIG.ROLE_STORAGE) || 'student';
      window.location.href = role === 'teacher' ? CONFIG.TEACHER_DASHBOARD : CONFIG.STUDENT_DASHBOARD;
    }
  }, []);

  // ---- Fetch batches ----
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);

    fetch(`${CONFIG.API_BASE}${CONFIG.ENDPOINTS.batches}`, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch');
        return response.json();
      })
      .then((data: any) => {
        clearTimeout(timeout);
        let extracted: any[] = [];
        if (Array.isArray(data)) extracted = data;
        else if (Array.isArray(data.results)) extracted = data.results;
        else if (Array.isArray(data.batches)) extracted = data.batches;
        else if (Array.isArray(data.data)) extracted = data.data;
        
        if (extracted.length > 0) {
          const enriched = extracted.map((b: any) => ({
            ...b,
            icon: b.icon || MOCK_BATCHES.find(m => m.title === b.title)?.icon || '📚',
            color: b.color || MOCK_BATCHES.find(m => m.title === b.title)?.color || 'linear-gradient(135deg,#4F46E5,#7C3AED)',
          }));
          setBatches(enriched);
        } else {
          setBatches(MOCK_BATCHES);
        }
        setLoadingBatches(false);
      })
      .catch((err) => {
        clearTimeout(timeout);
        console.warn('Batches API failed, using mock data:', err.message);
        setBatches(MOCK_BATCHES);
        setLoadingBatches(false);
      });

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  // ---- Gallery setup ----
  useEffect(() => {
    const images = CONFIG.GALLERY_IMAGES.map(img => CONFIG.GALLERY_BASE + img);
    setGalleryImages(images);
  }, []);

  useEffect(() => {
    if (galleryImages.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % galleryImages.length);
    }, 4000);
    autoplayRef.current = interval;
    return () => clearInterval(interval);
  }, [galleryImages]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % galleryImages.length);
  }, [galleryImages]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => (prev - 1 + galleryImages.length) % galleryImages.length);
  }, [galleryImages]);

  const resetAutoplay = useCallback(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % galleryImages.length);
    }, 4000);
    autoplayRef.current = interval;
  }, [galleryImages]);

  // ---- Scroll effect for navbar ----
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ---- Reveal animations ----
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // ---- Stats count-up ----
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          const target = parseInt(el.dataset.count || '0', 10);
          const duration = 1800;
          const start = performance.now();
          function updateCount(currentTime: number) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(eased * target);
            el.textContent = currentValue.toLocaleString('en-IN') + '+';
            if (progress < 1) {
              requestAnimationFrame(updateCount);
            } else {
              el.textContent = target.toLocaleString('en-IN') + '+';
            }
          }
          requestAnimationFrame(updateCount);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('.stat-number').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // ---- Batch card interactions ----
  const handleShowBatchDetails = (title: string, teacher: string, language: string, validity: string, price: number, discounted: number) => {
    const msg = `📚 ${title}\n👨‍🏫 ${teacher}\n🗣️ ${language}\n⏳ ${validity}\n💰 ₹${discounted.toLocaleString('en-IN')} (original ₹${price.toLocaleString('en-IN')})`;
    showToast(msg, 'info');
  };

  const handleEnroll = (batchTitle: string) => {
    const token = localStorage.getItem(CONFIG.TOKEN_STORAGE) || (document.cookie.match(new RegExp('(^| )' + CONFIG.TOKEN_COOKIE + '=([^;]+)')) || [])[2];
    if (!token) {
      showToast(`Login to enroll in "${batchTitle}"`, 'info');
      window.location.href = CONFIG.LOGIN_URL;
      return;
    }
    const role = localStorage.getItem(CONFIG.ROLE_STORAGE) || 'student';
    if (role === 'teacher') {
      showToast('Teachers cannot enroll in batches. Please use a student account.', 'warning');
      return;
    }
    window.location.href = CONFIG.STUDENT_DASHBOARD;
  };

  // ---- Render ----
  return (
    <>
      {/* Full CSS as global styles */}
      <style jsx global>{`
        :root {
          --primary: #4F46E5;
          --primary-dark: #4338CA;
          --primary-darker: #3730A3;
          --primary-light: #EEF2FF;
          --violet: #7C3AED;
          --violet-dark: #6D28D9;
          --gradient: linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #9333EA 100%);
          --gradient-hover: linear-gradient(135deg, #4338CA 0%, #6D28D9 50%, #7E22CE 100%);
          --bg: #F8FAFC;
          --surface: #FFFFFF;
          --surface-hover: #F1F5F9;
          --text-heading: #0F172A;
          --text-body: #475569;
          --text-light: #94A3B8;
          --border: #E2E8F0;
          --success: #10B981;
          --success-bg: #D1FAE5;
          --error: #EF4444;
          --error-bg: #FEE2E2;
          --warning: #F59E0B;
          --warning-bg: #FEF3C7;
          --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
          --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04);
          --shadow-lg: 0 10px 25px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
          --shadow-xl: 0 20px 40px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.03);
          --radius-sm: 8px;
          --radius-md: 12px;
          --radius-lg: 16px;
          --radius-xl: 20px;
          --radius-2xl: 24px;
          --radius-full: 9999px;
          --font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          --transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          --transition-slow: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        *,
        *::before,
        *::after {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        html {
          scroll-behavior: smooth;
          scroll-padding-top: 80px;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        body {
          font-family: var(--font);
          font-size: 16px;
          line-height: 1.6;
          color: var(--text-body);
          background: var(--bg);
          overflow-x: hidden;
          min-height: 100vh;
        }
        img {
          max-width: 100%;
          height: auto;
          display: block;
        }
        a {
          text-decoration: none;
          color: inherit;
          transition: color var(--transition);
        }
        button {
          cursor: pointer;
          font-family: var(--font);
          border: none;
          background: none;
          transition: all var(--transition);
        }
        input,
        select,
        textarea {
          font-family: var(--font);
          font-size: 15px;
          transition: border-color var(--transition), box-shadow var(--transition);
        }
        ul,
        ol {
          list-style: none;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .skeleton {
          background: linear-gradient(90deg, #E2E8F0 25%, #F1F5F9 50%, #E2E8F0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: var(--radius-md);
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .toast-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 99999;
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 380px;
          width: calc(100% - 40px);
        }
        .toast {
          padding: 14px 18px;
          border-radius: var(--radius-md);
          font-weight: 500;
          font-size: 14px;
          color: #fff;
          box-shadow: var(--shadow-lg);
          animation: toastIn 0.4s ease, toastOut 0.4s ease 3.2s forwards;
          display: flex;
          align-items: center;
          gap: 10px;
          word-break: break-word;
        }
        .toast-success { background: var(--success); }
        .toast-error { background: var(--error); }
        .toast-info { background: var(--primary); }
        .toast-warning { background: var(--warning); }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(30px); }
        }
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 10000;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border);
          transition: box-shadow var(--transition), background var(--transition);
          height: 72px;
        }
        .navbar.scrolled {
          box-shadow: var(--shadow-md);
          background: rgba(255, 255, 255, 0.98);
        }
        .navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 72px;
          gap: 16px;
        }
        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 900;
          font-size: 24px;
          letter-spacing: -0.5px;
          color: var(--text-heading);
          flex-shrink: 0;
        }
        .navbar-logo .logo-icon {
          width: 38px;
          height: 38px;
          background: var(--gradient);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 800;
          font-size: 18px;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        }
        .navbar-logo span {
          background: var(--gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .navbar-logo .logo-sub {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-light);
          -webkit-text-fill-color: var(--text-light);
          display: block;
          letter-spacing: 0.5px;
        }
        .navbar-links {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          justify-content: center;
        }
        .navbar-links a {
          padding: 8px 14px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-body);
          border-radius: var(--radius-full);
          transition: all var(--transition);
          white-space: nowrap;
        }
        .navbar-links a:hover {
          color: var(--primary);
          background: var(--primary-light);
        }
        .navbar-links a.active {
          color: var(--primary);
          background: var(--primary-light);
        }
        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .btn-login-nav {
          padding: 8px 18px;
          font-size: 14px;
          font-weight: 600;
          color: var(--primary);
          border: 2px solid var(--primary);
          border-radius: var(--radius-full);
          background: transparent;
          transition: all var(--transition);
          display: inline-block;
          text-align: center;
        }
        .btn-login-nav:hover {
          background: var(--primary-light);
          border-color: var(--primary-dark);
        }
        .btn-signup-nav {
          padding: 8px 18px;
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          background: var(--gradient);
          border-radius: var(--radius-full);
          border: 2px solid transparent;
          box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);
          transition: all var(--transition);
          display: inline-block;
          text-align: center;
        }
        .btn-signup-nav:hover {
          box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
          transform: translateY(-1px);
        }
        .hamburger {
          display: none;
          width: 44px;
          height: 44px;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
          transition: background var(--transition);
        }
        .hamburger:hover {
          background: var(--surface-hover);
        }
        .hamburger svg {
          width: 26px;
          height: 26px;
          stroke: var(--text-heading);
          stroke-width: 2.2;
          fill: none;
        }
        .mobile-menu {
          position: fixed;
          top: 72px;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--surface);
          z-index: 9999;
          padding: 20px 24px 40px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          transform: translateX(100%);
          transition: transform var(--transition-slow);
          overflow-y: auto;
        }
        .mobile-menu.open {
          transform: translateX(0);
        }
        .mobile-menu a {
          padding: 14px 18px;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-heading);
          border-radius: var(--radius-md);
          transition: all var(--transition);
          display: block;
        }
        .mobile-menu a:hover {
          background: var(--primary-light);
          color: var(--primary);
        }
        .mobile-menu .mobile-divider {
          height: 1px;
          background: var(--border);
          margin: 12px 0;
        }
        .mobile-menu .btn-mobile {
          padding: 14px 18px;
          font-size: 16px;
          font-weight: 600;
          border-radius: var(--radius-md);
          text-align: center;
          display: block;
        }
        .mobile-menu .btn-mobile-login {
          color: var(--primary);
          border: 2px solid var(--primary);
          background: transparent;
        }
        .mobile-menu .btn-mobile-signup {
          color: #fff;
          background: var(--gradient);
          border: 2px solid transparent;
        }
        .hero {
          padding: 130px 0 80px;
          background: linear-gradient(180deg, #F8FAFC 0%, #EEF2FF 50%, #F8FAFC 100%);
          position: relative;
          overflow: hidden;
        }
        .hero::before {
          content: '';
          position: absolute;
          top: -150px;
          right: -150px;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(79, 70, 229, 0.12) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }
        .hero::after {
          content: '';
          position: absolute;
          bottom: -100px;
          left: -100px;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(124, 58, 237, 0.1) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 50px;
          align-items: center;
          position: relative;
          z-index: 1;
        }
        .hero-content {
          animation: fadeInUp 0.8s ease;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: var(--primary-light);
          color: var(--primary);
          font-size: 13px;
          font-weight: 600;
          border-radius: var(--radius-full);
          margin-bottom: 18px;
          letter-spacing: 0.3px;
        }
        .hero-badge .pulse-dot {
          width: 8px;
          height: 8px;
          background: var(--success);
          border-radius: 50%;
          animation: pulse 1.8s infinite;
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          50% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
        }
        .hero-title {
          font-size: 52px;
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -1.5px;
          color: var(--text-heading);
          margin-bottom: 20px;
        }
        .hero-title .gradient-text {
          background: var(--gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-subtext {
          font-size: 18px;
          line-height: 1.7;
          color: var(--text-body);
          max-width: 520px;
          margin-bottom: 32px;
        }
        .hero-actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 36px;
        }
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 15px 28px;
          font-size: 16px;
          font-weight: 700;
          color: #fff;
          background: var(--gradient);
          border-radius: var(--radius-full);
          border: none;
          box-shadow: 0 8px 25px rgba(79, 70, 229, 0.35);
          transition: all var(--transition);
          text-decoration: none;
        }
        .btn-primary:hover {
          box-shadow: 0 10px 30px rgba(79, 70, 229, 0.45);
          transform: translateY(-2px);
          background: var(--gradient-hover);
        }
        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 15px 28px;
          font-size: 16px;
          font-weight: 700;
          color: var(--text-heading);
          background: var(--surface);
          border: 2px solid var(--border);
          border-radius: var(--radius-full);
          transition: all var(--transition);
          text-decoration: none;
        }
        .btn-secondary:hover {
          border-color: var(--primary);
          color: var(--primary);
          background: var(--primary-light);
          transform: translateY(-2px);
        }
        .hero-trust {
          display: flex;
          gap: 28px;
          flex-wrap: wrap;
        }
        .trust-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-body);
        }
        .trust-item .trust-icon {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--primary-light);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          flex-shrink: 0;
        }
        .trust-item .trust-icon svg {
          width: 14px;
          height: 14px;
          stroke: currentColor;
          fill: none;
          stroke-width: 2.5;
        }
        .hero-visual {
          position: relative;
          animation: fadeInUp 1s ease 0.2s both;
        }
        .hero-card {
          background: var(--surface);
          border-radius: var(--radius-2xl);
          box-shadow: var(--shadow-xl);
          padding: 24px;
          position: relative;
          z-index: 2;
          max-width: 480px;
          margin-left: auto;
        }
        .hero-card-video {
          background: var(--gradient);
          border-radius: var(--radius-lg);
          padding: 40px 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          margin-bottom: 18px;
          min-height: 180px;
        }
        .hero-card-video::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.15) 0%, transparent 60%);
        }
        .hero-card-video .play-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 26px;
          position: relative;
          z-index: 1;
          border: 2px solid rgba(255, 255, 255, 0.4);
        }
        .hero-card-video .live-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 4px 10px;
          background: rgba(239, 68, 68, 0.9);
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          border-radius: var(--radius-full);
          letter-spacing: 0.5px;
          z-index: 1;
          animation: pulse 2s infinite;
        }
        .hero-card-video .live-badge::before {
          content: '●';
          margin-right: 4px;
          font-size: 8px;
          vertical-align: middle;
        }
        .hero-card-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-heading);
          margin-bottom: 6px;
        }
        .hero-card-sub {
          font-size: 13px;
          color: var(--text-light);
          margin-bottom: 14px;
        }
        .hero-card-progress {
          height: 6px;
          background: var(--surface-hover);
          border-radius: var(--radius-full);
          overflow: hidden;
          margin-bottom: 16px;
        }
        .hero-card-progress-bar {
          height: 100%;
          width: 72%;
          background: var(--gradient);
          border-radius: var(--radius-full);
          animation: progressGrow 2s ease 0.5s forwards;
          transform-origin: left;
          transform: scaleX(0);
        }
        @keyframes progressGrow {
          to { transform: scaleX(1); }
        }
        .hero-card-stats {
          display: flex;
          gap: 16px;
        }
        .hero-card-stat {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-body);
        }
        .hero-card-stat svg {
          width: 16px;
          height: 16px;
          stroke: var(--primary);
          fill: none;
          stroke-width: 2;
        }
        .hero-float {
          position: absolute;
          background: var(--surface);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-heading);
          z-index: 3;
          animation: float 5s ease-in-out infinite;
        }
        .hero-float-1 {
          top: -20px;
          left: -30px;
          animation-delay: 0s;
        }
        .hero-float-2 {
          bottom: 40px;
          right: -20px;
          animation-delay: 1.5s;
        }
        .hero-float-3 {
          bottom: -15px;
          left: 30px;
          animation-delay: 2.5s;
        }
        .hero-float .float-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          flex-shrink: 0;
        }
        .hero-float .float-icon.green { background: var(--success-bg); }
        .hero-float .float-icon.blue { background: var(--primary-light); }
        .hero-float .float-icon.yellow { background: var(--warning-bg); }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .section {
          padding: 80px 0;
        }
        .section-header {
          text-align: center;
          max-width: 680px;
          margin: 0 auto 50px;
        }
        .section-tag {
          display: inline-block;
          font-size: 13px;
          font-weight: 700;
          color: var(--primary);
          background: var(--primary-light);
          padding: 5px 14px;
          border-radius: var(--radius-full);
          letter-spacing: 0.8px;
          text-transform: uppercase;
          margin-bottom: 12px;
        }
        .section-title {
          font-size: 38px;
          font-weight: 900;
          line-height: 1.2;
          letter-spacing: -0.8px;
          color: var(--text-heading);
          margin-bottom: 14px;
        }
        .section-subtitle {
          font-size: 17px;
          color: var(--text-body);
          line-height: 1.7;
        }
        .batches-section {
          background: var(--surface);
        }
        .batches-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }
        .batch-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-2xl);
          overflow: hidden;
          transition: all var(--transition);
          box-shadow: var(--shadow-sm);
          cursor: pointer;
          display: flex;
          flex-direction: column;
        }
        .batch-card:hover {
          box-shadow: var(--shadow-xl);
          transform: translateY(-4px);
          border-color: var(--primary);
        }
        .batch-thumb {
          background: var(--gradient);
          height: 180px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .batch-thumb::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.15) 0%, transparent 60%);
        }
        .batch-thumb-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          position: relative;
          z-index: 1;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }
        .batch-thumb .batch-lang {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 4px 10px;
          background: rgba(0, 0, 0, 0.55);
          color: #fff;
          font-size: 11px;
          font-weight: 600;
          border-radius: var(--radius-full);
          letter-spacing: 0.3px;
          z-index: 1;
        }
        .batch-thumb .batch-status {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 4px 10px;
          background: var(--success);
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          border-radius: var(--radius-full);
          letter-spacing: 0.3px;
          z-index: 1;
        }
        .batch-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .batch-title {
          font-size: 17px;
          font-weight: 700;
          color: var(--text-heading);
          margin-bottom: 6px;
          line-height: 1.35;
        }
        .batch-teacher {
          font-size: 13px;
          color: var(--text-light);
          font-weight: 500;
          margin-bottom: 10px;
        }
        .batch-meta {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 14px;
          font-size: 12px;
          color: var(--text-body);
          font-weight: 500;
        }
        .batch-meta span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .batch-meta svg {
          width: 14px;
          height: 14px;
          stroke: var(--text-light);
          fill: none;
          stroke-width: 2;
        }
        .batch-price-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .batch-price {
          font-size: 22px;
          font-weight: 900;
          color: var(--primary);
        }
        .batch-price-original {
          font-size: 15px;
          color: var(--text-light);
          text-decoration: line-through;
          font-weight: 500;
        }
        .batch-discount {
          font-size: 12px;
          font-weight: 700;
          color: var(--success);
          background: var(--success-bg);
          padding: 2px 8px;
          border-radius: var(--radius-full);
        }
        .batch-actions {
          display: flex;
          gap: 8px;
          margin-top: auto;
        }
        .btn-enroll {
          flex: 1;
          padding: 11px 16px;
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          background: var(--gradient);
          border-radius: var(--radius-md);
          border: none;
          transition: all var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
        }
        .btn-enroll:hover {
          background: var(--gradient-hover);
          box-shadow: var(--shadow-md);
          transform: translateY(-1px);
        }
        .btn-view-details {
          padding: 11px 14px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-body);
          background: var(--surface-hover);
          border-radius: var(--radius-md);
          transition: all var(--transition);
          display: flex;
          align-items: center;
          gap: 4px;
          border: 1px solid var(--border);
          cursor: pointer;
        }
        .btn-view-details:hover {
          background: var(--primary-light);
          color: var(--primary);
          border-color: var(--primary);
        }
        .teachers-section {
          background: var(--bg);
        }
        .teachers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 24px;
        }
        .teacher-card {
          background: var(--surface);
          border-radius: var(--radius-2xl);
          padding: 28px 22px;
          text-align: center;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
          transition: all var(--transition);
        }
        .teacher-card:hover {
          box-shadow: var(--shadow-xl);
          transform: translateY(-4px);
          border-color: var(--primary);
        }
        .teacher-photo {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          margin: 0 auto 16px;
          position: relative;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
        }
        .teacher-photo img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid var(--primary-light);
        }
        .teacher-verified {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 28px;
          height: 28px;
          background: var(--primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          border: 3px solid var(--surface);
        }
        .teacher-verified svg {
          width: 14px;
          height: 14px;
          stroke: #fff;
          fill: none;
          stroke-width: 3;
        }
        .teacher-name {
          font-size: 18px;
          font-weight: 800;
          color: var(--text-heading);
          margin-bottom: 4px;
        }
        .teacher-subject {
          font-size: 13px;
          font-weight: 600;
          color: var(--primary);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .teacher-exp {
          font-size: 12px;
          color: var(--text-light);
          font-weight: 500;
          margin-bottom: 10px;
        }
        .teacher-bio {
          font-size: 13px;
          color: var(--text-body);
          line-height: 1.6;
        }
        .features-section {
          background: var(--surface);
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }
        .feature-card {
          background: var(--bg);
          border-radius: var(--radius-2xl);
          padding: 28px 24px;
          border: 1px solid var(--border);
          transition: all var(--transition);
        }
        .feature-card:hover {
          box-shadow: var(--shadow-lg);
          transform: translateY(-3px);
          border-color: var(--primary);
          background: var(--surface);
        }
        .feature-icon {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-lg);
          background: var(--primary-light);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          margin-bottom: 16px;
          font-size: 24px;
          transition: all var(--transition);
        }
        .feature-card:hover .feature-icon {
          background: var(--gradient);
          color: #fff;
          box-shadow: var(--shadow-md);
        }
        .feature-title {
          font-size: 17px;
          font-weight: 700;
          color: var(--text-heading);
          margin-bottom: 8px;
        }
        .feature-desc {
          font-size: 14px;
          color: var(--text-body);
          line-height: 1.65;
        }
        .gallery-section {
          background: var(--bg);
        }
        .gallery-slider {
          position: relative;
          max-width: 900px;
          margin: 0 auto;
          border-radius: var(--radius-2xl);
          overflow: hidden;
          box-shadow: var(--shadow-xl);
        }
        .gallery-track {
          display: flex;
          transition: transform 0.5s ease-in-out;
        }
        .gallery-slide {
          min-width: 100%;
          position: relative;
        }
        .gallery-slide img {
          width: 100%;
          height: 450px;
          object-fit: cover;
          display: block;
        }
        .gallery-slide img.hidden {
          display: none;
        }
        .gallery-prev,
        .gallery-next {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          box-shadow: var(--shadow-md);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 5;
          transition: all var(--transition);
        }
        .gallery-prev:hover,
        .gallery-next:hover {
          background: #fff;
          box-shadow: var(--shadow-lg);
        }
        .gallery-prev {
          left: 16px;
        }
        .gallery-next {
          right: 16px;
        }
        .gallery-prev svg,
        .gallery-next svg {
          width: 20px;
          height: 20px;
          stroke: var(--text-heading);
          fill: none;
          stroke-width: 2.5;
        }
        .gallery-dots {
          position: absolute;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          z-index: 5;
        }
        .gallery-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.6);
          border: none;
          cursor: pointer;
          transition: all var(--transition);
          padding: 0;
        }
        .gallery-dot.active {
          background: #fff;
          transform: scale(1.2);
          box-shadow: 0 0 6px rgba(0, 0, 0, 0.2);
        }
        .stats-section {
          background: var(--gradient);
          padding: 60px 0;
          position: relative;
          overflow: hidden;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 30px;
          text-align: center;
          position: relative;
          z-index: 1;
        }
        .stat-item .stat-number {
          font-size: 42px;
          font-weight: 900;
          color: #fff;
          letter-spacing: -1px;
          line-height: 1.1;
        }
        .stat-item .stat-label {
          font-size: 15px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.85);
          margin-top: 6px;
        }
        .testimonials-section {
          background: var(--bg);
        }
        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }
        .testimonial-card {
          background: var(--surface);
          border-radius: var(--radius-2xl);
          padding: 28px 24px;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
          transition: all var(--transition);
        }
        .testimonial-card:hover {
          box-shadow: var(--shadow-lg);
          transform: translateY(-3px);
        }
        .testimonial-quote {
          font-size: 22px;
          color: var(--primary);
          margin-bottom: 12px;
          font-weight: 700;
          line-height: 1;
        }
        .testimonial-text {
          font-size: 14px;
          color: var(--text-body);
          line-height: 1.7;
          margin-bottom: 16px;
          font-style: italic;
        }
        .testimonial-author {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .testimonial-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 700;
          font-size: 16px;
          flex-shrink: 0;
        }
        .testimonial-name {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-heading);
        }
        .testimonial-role {
          font-size: 13px;
          color: var(--text-light);
          font-weight: 500;
        }
        .cta-section {
          padding: 80px 0;
          background: var(--surface);
        }
        .cta-banner {
          background: var(--gradient);
          border-radius: var(--radius-2xl);
          padding: 50px 40px;
          text-align: center;
          position: relative;
          overflow: hidden;
          box-shadow: var(--shadow-xl);
        }
        .cta-banner h2 {
          font-size: 36px;
          font-weight: 900;
          color: #fff;
          letter-spacing: -0.5px;
          margin-bottom: 12px;
        }
        .cta-banner p {
          font-size: 17px;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 28px;
        }
        .cta-actions {
          display: flex;
          gap: 14px;
          justify-content: center;
          flex-wrap: wrap;
          position: relative;
          z-index: 1;
        }
        .btn-cta-white {
          padding: 14px 28px;
          font-size: 16px;
          font-weight: 700;
          color: var(--primary);
          background: #fff;
          border-radius: var(--radius-full);
          border: 2px solid transparent;
          transition: all var(--transition);
          text-decoration: none;
          display: inline-block;
        }
        .btn-cta-white:hover {
          background: var(--primary-light);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }
        .btn-cta-outline {
          padding: 14px 28px;
          font-size: 16px;
          font-weight: 700;
          color: #fff;
          background: transparent;
          border: 2px solid rgba(255, 255, 255, 0.6);
          border-radius: var(--radius-full);
          transition: all var(--transition);
          text-decoration: none;
          display: inline-block;
        }
        .btn-cta-outline:hover {
          border-color: #fff;
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }
        .footer {
          background: #0F172A;
          color: #94A3B8;
          padding: 60px 0 30px;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 40px;
          margin-bottom: 40px;
        }
        .footer-brand {
          font-size: 24px;
          font-weight: 900;
          color: #fff;
          letter-spacing: -0.5px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .footer-brand .logo-icon-sm {
          width: 32px;
          height: 32px;
          background: var(--gradient);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 800;
          font-size: 15px;
        }
        .footer-about {
          font-size: 14px;
          line-height: 1.7;
          max-width: 320px;
          margin-bottom: 16px;
        }
        .footer-email {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #CBD5E1;
          transition: color var(--transition);
        }
        .footer-email:hover {
          color: #fff;
        }
        .footer-email svg {
          width: 16px;
          height: 16px;
          stroke: currentColor;
          fill: none;
          stroke-width: 2;
        }
        .footer h4 {
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          margin-bottom: 16px;
        }
        .footer-links li {
          margin-bottom: 8px;
        }
        .footer-links a {
          font-size: 14px;
          color: #94A3B8;
          transition: color var(--transition);
        }
        .footer-links a:hover {
          color: #fff;
        }
        .footer-bottom {
          border-top: 1px solid #1E293B;
          padding-top: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          font-size: 13px;
        }
        .footer-bottom .footer-links-inline {
          display: flex;
          gap: 20px;
        }
        .footer-bottom .footer-links-inline a {
          color: #94A3B8;
          transition: color var(--transition);
        }
        .footer-bottom .footer-links-inline a:hover {
          color: #fff;
        }
        .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }
        @media (max-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1fr;
            gap: 40px;
            text-align: center;
          }
          .hero-subtext {
            margin-left: auto;
            margin-right: auto;
          }
          .hero-actions {
            justify-content: center;
          }
          .hero-trust {
            justify-content: center;
          }
          .hero-card {
            margin: 0 auto;
          }
          .hero-float-1 { left: 10px; }
          .hero-float-2 { right: 10px; }
        }
        @media (max-width: 768px) {
          .navbar-links {
            display: none;
          }
          .navbar-actions .btn-login-nav,
          .navbar-actions .btn-signup-nav {
            display: none;
          }
          .hamburger {
            display: flex;
          }
          .hero {
            padding: 110px 0 60px;
          }
          .hero-title {
            font-size: 36px;
            letter-spacing: -0.8px;
          }
          .hero-subtext {
            font-size: 16px;
          }
          .hero-actions {
            flex-direction: column;
            align-items: center;
          }
          .btn-primary,
          .btn-secondary {
            width: 100%;
            max-width: 320px;
            justify-content: center;
          }
          .hero-trust {
            gap: 16px;
            flex-direction: column;
            align-items: center;
          }
          .section {
            padding: 50px 0;
          }
          .section-title {
            font-size: 28px;
            letter-spacing: -0.5px;
          }
          .section-subtitle {
            font-size: 15px;
          }
          .batches-grid,
          .teachers-grid,
          .features-grid,
          .testimonials-grid {
            grid-template-columns: 1fr;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
          .stat-item .stat-number {
            font-size: 32px;
          }
          .cta-banner {
            padding: 36px 24px;
          }
          .cta-banner h2 {
            font-size: 28px;
          }
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }
          .footer-bottom {
            flex-direction: column;
            text-align: center;
          }
          .gallery-slide img {
            height: 300px;
          }
          .hero-float {
            display: none;
          }
          .hero-card-video {
            min-height: 140px;
            padding: 30px 16px;
          }
        }
        @media (max-width: 480px) {
          .container {
            padding: 0 16px;
          }
          .hero-title {
            font-size: 28px;
          }
          .hero-subtext {
            font-size: 15px;
          }
          .section-title {
            font-size: 24px;
          }
          .batch-thumb {
            height: 150px;
          }
          .stats-grid {
            gap: 16px;
          }
          .stat-item .stat-number {
            font-size: 26px;
          }
          .stat-item .stat-label {
            font-size: 13px;
          }
          .cta-banner h2 {
            font-size: 24px;
          }
          .cta-banner p {
            font-size: 15px;
          }
          .gallery-slide img {
            height: 220px;
          }
          .gallery-prev,
          .gallery-next {
            width: 36px;
            height: 36px;
          }
        }
      `}</style>

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <span className="toast-icon">{toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : toast.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
          {toast.message}
        </div>
      )}

      {/* Navbar */}
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container navbar-inner">
          <Link href="/" className="navbar-logo">
            <div className="logo-icon">L</div>
            <div>
              <span>LGIONRISE</span>
              <span className="logo-sub">Learn &amp; Grow</span>
            </div>
          </Link>
          <div className="navbar-links">
            <a href="#home" className="active">Home</a>
            <a href="#batches">Courses/Batches</a>
            <a href="#teachers">Teachers</a>
            <a href="#features">Features</a>
            <a href="#gallery">Gallery</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="navbar-actions">
            <Link href={CONFIG.LOGIN_URL} className="btn-login-nav">Login</Link>
            <Link href={CONFIG.REGISTER_URL} className="btn-signup-nav">Sign up</Link>
          </div>
          <button className="hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            <svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <a href="#home" onClick={() => setMobileMenuOpen(false)}>Home</a>
        <a href="#batches" onClick={() => setMobileMenuOpen(false)}>Courses/Batches</a>
        <a href="#teachers" onClick={() => setMobileMenuOpen(false)}>Teachers</a>
        <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
        <a href="#gallery" onClick={() => setMobileMenuOpen(false)}>Gallery</a>
        <a href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact</a>
        <div className="mobile-divider"></div>
        <Link href={CONFIG.LOGIN_URL} className="btn-mobile btn-mobile-login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
        <Link href={CONFIG.REGISTER_URL} className="btn-mobile btn-mobile-signup" onClick={() => setMobileMenuOpen(false)}>Sign up</Link>
      </div>

      {/* Hero */}
      <section className="hero" id="home">
        <div className="container hero-grid">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="pulse-dot"></span>
              India's Trusted Learning Platform
            </div>
            <h1 className="hero-title">
              Learn and Grow with<br />
              <span className="gradient-text">LGIONRISE</span>
            </h1>
            <p className="hero-subtext">
              Live classes, structured batches, regular tests, and 24/7 doubt support — all in one place.
              Join thousands of serious learners preparing for JEE, NEET, CBSE, SSC, UPSC, and more.
            </p>
            <div className="hero-actions">
              <a href="#batches" className="btn-primary">
                Explore Batches
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
              <Link href={CONFIG.LOGIN_URL} className="btn-secondary">
                Login to Learn
              </Link>
            </div>
            <div className="hero-trust">
              <div className="trust-item">
                <span className="trust-icon"><svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M8 10h8M8 14h5"/></svg></span>
                Live Classes
              </div>
              <div className="trust-item">
                <span className="trust-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></span>
                Recorded Lectures
              </div>
              <div className="trust-item">
                <span className="trust-icon"><svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg></span>
                Tests &amp; Practice
              </div>
              <div className="trust-item">
                <span className="trust-icon"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></span>
                Doubt Support
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card">
              <div className="hero-card-video">
                <span className="live-badge">LIVE</span>
                <div className="play-icon">▶</div>
              </div>
              <div className="hero-card-title">JEE Main 2026 — Live Physics Class</div>
              <div className="hero-card-sub">Dr. Rajesh Sharma • 2,340 students watching</div>
              <div className="hero-card-progress"><div className="hero-card-progress-bar"></div></div>
              <div className="hero-card-stats">
                <span className="hero-card-stat">
                  <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
                  2.3k online
                </span>
                <span className="hero-card-stat">
                  <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                  128 doubts
                </span>
                <span className="hero-card-stat">
                  <svg viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                  98% satisfaction
                </span>
              </div>
            </div>
            <div className="hero-float hero-float-1">
              <span className="float-icon green">📊</span>
              Weekly Test Rank: #12
            </div>
            <div className="hero-float hero-float-2">
              <span className="float-icon blue">✅</span>
              Doubt Resolved in 5 min
            </div>
            <div className="hero-float hero-float-3">
              <span className="float-icon yellow">⭐</span>
              4.9/5 Student Rating
            </div>
          </div>
        </div>
      </section>

      {/* Batches */}
      <section className="section batches-section" id="batches">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-tag">Featured Batches</span>
            <h2 className="section-title">Choose Your Learning Path</h2>
            <p className="section-subtitle">Handpicked batches by expert teachers with structured curriculum, regular tests, and complete support.</p>
          </div>
          <div className="batches-grid">
            {loadingBatches ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="batch-card" style={{ pointerEvents: 'none' }}>
                  <div className="skeleton" style={{ height: '180px', borderRadius: 0 }}></div>
                  <div className="batch-body">
                    <div className="skeleton" style={{ height: '20px', marginBottom: '8px' }}></div>
                    <div className="skeleton" style={{ height: '16px', marginBottom: '10px', width: '60%' }}></div>
                    <div className="skeleton" style={{ height: '14px', marginBottom: '14px', width: '80%' }}></div>
                    <div className="skeleton" style={{ height: '28px', marginBottom: '16px', width: '50%' }}></div>
                    <div className="skeleton" style={{ height: '40px' }}></div>
                  </div>
                </div>
              ))
            ) : batches.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-light)', fontSize: '16px', padding: '40px' }}>No batches available right now. Please check back soon.</p>
            ) : (
              batches.map((batch: any, index: number) => {
                const title = batch.title || batch.name || 'Untitled Batch';
                const teacher = batch.teacher_name || batch.teacher || batch.instructor || 'Expert Teacher';
                const language = batch.language || 'Hindi + English';
                const price = batch.price || batch.original_price || 9999;
                const discounted = batch.discounted_price || batch.sale_price || batch.price || 7999;
                const validity = batch.validity || batch.duration || '6 months';
                const status = batch.status || 'Active';
                const icon = batch.icon || '📚';
                const color = batch.color || 'linear-gradient(135deg,#4F46E5,#7C3AED)';
                const thumbnail = batch.thumbnail_url || batch.thumbnail || batch.image || null;
                const discountPercent = price > 0 ? Math.round(((price - discounted) / price) * 100) : 0;

                return (
                  <div key={batch.id || index} className="batch-card">
                    <div className="batch-thumb" style={{ background: color }}>
                      {thumbnail ? (
                        <img src={thumbnail} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <div className="batch-thumb-icon">{icon}</div>
                      )}
                      <span className="batch-lang" style={{ zIndex: 2 }}>{language}</span>
                      <span className="batch-status" style={{ zIndex: 2 }}>{status}</span>
                    </div>
                    <div className="batch-body">
                      <h3 className="batch-title">{title}</h3>
                      <p className="batch-teacher">👨‍🏫 {teacher}</p>
                      <div className="batch-meta">
                        <span><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> {validity}</span>
                        <span><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> {language}</span>
                      </div>
                      <div className="batch-price-row">
                        <span className="batch-price">₹{discounted.toLocaleString('en-IN')}</span>
                        {discountPercent > 0 && (
                          <>
                            <span className="batch-price-original">₹{price.toLocaleString('en-IN')}</span>
                            <span className="batch-discount">{discountPercent}% OFF</span>
                          </>
                        )}
                      </div>
                      <div className="batch-actions">
                        <button className="btn-view-details" onClick={() => handleShowBatchDetails(title, teacher, language, validity, price, discounted)}>
                          Details
                        </button>
                        <button className="btn-enroll" onClick={() => handleEnroll(title)}>
                          Enroll Now
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Teachers */}
      <section className="section teachers-section" id="teachers">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-tag">Our Teachers</span>
            <h2 className="section-title">Learn from the Best Educators</h2>
            <p className="section-subtitle">Experienced, passionate, and dedicated teachers committed to your success.</p>
          </div>
          <div className="teachers-grid">
            {MOCK_TEACHERS.map((teacher, index) => (
              <div key={index} className="teacher-card reveal">
                <div className="teacher-photo">
                  <img src={teacher.photo} alt={teacher.name} loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&size=200&background=4F46E5&color=fff&bold=true`; }} />
                  {teacher.verified && (
                    <span className="teacher-verified">
                      <svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                  )}
                </div>
                <h3 className="teacher-name">{teacher.name}</h3>
                <p className="teacher-subject">{teacher.subject}</p>
                <p className="teacher-exp">{teacher.experience}</p>
                <p className="teacher-bio">{teacher.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section features-section" id="features">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-tag">Why LGIONRISE</span>
            <h2 className="section-title">Everything You Need to Succeed</h2>
            <p className="section-subtitle">A complete learning ecosystem designed for serious aspirants.</p>
          </div>
          <div className="features-grid">
            {MOCK_FEATURES.map((feature, index) => (
              <div key={index} className="feature-card reveal">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="section gallery-section" id="gallery">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-tag">Campus &amp; Classes</span>
            <h2 className="section-title">Inside LGIONRISE</h2>
            <p className="section-subtitle">A glimpse of our learning environment, events, and student life.</p>
          </div>
          <div className="gallery-slider reveal">
            <div className="gallery-track" ref={galleryTrackRef} style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
              {galleryImages.map((src, index) => (
                <div key={index} className="gallery-slide">
                  <img src={src} alt={`Gallery image ${index + 1}`} loading="lazy" onError={(e) => { (e.target as HTMLImageElement).classList.add('hidden'); }} />
                </div>
              ))}
            </div>
            <button className="gallery-prev" onClick={() => { prevSlide(); resetAutoplay(); }} aria-label="Previous image">
              <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button className="gallery-next" onClick={() => { nextSlide(); resetAutoplay(); }} aria-label="Next image">
              <svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <div className="gallery-dots">
              {galleryImages.map((_, index) => (
                <button key={index} className={`gallery-dot ${index === currentSlide ? 'active' : ''}`} onClick={() => { goToSlide(index); resetAutoplay(); }} aria-label={`Go to image ${index + 1}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item reveal">
              <div className="stat-number" data-count="50000">0</div>
              <div className="stat-label">Active Students</div>
            </div>
            <div className="stat-item reveal">
              <div className="stat-number" data-count="200">0</div>
              <div className="stat-label">Expert Teachers</div>
            </div>
            <div className="stat-item reveal">
              <div className="stat-number" data-count="1500">0</div>
              <div className="stat-label">Live Classes</div>
            </div>
            <div className="stat-item reveal">
              <div className="stat-number" data-count="150">0</div>
              <div className="stat-label">Active Batches</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section testimonials-section" id="testimonials">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-tag">Student Stories</span>
            <h2 className="section-title">What Our Students Say</h2>
            <p className="section-subtitle">Real experiences from learners who achieved their goals with LGIONRISE.</p>
          </div>
          <div className="testimonials-grid">
            {MOCK_TESTIMONIALS.map((t, index) => (
              <div key={index} className="testimonial-card reveal">
                <div className="testimonial-quote">"</div>
                <p className="testimonial-text">"{t.quote}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.initials}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" id="contact">
        <div className="container">
          <div className="cta-banner reveal">
            <h2>Start Learning Today</h2>
            <p>Join 50,000+ students already learning with LGIONRISE. Your journey to success begins here.</p>
            <div className="cta-actions">
              <Link href={CONFIG.REGISTER_URL} className="btn-cta-white">Create Free Account</Link>
              <Link href={CONFIG.LOGIN_URL} className="btn-cta-outline">Login</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-brand">
                <span className="logo-icon-sm">L</span>
                LGIONRISE
              </div>
              <p className="footer-about">
                Learn and Grow — India's trusted edtech platform for live classes, structured batches,
                regular tests, and 24/7 doubt support. Empowering serious learners to achieve their dreams.
              </p>
              <a href="mailto:support@lgionrise.com" className="footer-email">
                <svg viewBox="0 0 24 24"><path d="M22 5a2 2 0 00-2-2H4a2 2 0 00-2 2v14a2 2 0 002 2h16a2 2 0 002-2z"/><path d="M2 5l10 9L22 5"/></svg>
                support@lgionrise.com
              </a>
            </div>
            <div>
              <h4>Quick Links</h4>
              <ul className="footer-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#batches">Courses/Batches</a></li>
                <li><a href="#teachers">Teachers</a></li>
                <li><a href="#features">Features</a></li>
              </ul>
            </div>
            <div>
              <h4>Subjects</h4>
              <ul className="footer-links">
                <li><a href="#batches">JEE Main &amp; Advanced</a></li>
                <li><a href="#batches">NEET UG</a></li>
                <li><a href="#batches">CBSE Class 6-12</a></li>
                <li><a href="#batches">SSC / UPSC</a></li>
              </ul>
            </div>
            <div>
              <h4>Support</h4>
              <ul className="footer-links">
                <li><a href="mailto:support@lgionrise.com">Help Center</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>&copy; 2026 LGIONRISE (Learn and Grow). All rights reserved.</span>
            <div className="footer-links-inline">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
