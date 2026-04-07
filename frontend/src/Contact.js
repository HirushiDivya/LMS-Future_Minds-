import React, { useState } from "react";
import "./About.css"; 
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaPaperPlane,
} from "react-icons/fa";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault(); //  WhatsApp 

    const phoneNumber = "94761758959"; // Message 

    const message =
      
      `*Name:* ${formData.name}%0A` +
      `*Email:* ${formData.email}%0A` +
      `*Subject:* ${formData.subject}%0A` +
      `*Message:* ${formData.message}`; // WhatsApp URL -> open new tab

    const whatsappURL = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappURL, "_blank");

    // clear form ---
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };
 
  return (
    <div className="about-page">
      <div className="about-container">
        {/* Hero Section */}
        <section className="about-hero">
          <h1 className="about-title" style={{paddingTop : "0px", marginTop :"-30px"}}>
            Contact <span className="highlight">Us</span>
          </h1>
          <div className="title-underline"></div>
          <p className="about-subtitle">
            Have questions? We're here to help you navigate your journey with
            FutureMinds.
          </p>
        </section>

        <div className="about-grid">
          {/* Contact Information Cards */}
          <div className="about-card">
            <div className="icon-wrapper">
              <FaPhone className="about-icon" />
            </div>
            <h3 className="aboutcardh3">Call Us</h3>
            <p className='about-small-card'>+94 761758959</p>
            <p className='about-small-card'>Mon - Fri, 9am - 6pm</p>
          </div>

          <div className="about-card">
            <div className="icon-wrapper">
              <FaEnvelope className="about-icon" />
            </div>
            <h3 className="aboutcardh3">Email Us</h3>
            <p className='about-small-card'>support@futureminds.com</p>
            <p className='about-small-card'>contact@futureminds.com</p>
          </div>

          <div className="about-card">
            <div className="icon-wrapper">
              <FaMapMarkerAlt className="about-icon" />
            </div>
            <h3 className="aboutcardh3">Visit Us</h3>
            <p className='about-small-card'>123 Tech Plaza, Colombo 07,</p>
            <p className='about-small-card'>Sri Lanka.</p>
          </div>
        </div>

        {/* Contact Form Section */}
        <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <section className="contact-us-box"style={{ width: "500px" }}>
          <div className="contact-header">
            <h2 style={{ textAlign: "center", marginBottom: "30px" }}>
              Send a Message
            </h2>
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                }}
              >
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  style={inputStyle}
                  onChange={handleChange}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  style={inputStyle}
                  onChange={handleChange}
                  required
                />
              </div>
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                style={inputStyle}
                onChange={handleChange}
                required
              />
              <textarea
                name="message"
                placeholder="Your Message"
                rows="5"
                style={inputStyle}
                onChange={handleChange}
                required
              ></textarea>

              <button type="submit" className="contact-btn">
                <FaPaperPlane style={{ marginRight: "10px" }} /> Send Message
              </button>
            </form>
          </div>
        </section>
        </div>
      </div>
    </div>
  );
};

// Simple Inline Styles for the Form Elements to match the theme
const inputStyle = {
  background: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 204, 0, 0.3)",
  padding: "12px",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "1rem",
  outline: "none",
};

export default Contact;
