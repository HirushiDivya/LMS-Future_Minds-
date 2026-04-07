import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSignInAlt,
  FaUserPlus,
  FaQuoteLeft,
  FaGraduationCap,
  FaShieldAlt,
  FaMobileAlt,
  FaLinkedin,
  FaTwitter,
  FaGithub,
  FaFacebook,
  FaYoutube,
  FaInstagram,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";
import "./Homepge.css";

//before login page
/*section1*/
const sections = [
  {
    title: "Video Lessons",
    desc: "Access uploaded and YouTube embedded learning content.",
    img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=500",
  },
  {
    title: "Live Classes",
    desc: "Join interactive Zoom meetings for live learning.",
    img: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?q=80&w=500",
  },
  {
    title: "Smart Quizzes",
    desc: "Attempt MCQ exams and get instant auto-evaluated results.",
    img: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=500&auto=format&fit=crop",
  },
  {
    title: "Secure Payments",
    desc: "Easy online payments and manual bank slip upload options.",
    img: "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?q=80&w=500",
  },
  {
    title: "Progress Monitoring",
    desc: "Track your course completion and status in real-time.",
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=500",
  },
  {
    title: "Expert Support",
    desc: "Full administrative control to ensure a smooth learning experience.",
    img: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=500",
  },
];

// section 3
const testimonials = [
  {
    name: "Amali Perera",
    review:
      "The smart quizzes helped me evaluate my knowledge instantly. Great platform!",
    role: "Student",
  },
  {
    name: "Saman Kumara",
    review:
      "Highly recommend for anyone looking for quality IT courses in Sri Lanka.",
    role: "Developer",
  },
  {
    name: "Nimal Silva",
    review:
      "The video lessons are very clear and easy to follow even for beginners.",
    role: "Student",
  },
  {
    name: "Priyani Alwis",
    review: "The progress monitoring feature keeps me motivated every day!",
    role: "Graphic Designer",
  },
  {
    name: "Kasun Kalhara",
    review: "Secure payments and instant access to courses. Best LMS in SL.",
    role: "Undergraduate",
  },
];

// section 4
const stats = [
  { label: "Active Students", value: "5,000+" },
  { label: "Expert Instructors", value: "150+" },
  { label: "Courses Available", value: "300+" },
  { label: "Success Rate", value: "98%" },
];

// section  5
const featuredCourses = [
  {
    title: "Advanced Pure Mathematics",
    price: "LKR 4,500",
    rating: "4.9",
    students: "1.5k",
    img: "https://images.unsplash.com/photo-1632571401005-458e9d244591?q=80&w=500",
  },
  {
    title: "Modern Quantum Physics",
    price: "LKR 5,200",
    rating: "4.8",
    students: "920",
    img: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=500",
  },
  {
    title: "Full-Stack Web Development",
    price: "LKR 12,500",
    rating: "5.0",
    students: "2.8k",
    img: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=500",
  },
];
// section 6
const journeySteps = [
  {
    step: "01",
    title: "Create Account",
    desc: "Sign up with your basic details to get started.",
    icon: "👤",
  },
  {
    step: "02",
    title: "Enroll Course",
    desc: "Choose from 300+ expert-led professional courses.",
    icon: "📚",
  },
  {
    step: "03",
    title: "Watch & Practice",
    desc: "Learn at your own pace with hands-on projects.",
    icon: "💻",
  },
  {
    step: "04",
    title: "Build Projects",
    desc: "Apply your knowledge by building real-world software and portfolios.",
    icon: "🚀",
  },
];

