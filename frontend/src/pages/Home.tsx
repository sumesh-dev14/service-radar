import { useState } from "react";
import { useTheme } from "../providers/ThemeProvider";

// ─── TYPES ───────────────────────────────────────────────────────────────────
type Flow = "customer" | "provider";

// ─── DATA ────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { icon: "🧹", name: "Cleaning",    count: 87 },
  { icon: "🔧", name: "Plumbing",    count: 54 },
  { icon: "📚", name: "Tutoring",    count: 72 },
  { icon: "⚡", name: "Electrical",  count: 41 },
  { icon: "🌿", name: "Gardening",   count: 63 },
  { icon: "🎨", name: "Painting",    count: 38 },
  { icon: "🚗", name: "Auto Repair", count: 29 },
  { icon: "💆", name: "Wellness",    count: 55 },
  { icon: "📸", name: "Photography", count: 44 },
  { icon: "🍳", name: "Cooking",     count: 31 },
];

const CUSTOMER_STEPS = [
  { num: "01", title: "Search",  desc: "Browse providers by category, location, and ratings." },
  { num: "02", title: "Compare", desc: "View profiles, rates, reviews & availability status." },
  { num: "03", title: "Book",    desc: "Pick a date & time — get instant confirmation." },
  { num: "04", title: "Review",  desc: "Rate your experience after the service is complete." },
];

const PROVIDER_STEPS = [
  { num: "01", title: "Create Profile", desc: "Add your bio, category, hourly rate & location." },
  { num: "02", title: "Get Bookings",   desc: "Accept requests and manage your schedule easily." },
  { num: "03", title: "Earn & Grow",    desc: "Build your reputation through reviews & ratings." },
];

const TRUST = [
  { icon: "✅", title: "Verified Providers",  desc: "Every provider is identity-checked and reviewed before going live." },
  { icon: "🔒", title: "Secure Payments",      desc: "End-to-end encrypted transactions. Pay only when satisfied." },
  { icon: "⭐", title: "Ratings & Reviews",    desc: "Transparent reviews from real customers keep quality high." },
  { icon: "⚡", title: "Instant Booking",      desc: "Confirm your service in seconds — no back-and-forth needed." },
];

const TESTIMONIALS = [
  {
    type: "customer",
    name: "Priya M.",
    role: "Homeowner",
    avatar: "P",
    text: "Found a cleaner within 10 minutes. Booked, confirmed, and she was at my door the next morning. Absolutely seamless!",
    rating: 5,
  },
  {
    type: "provider",
    name: "James K.",
    role: "Plumber · 4.9 ⭐",
    avatar: "J",
    text: "My bookings doubled in the first month. The platform handles everything — I just show up and do the work.",
    rating: 5,
  },
  {
    type: "customer",
    name: "Aisha R.",
    role: "Parent",
    avatar: "A",
    text: "My daughter's math grades improved in 3 weeks. The tutor I found here was professional, patient and affordable.",
    rating: 5,
  },
  {
    type: "provider",
    name: "Chen L.",
    role: "Gardener · 4.8 ⭐",
    avatar: "C",
    text: "I love that customers can see my reviews before booking. It's built trust I could not have gotten on my own.",
    rating: 5,
  },
];

const FAQS = [
  { q: "Is ServiceRadar free to use?",            a: "Signing up and browsing is completely free for customers. Providers pay a small commission only when a booking is completed." },
  { q: "How are providers verified?",             a: "All providers go through an ID check, category skill review, and must maintain a minimum rating to stay active on the platform." },
  { q: "Can I cancel a booking?",                 a: "Yes. Customers can cancel up to 2 hours before the scheduled time from their bookings dashboard." },
  { q: "How does location search work?",          a: "We use your device's geolocation to find providers within your chosen radius — from 1 km up to 50 km." },
  { q: "What payment methods are accepted?",      a: "We accept all major credit/debit cards and UPI. Payments are held securely until the service is marked complete." },
  { q: "How do I become a provider?",             a: "Sign up, create your profile with your category and hourly rate, and you can start receiving bookings within 24 hours." },
];

