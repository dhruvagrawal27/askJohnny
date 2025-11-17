import { motion } from "framer-motion";
import { SignInButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Phone,
  Clock,
  Calendar,
  Globe,
  DollarSign,
  Star,
  CheckCircle,
  X,
} from "lucide-react";

interface HeroProps {
  businessName: string;
  handleInputChange: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const Hero = ({ businessName, handleInputChange, handleSubmit }: HeroProps) => {
  const navigate = useNavigate();
  
  const industries = [
    { name: "Home Services", icon: "🏠" },
    { name: "Law Firms", icon: "⚖" },
    { name: "Property Management", icon: "🏢" },
    { name: "Construction", icon: "🏗" },
    { name: "Real Estate", icon: "🏘" },
    { name: "Plumbing", icon: "🔧" },
    { name: "Automotive", icon: "🚗" },
    { name: "Salons", icon: "✂" },
  ];

  const benefits = [
    {
      icon: DollarSign,
      title: "Never Miss Revenue",
      desc: "Every missed call is potential lost revenue. Johnny ensures every caller gets the attention they deserve.",
    },
    {
      icon: Star,
      title: "Professional Image",
      desc: "Give your business a polished, professional appearance that builds trust with every interaction.",
    },
    {
      icon: Globe,
      title: "Scale Effortlessly",
      desc: "Handle unlimited calls simultaneously without hiring additional staff or missing opportunities.",
    },
  ];

  return (
    <div
      style={{
        position: "relative",
        background:
          "linear-gradient(to bottom, #ffffff, #f8fafc, rgba(224,231,255,0.3))",
      }}
    >
      {/* Hero Section */}
      <section
        style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}
      >
        {/* Decorative Background */}
        <div
          style={{
            pointerEvents: "none",
            position: "absolute",
            inset: "0",
            userSelect: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-10rem",
              left: "50%",
              height: "32rem",
              width: "32rem",
              transform: "translateX(-50%)",
              borderRadius: "50%",
              filter: "blur(4rem)",
              background:
                "radial-gradient(closest-side, rgba(79,70,229,0.12), transparent 70%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: "0",
              backgroundImage:
                "linear-gradient(to right, rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.06) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
              maskImage:
                "radial-gradient(ellipse 90% 90% at 50% 10%, black 60%, transparent 100%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 90% 90% at 50% 10%, black 60%, transparent 100%)",
            }}
          />
        </div>

        {/* Header */}
        <header
          style={{
            position: "relative",
            zIndex: 20,
            paddingLeft: "1rem",
            paddingRight: "1rem",
            paddingTop: "1.5rem",
          }}
        >
          <div
            style={{
              marginLeft: "auto",
              marginRight: "auto",
              maxWidth: "80rem",
              borderRadius: "1rem",
              border: "1px solid rgba(203,213,225,0.7)",
              background: "rgba(255,255,255,0.6)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.75rem 1rem",
              }}
            >
              <motion.a
                href="#"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    placeItems: "center",
                    height: "2.5rem",
                    width: "2.5rem",
                    borderRadius: "0.75rem",
                    background:
                      "linear-gradient(to bottom right, #c7d2fe, #e0e7ff)",
                    border: "1px solid #c7d2fe",
                    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
                  }}
                >
                  <span style={{ color: "#4338ca", fontWeight: "700" }}>A</span>
                </div>
                <h1
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "600",
                    letterSpacing: "-0.025em",
                    color: "#1e293b",
                  }}
                >
                  Ask
                  <span style={{ fontWeight: "800", color: "#4338ca" }}>
                    Johnny
                  </span>
                </h1>
              </motion.a>

              <motion.nav
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                style={{
                  display: "none",
                  alignItems: "center",
                  gap: "0.25rem",
                  borderRadius: "9999px",
                  border: "1px solid #e2e8f0",
                  background: "rgba(255,255,255,0.7)",
                  backdropFilter: "blur(10px)",
                  padding: "0.25rem",
                }}
                className="md:flex"
              >
                {["Home", "About", "Services", "Pricing", "Contact"].map(
                  (item, i) => (
                    <a
                      key={i}
                      href="#"
                      style={{
                        padding: "0.5rem 1rem",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        color: "#475569",
                        borderRadius: "9999px",
                        transition: "color 0.2s, background-color 0.2s",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.backgroundColor = "#f1f5f9")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      {item}
                    </a>
                  )
                )}
              </motion.nav>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <SignInButton mode="modal">
                  <button
                    style={{
                      padding: "0.5rem 1.25rem",
                      borderRadius: "9999px",
                      border: "1px solid #d1d5db",
                      color: "#374151",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      transition: "background-color 0.2s",
                      boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
                    }}
                  >
                    Log in
                  </button>
                </SignInButton>
                <button
                  onClick={() => {
                    console.log('🔘 Sign Up button clicked in Hero - navigating to /new-onboarding');
                    navigate("/new-onboarding");
                  }}
                  style={{
                    padding: "0.5rem 1.25rem",
                    borderRadius: "9999px",
                    background: "#4f46e5",
                    color: "#ffffff",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    transition: "background-color 0.2s",
                    boxShadow: "0 1px 3px 0 rgba(0,0,0,0.1)",
                  }}
                >
                  Sign Up
                </button>
              </motion.div>
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            marginLeft: "auto",
            marginRight: "auto",
            maxWidth: "80rem",
            paddingLeft: "1rem",
            paddingRight: "1rem",
            paddingTop: "3rem",
            paddingBottom: "6rem",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "70vh",
              textAlign: "center",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              style={{
                marginBottom: "1.5rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                borderRadius: "9999px",
                border: "1px solid #c7d2fe",
                background: "rgba(224,231,255,0.8)",
                padding: "0.5rem 1rem",
                boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  height: "0.5rem",
                  width: "0.5rem",
                  borderRadius: "9999px",
                  background: "#6366f1",
                  animation: "pulse 2s infinite",
                }}
              />
              <span
                style={{
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  color: "#2d3748",
                }}
              >
                ✨ Transform Your Business with AI
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{ marginBottom: "1.5rem" }}
            >
              <h2
                style={{
                  fontSize: "3rem",
                  fontWeight: "800",
                  letterSpacing: "-0.025em",
                  color: "#1e293b",
                }}
              >
                Never Miss Another
                <br />
                <span
                  style={{
                    background:
                      "linear-gradient(to right, #4f46e5, #7c3aed, #db2777)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  Customer Call
                </span>
              </h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.28 }}
              style={{
                marginLeft: "auto",
                marginRight: "auto",
                marginBottom: "2.5rem",
                maxWidth: "32rem",
                fontSize: "1.125rem",
                lineHeight: "1.75",
                color: "#475569",
              }}
            >
              AI-powered phone assistant that handles calls, schedules
              appointments, and grows your business while you sleep.
            </motion.p>

            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.32 }}
              style={{
                marginBottom: "3.5rem",
                width: "100%",
                maxWidth: "32rem",
              }}
            >
              <label
                htmlFor="businessName"
                style={{
                  position: "absolute",
                  width: "1px",
                  height: "1px",
                  padding: "0",
                  margin: "-1px",
                  overflow: "hidden",
                  clip: "rect(0, 0, 0, 0)",
                  border: "0",
                }}
              >
                Business Name
              </label>
              <div
                style={{
                  position: "relative",
                  borderRadius: "1rem",
                  border: "1px solid #e2e8f0",
                  background: "#ffffff",
                  boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
                }}
              >
                <input
                  id="businessName"
                  type="text"
                  value={businessName}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="Enter your business name..."
                  style={{
                    width: "100%",
                    borderRadius: "1rem",
                    background: "transparent",
                    padding: "1rem 1.25rem",
                    fontSize: "1rem",
                    color: "#1e293b",
                    outline: "none",
                  }}
                  aria-describedby="businessNameHelp"
                  autoComplete="organization"
                />
                <button
                  type="submit"
                  disabled={!businessName.trim()}
                  style={{
                    position: "absolute",
                    right: "0.5rem",
                    top: "0.5rem",
                    borderRadius: "0.75rem",
                    padding: "0.75rem 1.5rem",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
                    transition: "background-color 0.2s",
                    ...(businessName.trim()
                      ? { background: "#4f46e5", color: "#ffffff" }
                      : {
                          background: "#e2e8f0",
                          color: "#6b7280",
                          cursor: "not-allowed",
                        }),
                  }}
                >
                  Get Started
                </button>
              </div>
              <p
                id="businessNameHelp"
                style={{
                  marginTop: "0.5rem",
                  fontSize: "0.75rem",
                  color: "#6b7280",
                }}
              >
                We'll personalize your setup — you can change it anytime.
              </p>
            </motion.form>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              style={{ width: "100%", maxWidth: "72rem" }}
            >
              <div
                style={{
                  borderRadius: "1.5rem",
                  border: "1px solid #e2e8f0",
                  background: "#ffffff",
                  padding: "2rem",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                }}
              >
                <div
                  style={{
                    aspectRatio: "16/9",
                    borderRadius: "1rem",
                    border: "1px solid #e2e8f0",
                    background:
                      "linear-gradient(to bottom right, #f8fafc, #ffffff, #e0e7ff)",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        marginLeft: "auto",
                        marginRight: "auto",
                        marginBottom: "1rem",
                        display: "grid",
                        placeItems: "center",
                        height: "5rem",
                        width: "5rem",
                        borderRadius: "9999px",
                        background:
                          "linear-gradient(to bottom right, #6366f1, #4f46e5)",
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                      }}
                    >
                      <Phone
                        style={{
                          height: "2.5rem",
                          width: "2.5rem",
                          color: "#ffffff",
                        }}
                      />
                    </div>
                    <h3
                      style={{
                        marginBottom: "0.25rem",
                        fontSize: "1.5rem",
                        fontWeight: "700",
                        color: "#1e293b",
                      }}
                    >
                      Dashboard Preview
                    </h3>
                    <p style={{ color: "#475569" }}>
                      Your AI assistant's control center
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section
        style={{
          position: "relative",
          paddingTop: "5rem",
          paddingBottom: "5rem",
          background: "#ffffff",
        }}
      >
        <div
          style={{
            marginLeft: "auto",
            marginRight: "auto",
            maxWidth: "80rem",
            paddingLeft: "1rem",
            paddingRight: "1rem",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2
              style={{
                fontSize: "2.25rem",
                fontWeight: "700",
                color: "#1e293b",
                marginBottom: "1rem",
              }}
            >
              Why Johnny is Better Than Voicemail
            </h2>
            <p
              style={{
                fontSize: "1.125rem",
                color: "#475569",
                maxWidth: "48rem",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              While voicemail sends customers away, Johnny keeps them engaged.
              See the difference an AI receptionist makes for your business.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2rem",
              maxWidth: "72rem",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {/* Traditional Voicemail */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "1rem",
                padding: "2rem",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "#b91c1c",
                    marginBottom: "0.5rem",
                  }}
                >
                  <X style={{ width: "1.5rem", height: "1.5rem" }} />
                  <span style={{ fontWeight: "600" }}>VS</span>
                </div>
                <h3
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "700",
                    color: "#991b1b",
                  }}
                >
                  Traditional Voicemail
                </h3>
                <p style={{ color: "#b91c1c" }}>Outdated & Ineffective</p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {[
                  "📵 50% of callers hang up on voicemail",
                  "🗑 Messages get lost or forgotten",
                  "⏰ No immediate assistance or answers",
                  "🏃 Customers call your competitors instead",
                  "📅 Can't schedule appointments automatically",
                  "🌙 No after-hours support",
                ].map((text, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.75rem",
                    }}
                  >
                    <X
                      style={{
                        width: "1.25rem",
                        height: "1.25rem",
                        color: "#ef4444",
                        marginTop: "0.125rem",
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <span style={{ color: "#7f1d1d", fontWeight: "500" }}>
                        {text}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
                <span style={{ color: "#b91c1c", fontWeight: "600" }}>
                  Missing Opportunities
                </span>
              </div>
            </motion.div>

            {/* Johnny AI */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "1rem",
                padding: "2rem",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "#15803d",
                    marginBottom: "0.5rem",
                  }}
                >
                  <CheckCircle style={{ width: "1.5rem", height: "1.5rem" }} />
                </div>
                <h3
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "700",
                    color: "#166534",
                  }}
                >
                  Johnny AI Receptionist
                </h3>
                <p style={{ color: "#15803d" }}>Smart & Professional</p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {[
                  "📞 Answers every call professionally, 24/7",
                  "⚡ Provides immediate, helpful responses",
                  "📅 Schedules appointments automatically",
                  "💎 Captures leads and customer information",
                  "🌍 Handles multiple languages fluently",
                  "💰 Costs less than traditional services",
                ].map((text, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.75rem",
                    }}
                  >
                    <CheckCircle
                      style={{
                        width: "1.25rem",
                        height: "1.25rem",
                        color: "#22c55e",
                        marginTop: "0.125rem",
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <span style={{ color: "#14532d", fontWeight: "500" }}>
                        {text}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
                <span style={{ color: "#15803d", fontWeight: "600" }}>
                  Growing Your Business
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section
        style={{
          position: "relative",
          paddingTop: "5rem",
          paddingBottom: "5rem",
          background: "#f8fafc",
        }}
      >
        <div
          style={{
            marginLeft: "auto",
            marginRight: "auto",
            maxWidth: "80rem",
            paddingLeft: "1rem",
            paddingRight: "1rem",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "2rem",
            }}
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                style={{ textAlign: "center" }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "4rem",
                    height: "4rem",
                    borderRadius: "9999px",
                    background: "#e0e7ff",
                    marginBottom: "1.5rem",
                  }}
                >
                  <benefit.icon
                    style={{ width: "2rem", height: "2rem", color: "#4f46e5" }}
                  />
                </div>
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "600",
                    color: "#1e293b",
                    marginBottom: "1rem",
                  }}
                >
                  {benefit.title}
                </h3>
                <p style={{ color: "#475569" }}>{benefit.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <div
            style={{
              marginTop: "4rem",
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "2rem",
              textAlign: "center",
            }}
          >
            {[
              { value: "24/7", label: "Always Available" },
              { value: "100%", label: "Calls Answered" },
              { value: "0", label: "Missed Opportunities" },
              { value: "50+", label: "Industries Served" },
            ].map((stat, i) => (
              <div key={i}>
                <div
                  style={{
                    fontSize: "1.875rem",
                    fontWeight: "700",
                    color: "#4f46e5",
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ color: "#475569" }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "3rem", textAlign: "center" }}>
            <h2
              style={{
                fontSize: "2.25rem",
                fontWeight: "700",
                color: "#1e293b",
                marginBottom: "1rem",
              }}
            >
              The Johnny Difference
            </h2>
            <p style={{ fontSize: "1.125rem", color: "#475569" }}>
              Real results that transform your business
            </p>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section
        style={{
          position: "relative",
          paddingTop: "5rem",
          paddingBottom: "5rem",
          background: "#ffffff",
        }}
      >
        <div
          style={{
            marginLeft: "auto",
            marginRight: "auto",
            maxWidth: "80rem",
            paddingLeft: "1rem",
            paddingRight: "1rem",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2
              style={{
                fontSize: "2.25rem",
                fontWeight: "700",
                color: "#1e293b",
                marginBottom: "1rem",
              }}
            >
              Industries We Serve
            </h2>
            <p
              style={{
                fontSize: "1.125rem",
                color: "#475569",
                maxWidth: "48rem",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Ask Johnny provides specialized AI phone assistance across various
              industries
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "1.5rem",
            }}
          >
            {industries.map((industry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "1rem",
                  padding: "1.5rem",
                  textAlign: "center",
                  transition: "box-shadow 0.3s, border-color 0.3s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "0 10px 15px -3px rgba(0,0,0,0.1)")
                }
                onMouseOut={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                <div
                  style={{
                    fontSize: "2.25rem",
                    marginBottom: "1rem",
                    transition: "transform 0.3s",
                  }}
                  className="group-hover:scale-110"
                >
                  {industry.icon}
                </div>
                <h3
                  style={{
                    fontWeight: "600",
                    color: "#1e293b",
                    transition: "color 0.3s",
                  }}
                  className="group-hover:text-indigo-600"
                >
                  {industry.name}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;

// // components/landing/Hero.tsx
// import { motion } from "framer-motion";
// import { SignInButton, SignUpButton } from "@clerk/clerk-react";
// import LightRays from "./LightRays";
// import { cn } from "@/lib/utils";

// interface HeroProps {
//   businessName: string;
//   handleInputChange: (value: string) => void;
//   handleSubmit: (e: React.FormEvent) => void;
// }

// const Hero = ({ businessName, handleInputChange, handleSubmit }: HeroProps) => {
//   return (
//     <section className="relative min-h-screen overflow-hidden p-4 bg-indigo-900">
//       {/* Main Container with Darker Gradient */}
//       <div
//         className="relative min-h-screen rounded-2xl z-10"
//         style={{
//           background: "linear-gradient(204deg, #3b2e91 0%, #1a163d 100%)",
//           minHeight: "600px",
//         }}
//       >
//         {/* Background Effects */}
//         <div className="absolute inset-0 pointer-events-none z-5 rounded-2xl">
//           <LightRays
//             raysOrigin="top-right"
//             raysColor="#0f172a"
//             raysSpeed={2}
//             lightSpread={10}
//             rayLength={1.5}
//             followMouse={false}
//             mouseInfluence={0}
//             noiseAmount={0.2}
//             distortion={0.05}
//             className="opacity-60 rounded-2xl"
//             pulsating={true}
//           />

//           <div
//             className="absolute inset-0 z-0 rounded-2xl"
//             style={{
//               background:
//                 "radial-gradient(125% 125% at 50% 90%, #0f172a 40%, #3b2e91 100%)",
//             }}
//           />

//           <div
//             className="absolute inset-0 z-1 rounded-2xl"
//             style={{
//               backgroundImage: `
//                 linear-gradient(to right, #334155 1px, transparent 1px),
//                 linear-gradient(to bottom, #334155 1px, transparent 1px)
//               `,
//               backgroundSize: "32px 32px",
//               WebkitMaskImage:
//                 "radial-gradient(ellipse 80% 80% at 100% 0%, rgba(0,0,0,0.3) 50%, transparent 90%)",
//               maskImage:
//                 "radial-gradient(ellipse 80% 80% at 100% 0%, rgba(0,0,0,0.3) 50%, transparent 90%)",
//             }}
//           />
//         </div>

//         {/* Header */}
//         <header className="relative z-20 px-6 lg:px-8 pt-6 rounded-2xl ">
//           <div className="flex items-center justify-between w-full">
//             {/* Logo */}
//             <motion.div
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.6 }}
//               className="flex items-center gap-3"
//             >
//               <div className="w-10 h-10 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 shadow-lg">
//                 <span className="text-white font-bold text-lg">A</span>
//               </div>
//               <h1 className="text-2xl font-bold text-white tracking-tight">
//                 Ask<span className="text-white font-extrabold">Johnny</span>
//               </h1>
//             </motion.div>

//             {/* Navigation */}
//             <motion.nav
//               initial={{ opacity: 0, y: -20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.6, delay: 0.1 }}
//               className="hidden md:flex items-center bg-white/10 backdrop-blur-md rounded-full px-2 py-2 border border-white/20"
//             >
//               {["Home", "About", "Services", "Pricing", "Contact"].map(
//                 (item, i) => (
//                   <a
//                     key={i}
//                     href="#"
//                     className="px-5 py-2.5 text-gray-200 hover:text-white text-sm font-medium transition-all hover:bg-white/10 rounded-full"
//                   >
//                     {item}
//                   </a>
//                 )
//               )}
//             </motion.nav>

//             {/* Auth */}
//             <motion.div
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.2, duration: 0.6 }}
//               className="flex items-center gap-2 bg-white/10 rounded-full p-2"
//             >
//               <SignInButton mode="modal">
//                 <button className="px-6 py-2.5 bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition-all rounded-full">
//                   Log in
//                 </button>
//               </SignInButton>
//               <SignUpButton mode="modal">
//                 <button className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-full transition-all shadow-lg">
//                   Sign Up
//                 </button>
//               </SignUpButton>
//             </motion.div>
//           </div>
//         </header>

//         {/* Hero Content */}
//         <div className="relative z-30 flex flex-col items-center justify-center min-h-screen px-6 lg:px-8 pt-20 pb-32">
//           <div className="max-w-5xl mx-auto text-center">
//             {/* Badge */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.3, duration: 0.6 }}
//               className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-12 border border-white/20 shadow-lg"
//             >
//               <div
//                 className="w-2 h-2 rounded-full animate-pulse"
//                 style={{
//                   background:
//                     "linear-gradient(135deg, #695FDA 0%, #BDB5FC 100%)",
//                 }}
//               ></div>
//               <span className="text-sm font-semibold text-white">
//                 ✨ Transform Your Business with AI
//               </span>
//             </motion.div>

//             {/* Heading */}
//             <motion.div
//               initial={{ opacity: 0, y: 30 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.4, duration: 0.8 }}
//               className="mb-8"
//             >
//               <h2 className="text-5xl lg:text-7xl font-bold text-white mb-2 leading-tight">
//                 Never Miss Another
//                 <br />
//                 <span className="font-extrabold text-violet-600">
//                   Customer Call
//                 </span>
//               </h2>
//               <p className="text-lg lg:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed font-light mt-6">
//                 AI-powered phone assistant that handles calls, schedules
//                 appointments, and grows your business while you sleep.
//               </p>
//             </motion.div>

//             {/* Input */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.6, duration: 0.6 }}
//               className="mb-16"
//             >
//               <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
//                 <div className="relative bg-white rounded-2xl p-2 shadow-2xl backdrop-blur-sm">
//                   <input
//                     type="text"
//                     value={businessName}
//                     onChange={(e) => handleInputChange(e.target.value)}
//                     placeholder="Enter your business name..."
//                     className="w-full px-6 py-4 text-lg border-0 rounded-xl focus:ring-0 focus:outline-none transition-all duration-200 bg-transparent text-gray-700 placeholder-gray-400"
//                   />
//                   <button
//                     type="submit"
//                     disabled={!businessName.trim()}
//                     className="absolute right-2 top-2 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
//                     style={{
//                       background: businessName.trim()
//                         ? "linear-gradient(135deg, #695FDA 0%, #BDB5FC 100%)"
//                         : "#475569",
//                     }}
//                   >
//                     Get Started
//                   </button>
//                 </div>
//               </form>
//             </motion.div>

//             {/* Dashboard Preview */}
//             <motion.div
//               initial={{ opacity: 0, y: 40 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.8, duration: 0.8 }}
//               className="w-full max-w-6xl mx-auto"
//             >
//               <div className="relative bg-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-4 md:p-8 shadow-2xl">
//                 <div className="aspect-video bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl flex items-center justify-center shadow-inner border border-gray-700">
//                   <div className="text-center">
//                     <div
//                       className="w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-2xl"
//                       style={{
//                         background:
//                           "linear-gradient(135deg, #695FDA 0%, #BDB5FC 100%)",
//                       }}
//                     >
//                       <svg
//                         className="w-8 h-8 md:w-12 md:h-12 text-white"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
//                         />
//                       </svg>
//                     </div>
//                     <h3 className="text-xl md:text-3xl font-bold mb-2 md:mb-3 text-white">
//                       Dashboard Preview
//                     </h3>
//                     <p className="text-gray-300 font-medium text-base md:text-lg">
//                       Your AI assistant's control center
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Hero;