//section 7 instructors
const instructors = [
  {
    name: "Prof. Rohana Silva",
    role: "Expert Mathematics Lecturer",
    bio: "Specializing in Pure & Applied Mathematics with over 15 years of academic excellence.",
    img: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=500",
  },
  {
    name: "Dr. Sandali Perera",
    role: "Senior Science Researcher",
    bio: "Ph.D. in Physics, focused on making complex scientific concepts easy for students.",
    img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=500",
  },
  {
    name: "Mr. Amal Bandara",
    role: "Lead Tech Architect",
    bio: "Industry professional teaching modern software engineering and cloud technologies.",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=500",
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      {/* Top-right buttons */}

      <div className="top-buttons">
        <button className="btn-signin" onClick={() => navigate("/login")}>
          <FaSignInAlt /> Sign In
        </button>
        <button className="btn-signup" onClick={() => navigate("/student-reg")}>
          <FaUserPlus /> Sign Up
        </button>
      </div>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-text">
          <h1>Looking to Boost Your Skills?</h1>
          <p>
            Learn from top instructors and join our global learning community.
          </p>
          <button className="cta-btn" onClick={() => navigate("/student-reg")}>
            Get Started
          </button>
        </div>
        <div className="hero-img">
          <img
            src="https://images.unsplash.com/photo-1496065187959-7f07b8353c55?auto=format&fit=crop&q=80&w=700"
            alt="Learning"
          />
        </div>
      </section>

      {/* 1. Categories Section */}
      <section className="categories">
        {sections.map((s, idx) => (
          <div className="category-card" key={idx}>
            <img src={s.img} alt={s.title} />
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
            <button onClick={() => alert(`Go to ${s.title}`)}>Explore</button>
          </div>
        ))}
      </section>

      {/* 2 Why Choose Us Section */}
      <section className="why-choose-us">
        <div className="container">
          <h2 className="section-title">
            Why Choose <span className="highlight">Future Minds?</span>
          </h2>

          <div className="why-grid">
            <div className="why-card">
              <div className="icon-box pulse-blue">
                <FaGraduationCap />
              </div>
              <h4>Expert Led</h4>
              <p>
                Learn from industry professionals with real-world experience.
              </p>
            </div>

            <div className="why-card">
              <div className="icon-box pulse-pink">
                <FaShieldAlt />
              </div>
              <h4>Secure & Reliable</h4>
              <p>
                Verified payment gateways and data protection for every student.
              </p>
            </div>

            <div className="why-card">
              <div className="icon-box pulse-purple">
                <FaMobileAlt />
              </div>
              <h4>Learn Anywhere</h4>
              <p>Access your dashboard and lessons from any device, anytime.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <h2 className="testimonials-title">
            What Our <span className="highlight">Students</span> Say
          </h2>

          <div className="horizontal-scroll-container">
            <div className="horizontal-scroll-track">
              {[...testimonials, ...testimonials].map((t, idx) => (
                <div key={idx} className="testimonial-card">
                  <div className="quote-icon">
                    <FaQuoteLeft />
                  </div>
                  <p className="testimonial-text">"{t.review}"</p>

                  <div className="testimonial-footer">
                    <div className="user-avatar">{t.name.charAt(0)}</div>
                    <div className="user-info">
                      <h5 className="user-name">{t.name}</h5>
                      <small className="user-role">{t.role}</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Stats Counter Section */}
      <section
        className="stats-section"
        style={{
          display: "flex",
          justifyContent: "space-around",
          padding: "50px 20px",
          background: "#40405c",
          textAlign: "center",
        }}
      >
        {stats.map((item, idx) => (
          <div key={idx}>
            <h2
              style={{
                color: "#6366f1",
                fontSize: "2.5rem",
                marginBottom: "5px",
              }}
            >
              {item.value}
            </h2>
            <p style={{ color: "#64748b", fontWeight: "600" }}>{item.label}</p>
          </div>
        ))}
      </section>

      {/* 5. Featured Courses Section */}
      <section className="featured-section">
        <h2 className="section-title">
          Explore <span className="highlight">Popular</span> Courses
        </h2>
        <div className="courses-grid">
          {featuredCourses.map((course, idx) => (
            
            <div key={idx} className="course-card">
              <div className="course-badge">Best Seller</div>
              <img src={course.img} alt={course.title} />
              <div className="course-content">
                <div className="course-meta">
                  <span>⭐ {course.rating}</span>
                  <span>👥 {course.students} Students</span>
                </div>
                <h3>{course.title}</h3>
                <div className="course-footer">
                  <span className="price">{course.price}</span>
                  <button
                    className="buy-btn"
                    onClick={() => navigate("/login")}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div> 
      </section>

      {/* 6 Learning Journey / How It Works Section */}
      <section className="journey-section">
        <h2 className="section-title" style={{ color: "#fff" }}>
          Your Learning <span className="highlight">Journey</span>
        </h2>
        <div className="journey-grid">
          {journeySteps.map((item, idx) => (
            <div key={idx} className="journey-card">
              <div className="step-number">{item.step}</div>
              <div className="step-icon">{item.icon}</div>
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
              {idx !== journeySteps.length - 1 && (
                <div className="step-arrow">➜</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 7 instructors */}
      <section className="instructor-section">
        <div className="container">
          <h2 className="section-title">
            Learn from the <span className="highlight">Best</span>
          </h2>
          <p className="section-subtitle">
            Our instructors are industry veterans committed to your success.
          </p>

          <div className="instructor-grid">
            {instructors.map((ins, idx) => (
              <div key={idx} className="instructor-card">
                <div className="instructor-image-container">
                  <img
                    src={ins.img}
                    alt={ins.name}
                    className="instructor-img"
                  />
                  <div className="instructor-socials">
                    <a href="#">
                      <FaLinkedin />
                    </a>
                    <a href="#">
                      <FaTwitter />
                    </a>
                    <a href="#">
                      <FaGithub />
                    </a>
                  </div>
                </div>
                <div className="instructor-info">
                  <h4>{ins.name}</h4>
                  <span className="ins-role">{ins.role}</span>
                  <p className="ins-bio">{ins.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="footer">
        <div className="footer-container">
          {/* Top Links */}
          <div className="footer-top">
            <div>
              <h4>Categories</h4>
              <ul>
                <li>Language</li>
                <li>Management</li>
                <li>Personal Development</li>
                <li>Sales & Marketing</li>
              </ul>
            </div>
            <div>
              <h4>About</h4>
              <ul>
                <li>Our Course Creators</li>
                <li>Learning on Alison</li>
                <li>Blog</li>
                <li>Press Room</li>
              </ul>
            </div>
            <div>
              <h4>Learners</h4>
              <ul>
                <li>Graduate Profiles</li>
                <li>Hubs</li>
                <li>Premium Learning</li>
              </ul>
            </div>
            <div>
              <h4>Partners</h4>
              <ul>
                <li>Integrate API</li>
                <li>Refer a Friend</li>
                <li>Webinars</li>
              </ul>
            </div>
          </div>

          {/* Bottom: Branding + Apps + Social */}
          <div className="footer-bottom">
            <div className="footer-brand">
              <div className="brand-name">
                <span>▲</span> FutureMinds
              </div>
              <p className="tagline">Empower Yourself</p>
              <div className="socials">
                <div className="social facebook">f</div>
                <div className="social x">X</div>
                <div className="social linkedin">in</div>
                <div className="social youtube">▶</div>
              </div>
            </div>

            <div className="footer-apps">
              <button>App Store</button>
              <button>Google Play</button>
            </div>
          </div>

          {/* Legal */}
          <div className="footer-legal">
            <p>© FutureMinds 2026</p>
            <div className="legal-links">
              <span>Privacy</span>
              <span>Terms</span>
              <span>Cookie Policy</span>
              <span>Sitemap</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