const NAV_ITEMS = [
  { label: "How It Works", href: "#how" },
  { label: "Categories", href: "#categories" },
  { label: "Trust & Safety", href: "#trust" },
  { label: "Stories", href: "#stories" },
];

// ─── STYLES ──────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --primary:     #d04f99;
    --accent:      #fbe2a7;
    --secondary:   #8acfd1;
    --bg:          #f6e6ee;
    --card:        #fdedc9;
    --fg:          #5b5b5b;
    --destructive: #f96f70;
    --border:      #d04f99;
    --primary10:   rgba(208,79,153,0.10);
    --primary20:   rgba(208,79,153,0.20);
  }
  .dark {
    --primary:     #fbe2a7;
    --accent:      #c67b96;
    --secondary:   #e4a2b1;
    --bg:          #12242e;
    --card:        #1c2e38;
    --fg:          #f3e3ea;
    --destructive: #e35ea4;
    --border:      #fbe2a7;
    --primary10:   rgba(251,226,167,0.10);
    --primary20:   rgba(251,226,167,0.20);
  }

  * { margin:0; padding:0; box-sizing:border-box; }
  html { scroll-behavior:smooth; }
  body {
    background: var(--bg);
    color: var(--fg);
    font-family: 'DM Sans', sans-serif;
    line-height: 1.65;
    transition: background 0.3s, color 0.3s;
  }

  .nav {
    position: sticky; top: 0; z-index: 100;
    background: var(--bg);
    border-bottom: 1px solid var(--primary20);
    backdrop-filter: blur(12px);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 6vw;
    height: 68px;
  }
  .nav-logo { font-family:'Syne',sans-serif; font-size:1.35rem; font-weight:800; color:var(--primary); letter-spacing:-0.5px; display:flex; align-items:center; gap:8px; }
  .nav-logo span { color:var(--fg); }
  .nav-links { display:flex; gap:28px; list-style:none; }
  .nav-links a { color:var(--fg); text-decoration:none; font-size:0.9rem; font-weight:500; transition:color 0.2s; }
  .nav-links a:hover { color:var(--primary); }
  .nav-actions { display:flex; gap:10px; align-items:center; }
  .nav-toggle { display:none; align-items:center; justify-content:center; width:40px; height:40px; border-radius:10px; border:1.5px solid var(--primary20); background:var(--primary10); color:var(--primary); cursor:pointer; font-size:1.1rem; }
  .btn { display:inline-flex; align-items:center; justify-content:center; gap:6px; font-family:'DM Sans',sans-serif; font-weight:500; border-radius:10px; border:none; cursor:pointer; transition:all 0.2s; text-decoration:none; }
  .btn-ghost { background:transparent; color:var(--fg); padding:9px 18px; font-size:0.9rem; border:1.5px solid var(--primary20); }
  .btn-ghost:hover { background:var(--primary10); color:var(--primary); }
  .btn-primary { background:var(--primary); color:#fff; padding:10px 22px; font-size:0.9rem; box-shadow:0 4px 15px var(--primary20); }
  .btn-primary:hover { filter:brightness(1.1); transform:translateY(-1px); }
  .btn-lg { padding:14px 32px; font-size:1rem; border-radius:12px; }
  .btn-outline { background:transparent; color:var(--primary); border:2px solid var(--primary); padding:12px 28px; font-size:1rem; border-radius:12px; }
  .btn-outline:hover { background:var(--primary); color:#fff; }
  .btn-accent { background:var(--accent); color:#5b5b5b; padding:14px 32px; font-size:1rem; border-radius:12px; font-weight:600; }
  .btn-accent:hover { filter:brightness(0.96); transform:translateY(-1px); }
  .theme-btn { background:var(--primary10); border:1.5px solid var(--primary20); color:var(--primary); border-radius:8px; padding:8px 12px; cursor:pointer; font-size:1rem; }
  .mobile-menu { display:none; position:sticky; top:68px; z-index:90; background:var(--bg); border-bottom:1px solid var(--primary20); padding:14px 6vw 20px; }
  .mobile-links { list-style:none; display:flex; flex-direction:column; gap:10px; }
  .mobile-link { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-radius:10px; border:1px solid var(--primary10); text-decoration:none; color:var(--fg); font-weight:600; font-size:0.95rem; background:var(--card); }
  .mobile-link span { color:var(--primary); }

  .hero {
    padding: 90px 6vw 80px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;
    max-width: 1200px; margin: 0 auto;
  }
  .hero-eyebrow { display:inline-flex; align-items:center; gap:8px; background:var(--primary10); border:1px solid var(--primary20); color:var(--primary); font-size:0.8rem; font-weight:600; letter-spacing:1px; text-transform:uppercase; padding:6px 14px; border-radius:20px; margin-bottom:20px; }
  .hero-title { font-family:'Syne',sans-serif; font-size:clamp(2.2rem,4vw,3.4rem); font-weight:800; color:var(--fg); line-height:1.15; margin-bottom:18px; }
  .hero-title em { color:var(--primary); font-style:normal; }
  .hero-sub { font-size:1.05rem; color:var(--fg); opacity:0.75; max-width:480px; margin-bottom:36px; }
  .hero-actions { display:flex; gap:14px; flex-wrap:wrap; margin-bottom:40px; }
  .hero-stats { display:flex; gap:32px; flex-wrap:wrap; }
  .hero-stat-val { font-family:'Syne',sans-serif; font-size:1.6rem; font-weight:800; color:var(--primary); }
  .hero-stat-lbl { font-size:0.78rem; color:var(--fg); opacity:0.6; font-weight:500; }
  .hero-visual { position:relative; display:flex; align-items:center; justify-content:center; }
  .hero-card-stack { position:relative; width:340px; height:380px; }
  .hero-card {
    position:absolute; border-radius:20px; padding:22px;
    background:var(--card); border:1px solid var(--primary20);
    box-shadow: 0 8px 32px rgba(208,79,153,0.12);
  }
  .hc1 { width:280px; top:0; left:0; z-index:3; }
  .hc2 { width:250px; top:60px; right:0; z-index:2; background:var(--bg); }
  .hc3 { width:220px; bottom:0; left:20px; z-index:1; opacity:0.7; }
  .provider-row { display:flex; align-items:center; gap:12px; margin-bottom:14px; }
  .avatar { width:42px; height:42px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.9rem; color:#fff; flex-shrink:0; }
  .av-pink { background:var(--primary); }
  .av-cyan { background:var(--secondary); color:#333; }
  .av-gold { background:var(--accent); color:#333; }
  .provider-name { font-weight:600; font-size:0.9rem; color:var(--fg); }
  .provider-role { font-size:0.75rem; color:var(--fg); opacity:0.6; }
  .badge { display:inline-flex; align-items:center; gap:4px; font-size:0.7rem; font-weight:600; padding:3px 9px; border-radius:20px; }
  .badge-green { background:rgba(0,200,130,0.15); color:#00a86b; }
  .badge-pink { background:var(--primary10); color:var(--primary); }
  .badge-gold { background:rgba(251,226,167,0.5); color:#9a6c00; }
  .rate { font-family:'Syne',sans-serif; font-weight:700; color:var(--primary); font-size:1.1rem; }
  .booking-row { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--primary10); }
  .booking-row:last-child { border-bottom:none; }

  .section { padding: 80px 6vw; max-width:1200px; margin:0 auto; }
  .section-full { padding: 80px 6vw; }
  .section-tag { display:inline-block; font-size:0.75rem; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:var(--primary); margin-bottom:12px; }
  .section-title { font-family:'Syne',sans-serif; font-size:clamp(1.8rem,3vw,2.5rem); font-weight:800; color:var(--fg); line-height:1.2; margin-bottom:14px; }
  .section-sub { font-size:1rem; color:var(--fg); opacity:0.65; max-width:560px; }
  .section-header { margin-bottom:50px; }
  .text-center { text-align:center; }
  .mx-auto { margin-left:auto; margin-right:auto; }

  .flows { background: linear-gradient(135deg, var(--primary10) 0%, transparent 100%); border-top:1px solid var(--primary10); border-bottom:1px solid var(--primary10); }
  .flows-grid { display:grid; grid-template-columns:1fr 1fr; gap:0; max-width:1200px; margin:0 auto; }
  .flow-card { padding:60px 8vw; position:relative; transition:background 0.3s; }
  .flow-card:first-child { border-right:1px solid var(--primary20); }
  .flow-card:hover { background:var(--primary10); }
  .flow-icon { font-size:2.8rem; margin-bottom:18px; }
  .flow-title { font-family:'Syne',sans-serif; font-size:1.7rem; font-weight:800; color:var(--fg); margin-bottom:12px; }
  .flow-desc { color:var(--fg); opacity:0.7; margin-bottom:28px; font-size:0.95rem; }
  .flow-features { list-style:none; margin-bottom:32px; display:flex; flex-direction:column; gap:10px; }
  .flow-features li { display:flex; align-items:center; gap:10px; font-size:0.9rem; color:var(--fg); }
  .flow-features li::before { content:'✓'; color:var(--primary); font-weight:700; }

  .steps-tabs { display:flex; gap:0; background:var(--card); border-radius:12px; padding:4px; width:fit-content; margin:0 auto 50px; border:1px solid var(--primary20); }
  .steps-tab { padding:10px 28px; border-radius:9px; font-weight:600; font-size:0.9rem; cursor:pointer; border:none; background:transparent; color:var(--fg); opacity:0.6; transition:all 0.2s; }
  .steps-tab.active { background:var(--primary); color:#fff; opacity:1; }
  .steps-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:24px; }
  .step-card { background:var(--card); border-radius:16px; padding:28px 24px; border:1px solid var(--primary10); position:relative; overflow:hidden; transition:transform 0.2s, box-shadow 0.2s; }
  .step-card:hover { transform:translateY(-4px); box-shadow:0 12px 32px var(--primary20); }
  .step-num { font-family:'Syne',sans-serif; font-size:3rem; font-weight:800; color:var(--primary); opacity:0.15; position:absolute; top:12px; right:18px; line-height:1; }
  .step-icon { font-size:1.8rem; margin-bottom:14px; }
  .step-title { font-family:'Syne',sans-serif; font-size:1.05rem; font-weight:700; color:var(--fg); margin-bottom:8px; }
  .step-desc { font-size:0.88rem; color:var(--fg); opacity:0.65; }

  .cats-bg { background:var(--card); }
  .cats-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:16px; }
  .cat-card { background:var(--bg); border:1px solid var(--primary10); border-radius:14px; padding:22px 16px; text-align:center; cursor:pointer; transition:all 0.2s; }
  .cat-card:hover { border-color:var(--primary); background:var(--primary10); transform:translateY(-3px); box-shadow:0 8px 24px var(--primary20); }
  .cat-icon { font-size:2rem; margin-bottom:10px; }
  .cat-name { font-weight:600; font-size:0.88rem; color:var(--fg); margin-bottom:4px; }
  .cat-count { font-size:0.75rem; color:var(--fg); opacity:0.5; }

  .trust-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:24px; }
  .trust-card { background:var(--card); border-radius:16px; padding:28px; border:1px solid var(--primary10); display:flex; gap:18px; align-items:flex-start; transition:transform 0.2s; }
  .trust-card:hover { transform:translateY(-3px); }
  .trust-icon { font-size:2rem; flex-shrink:0; }
  .trust-title { font-family:'Syne',sans-serif; font-weight:700; font-size:1rem; color:var(--fg); margin-bottom:6px; }
  .trust-desc { font-size:0.88rem; color:var(--fg); opacity:0.65; }

  .stats-bg { background: linear-gradient(135deg, var(--primary) 0%, #b03688 100%); }
  .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:0; max-width:1000px; margin:0 auto; text-align:center; }
  .stat-item { padding:50px 20px; border-right:1px solid rgba(255,255,255,0.15); }
  .stat-item:last-child { border-right:none; }
  .stat-val { font-family:'Syne',sans-serif; font-size:2.8rem; font-weight:800; color:#fff; margin-bottom:6px; }
  .stat-lbl { font-size:0.85rem; color:rgba(255,255,255,0.75); font-weight:500; }

  .testi-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:24px; }
  .testi-card { background:var(--card); border-radius:16px; padding:28px; border:1px solid var(--primary10); position:relative; }
  .testi-type { position:absolute; top:20px; right:20px; }
  .testi-quote { font-size:2rem; color:var(--primary); opacity:0.3; font-family:serif; line-height:1; margin-bottom:12px; }
  .testi-text { font-size:0.95rem; color:var(--fg); opacity:0.8; margin-bottom:20px; font-style:italic; }
  .testi-author { display:flex; align-items:center; gap:12px; }
  .testi-name { font-weight:600; font-size:0.9rem; color:var(--fg); }
  .testi-role { font-size:0.78rem; color:var(--fg); opacity:0.55; }

  .faq-list { max-width:720px; margin:0 auto; display:flex; flex-direction:column; gap:12px; }
  .faq-item { background:var(--card); border-radius:12px; border:1px solid var(--primary10); overflow:hidden; }
  .faq-q { display:flex; justify-content:space-between; align-items:center; padding:18px 22px; cursor:pointer; font-weight:500; font-size:0.95rem; color:var(--fg); user-select:none; }
  .faq-q:hover { color:var(--primary); }
  .faq-chevron { font-size:0.8rem; color:var(--primary); transition:transform 0.2s; }
  .faq-chevron.open { transform:rotate(180deg); }
  .faq-a { padding:0 22px 18px; font-size:0.9rem; color:var(--fg); opacity:0.7; line-height:1.6; }

  .cta-bg { background:var(--card); border-top:1px solid var(--primary10); }
  .cta-inner { max-width:700px; margin:0 auto; text-align:center; padding:90px 6vw; }
  .cta-title { font-family:'Syne',sans-serif; font-size:clamp(2rem,4vw,3rem); font-weight:800; color:var(--fg); margin-bottom:16px; }
  .cta-title em { color:var(--primary); font-style:normal; }
  .cta-sub { font-size:1rem; color:var(--fg); opacity:0.65; margin-bottom:40px; }
  .cta-btns { display:flex; gap:16px; justify-content:center; flex-wrap:wrap; }

  .footer { background:var(--fg); color:var(--bg); padding:40px 6vw 24px; }
  .footer-top { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:20px; margin-bottom:28px; padding-bottom:28px; border-bottom:1px solid rgba(255,255,255,0.12); }
  .footer-logo { font-family:'Syne',sans-serif; font-size:1.2rem; font-weight:800; }
  .footer-links { display:flex; gap:24px; flex-wrap:wrap; }
  .footer-links a { color:rgba(255,255,255,0.6); text-decoration:none; font-size:0.85rem; transition:color 0.2s; }
  .footer-links a:hover { color:#fff; }
  .footer-bottom { display:flex; justify-content:space-between; align-items:center; font-size:0.8rem; opacity:0.45; flex-wrap:wrap; gap:8px; }

  @media (max-width:900px) {
    .hero { grid-template-columns:1fr; }
    .hero-visual { display:none; }
    .flows-grid { grid-template-columns:1fr; }
    .flow-card:first-child { border-right:none; border-bottom:1px solid var(--primary20); }
    .cats-grid { grid-template-columns:repeat(2,1fr); }
    .trust-grid { grid-template-columns:1fr; }
    .stats-grid { grid-template-columns:repeat(2,1fr); }
    .testi-grid { grid-template-columns:1fr; }
    .nav-links { display:none; }
    .nav-toggle { display:inline-flex; }
    .mobile-menu { display:block; }
  }

  @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
  .fade-up { animation: fadeUp 0.6s ease both; }
  .delay-1 { animation-delay:0.1s; }
  .delay-2 { animation-delay:0.2s; }
  .delay-3 { animation-delay:0.3s; }
`;

export default function HomePage() {
  const { theme, toggleTheme } = useTheme();
  const [flow, setFlow] = useState<Flow>("customer");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDark = theme === "dark";

  return (
    <div style={{ minHeight: "100vh" }}>
      <style>{css}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo">
          📡 <span>Service</span>Radar
        </div>
        <ul className="nav-links">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}><a href={item.href}>{item.label}</a></li>
          ))}
        </ul>
        <div className="nav-actions">
          <button className="theme-btn" onClick={toggleTheme} title="Toggle theme">
            {isDark ? "☀️" : "🌙"}
          </button>
          <a href="/login"  className="btn btn-ghost">Log In</a>
          <a href="/register" className="btn btn-primary">Sign Up</a>
          <button
            className="nav-toggle"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </nav>
      {mobileOpen && (
        <div className="mobile-menu" id="mobile-menu">
          <ul className="mobile-links">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <a
                  className="mobile-link"
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                  <span>→</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* HERO */}
      <div className="section hero">
        <div>
          <div className="hero-eyebrow fade-up">📡 The Service Marketplace</div>
          <h1 className="hero-title fade-up delay-1">
            Find <em>Trusted</em> Service<br />Providers Near You
          </h1>
          <p className="hero-sub fade-up delay-2">
            ServiceRadar connects customers with verified local professionals — from cleaning and plumbing to tutoring and wellness. Book in seconds.
          </p>
          <div className="hero-actions fade-up delay-3">
            <a href="/register?role=customer" className="btn btn-primary btn-lg">🔍 Find a Service</a>
            <a href="/register?role=provider" className="btn btn-outline">💼 Offer Services</a>
          </div>
          <div className="hero-stats fade-up delay-3">
            {[["500+", "Active Providers"],["10K+","Bookings Done"],["4.8★","Avg Rating"],["95%","Satisfaction"]].map(([v,l]) => (
              <div key={l}>
                <div className="hero-stat-val">{v}</div>
                <div className="hero-stat-lbl">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-card-stack">
            <div className="hero-card hc1">
              <div className="provider-row">
                <div className="avatar av-pink">S</div>
                <div>
                  <div className="provider-name">Sarah Chen</div>
                  <div className="provider-role">Professional Cleaner</div>
                </div>
              </div>
              <div style={{display:"flex",gap:"8px",marginBottom:"12px",flexWrap:"wrap"}}>
                <span className="badge badge-green">✓ Verified</span>
                <span className="badge badge-pink">⭐ 4.9</span>
                <span className="badge badge-gold">📍 2 km away</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span className="rate">₹350 / hr</span>
                <button className="btn btn-primary" style={{padding:"7px 16px",fontSize:"0.82rem"}}>Book Now</button>
              </div>
            </div>
            <div className="hero-card hc2">
              <div style={{fontSize:"0.7rem",fontWeight:700,color:"var(--primary)",marginBottom:"10px",textTransform:"uppercase",letterSpacing:"1px"}}>Recent Bookings</div>
              {[
                {name:"Home Cleaning",status:"✓ Completed",cl:"badge-green"},
                {name:"Plumbing Fix", status:"⏳ Pending",  cl:"badge-gold"},
                {name:"Math Tutor",   status:"✅ Confirmed",cl:"badge-green"},
              ].map(b=>(
                <div className="booking-row" key={b.name}>
                  <span style={{fontSize:"0.82rem",fontWeight:500,color:"var(--fg)"}}>{b.name}</span>
                  <span className={`badge ${b.cl}`}>{b.status}</span>
                </div>
              ))}
            </div>
            <div className="hero-card hc3" style={{display:"flex",alignItems:"center",gap:"12px"}}>
              <div style={{fontSize:"1.5rem"}}>⭐</div>
              <div>
                <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"1.4rem",color:"var(--primary)"}}>4.8 / 5</div>
                <div style={{fontSize:"0.72rem",opacity:0.6}}>Based on 2,400+ reviews</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TWO FLOWS */}
      <div className="section-full flows" id="flows">
        <div className="flows-grid">
          <div className="flow-card">
            <div className="flow-icon">🛒</div>
            <div className="flow-title">I Need a Service</div>
            <p className="flow-desc">Find the perfect professional for any task — browse, compare, and book in minutes.</p>
            <ul className="flow-features">
              <li>Search by category, location & rating</li>
              <li>View profiles, hourly rates & reviews</li>
              <li>Book with instant confirmation</li>
              <li>Manage & cancel bookings easily</li>
            </ul>
            <a href="/register?role=customer" className="btn btn-primary btn-lg">Get Started as Customer →</a>
          </div>
          <div className="flow-card">
            <div className="flow-icon">💼</div>
            <div className="flow-title">I Offer Services</div>
            <p className="flow-desc">Turn your skills into income. Reach hundreds of customers in your area, effortlessly.</p>
            <ul className="flow-features">
              <li>Create your profile in minutes</li>
              <li>Accept or decline booking requests</li>
              <li>Set your own hourly rate</li>
              <li>Build reputation with reviews</li>
            </ul>
            <a href="/register?role=provider" className="btn btn-accent btn-lg">Start Earning →</a>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="section" id="how">
        <div className="section-header text-center">
          <span className="section-tag">Process</span>
          <h2 className="section-title">How ServiceRadar Works</h2>
          <p className="section-sub mx-auto">Simple steps, whether you are looking for help or ready to offer your skills.</p>
        </div>
        <div className="steps-tabs">
          <button className={`steps-tab${flow==="customer"?" active":""}`} onClick={()=>setFlow("customer")}>For Customers</button>
          <button className={`steps-tab${flow==="provider"?" active":""}`} onClick={()=>setFlow("provider")}>For Providers</button>
        </div>
        <div className="steps-grid">
          {(flow==="customer" ? CUSTOMER_STEPS : PROVIDER_STEPS).map((s,i) => (
            <div className="step-card" key={s.num}>
              <span className="step-num">{s.num}</span>
              <div className="step-icon">{["🔍","👀","📅","⭐","🧑‍💼","📬","💰"][i]}</div>
              <div className="step-title">{s.title}</div>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
      <div className="section-full cats-bg" id="categories">
        <div className="section" style={{paddingTop:0,paddingBottom:0}}>
          <div className="section-header text-center">
            <span className="section-tag">Browse</span>
            <h2 className="section-title">Popular Service Categories</h2>
            <p className="section-sub mx-auto">Over 20 categories with hundreds of verified professionals ready to help.</p>
          </div>
          <div className="cats-grid">
            {CATEGORIES.map(c => (
              <div className="cat-card" key={c.name}>
                <div className="cat-icon">{c.icon}</div>
                <div className="cat-name">{c.name}</div>
                <div className="cat-count">{c.count} providers</div>
              </div>
            ))}
          </div>
          <div style={{textAlign:"center",marginTop:"36px"}}>
            <a href="/categories" className="btn btn-outline">View All 20+ Categories →</a>
          </div>
        </div>
      </div>

      {/* TRUST */}
      <div className="section" id="trust">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"60px",alignItems:"center"}}>
          <div>
            <span className="section-tag">Why Us</span>
            <h2 className="section-title">Built on Trust,<br />Delivered with Care</h2>
            <p className="section-sub" style={{marginBottom:"32px"}}>Every interaction on ServiceRadar is backed by a system designed to protect both customers and providers.</p>
            <a href="/about" className="btn btn-primary btn-lg">Learn More About Us →</a>
          </div>
          <div className="trust-grid">
            {TRUST.map(t => (
              <div className="trust-card" key={t.title}>
                <div className="trust-icon">{t.icon}</div>
                <div>
                  <div className="trust-title">{t.title}</div>
                  <p className="trust-desc">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="section-full stats-bg">
        <div className="stats-grid">
          {[
            ["500+", "Active Providers"],
            ["10,000+","Services Completed"],
            ["4.8 ★","Average Rating"],
            ["95%+","Customer Satisfaction"],
          ].map(([v,l]) => (
            <div className="stat-item" key={l}>
              <div className="stat-val">{v}</div>
              <div className="stat-lbl">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div className="section" id="stories">
        <div className="section-header text-center">
          <span className="section-tag">Stories</span>
          <h2 className="section-title">Real People, Real Results</h2>
          <p className="section-sub mx-auto">Hear from customers who found great help — and providers who grew their business.</p>
        </div>
        <div className="testi-grid">
          {TESTIMONIALS.map(t => (
            <div className="testi-card" key={t.name}>
              <div className="testi-type">
                <span className={`badge ${t.type==="customer"?"badge-pink":"badge-gold"}`}>
                  {t.type==="customer"?"Customer":"Provider"}
                </span>
              </div>
              <div className="testi-quote">"</div>
              <p className="testi-text">{t.text}</p>
              <div className="testi-author">
                <div className={`avatar ${t.type==="customer"?"av-pink":"av-gold"}`}>{t.avatar}</div>
                <div>
                  <div className="testi-name">{t.name}</div>
                  <div className="testi-role">{t.role}</div>
                </div>
                <div style={{marginLeft:"auto"}}>{"⭐".repeat(t.rating)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="section-full" style={{background:"var(--card)"}}>
        <div className="section" style={{paddingTop:0,paddingBottom:0}}>
          <div className="section-header text-center">
            <span className="section-tag">FAQ</span>
            <h2 className="section-title">Common Questions</h2>
          </div>
          <div className="faq-list">
            {FAQS.map((f,i) => (
              <div className="faq-item" key={i}>
                <div className="faq-q" onClick={() => setOpenFaq(openFaq===i ? null : i)}>
                  {f.q}
                  <span className={`faq-chevron${openFaq===i?" open":""}`}>▼</span>
                </div>
                {openFaq===i && <div className="faq-a">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FINAL CTA */}
      <div className="cta-bg">
        <div className="cta-inner">
          <h2 className="cta-title">Ready to Get <em>Started</em>?</h2>
          <p className="cta-sub">Join thousands of customers and providers already using ServiceRadar to connect, book, and grow.</p>
          <div className="cta-btns">
            <a href="/register?role=customer" className="btn btn-primary btn-lg">🔍 Find a Service</a>
            <a href="/register?role=provider" className="btn btn-accent btn-lg">💼 Become a Provider</a>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-logo">📡 ServiceRadar</div>
          <div className="footer-links">
            {["About","How It Works","Categories","For Providers","Pricing","Blog","Support","Privacy","Terms"].map(l => (
              <a href="#" key={l}>{l}</a>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2025 ServiceRadar. All rights reserved.</span>
          <span>Made with ❤️ for local communities</span>
        </div>
      </footer>
    </div>
  );
}
