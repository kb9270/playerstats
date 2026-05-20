import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Clock, Share2, Bookmark } from "lucide-react";
import { motion, useScroll, useSpring } from "framer-motion";

export default function ArticleArsenal() {
  const [, setLocation] = useLocation();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{ minHeight: "100vh", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", overflowX: "hidden" }}>
      
      {/* Seamless Fixed Background */}
      <div style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: "url('/assets/arsenal.png')",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        zIndex: -2,
        filter: "brightness(0.65) contrast(1.1)"
      }} />

      {/* Dynamic Gradient Overlay that fades to dark at the bottom */}
      <div style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "linear-gradient(to bottom, rgba(15, 5, 5, 0.1) 0%, rgba(15, 5, 5, 0.8) 50%, rgba(10, 0, 0, 0.98) 100%)",
        zIndex: -1,
      }} />

      {/* Scroll Progress Bar (Gold) */}
      <motion.div
        style={{
          position: "fixed", top: 0, left: 0, right: 0, height: 4,
          background: "linear-gradient(90deg, #D4AF37 0%, #FFDF00 100%)",
          transformOrigin: "0%", scaleX, zIndex: 10000
        }}
      />

      {/* Floating Navbar */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: isScrolled ? 0 : -100 }}
        transition={{ duration: 0.3 }}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, height: 64,
          background: "rgba(10, 0, 0, 0.85)", backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(212, 175, 55, 0.2)",
          display: "flex", alignItems: "center", padding: "0 24px", zIndex: 9999,
          justifyContent: "space-between"
        }}
      >
        <button 
          onClick={() => setLocation("/")}
          style={{
            background: "none", border: "none", color: "#fff",
            display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, textTransform: "uppercase", fontWeight: 600
          }}
        >
          <ArrowLeft size={20} /> Retour
        </button>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 800, letterSpacing: "0.1em", color: "#D4AF37" }}>
          L'ÉQUIPE <span style={{ color: "#fff" }}>EXPLORE</span>
        </div>
        <div style={{ display: "flex", gap: 16, color: "rgba(212, 175, 55, 0.8)" }}>
          <Share2 size={18} style={{ cursor: "pointer" }} />
          <Bookmark size={18} style={{ cursor: "pointer" }} />
        </div>
      </motion.div>

      {/* Fixed Header Back Button (when not scrolled) */}
      <motion.button 
        animate={{ opacity: isScrolled ? 0 : 1, pointerEvents: isScrolled ? "none" : "auto" }}
        onClick={() => setLocation("/")}
        style={{
          position: "absolute", top: 32, left: 32, zIndex: 999,
          background: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(8px)",
          border: "1px solid rgba(212, 175, 55, 0.3)",
          color: "#D4AF37", borderRadius: "50%", width: 44, height: 44,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", transition: "all 0.3s"
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(212, 175, 55, 0.2)"}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.4)"}
      >
        <ArrowLeft size={22} />
      </motion.button>

      {/* Transparent Spacer for Hero Effect */}
      <div style={{ height: "65vh", width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 40, position: "relative", zIndex: 10 }}>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ width: "100%", maxWidth: 840, padding: "0 40px", textAlign: "center" }}
        >
          <div style={{ display: "inline-block", padding: "6px 16px", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", border: "1px solid rgba(212, 175, 55, 0.4)", color: "#D4AF37", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 24, borderRadius: 30 }}>
            Premier League Champions
          </div>
          <h1 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "clamp(48px, 6vw, 84px)",
            fontWeight: 900,
            color: "transparent",
            WebkitTextStroke: "1px rgba(255, 255, 255, 0.8)",
            backgroundImage: "linear-gradient(to bottom, #FFF, #D4AF37)",
            WebkitBackgroundClip: "text",
            margin: 0,
            textTransform: "uppercase",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            textShadow: "0 20px 40px rgba(0,0,0,0.9)"
          }}>
            ARSENAL EST CHAMPION D'ANGLETERRE
          </h1>
          
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, marginTop: 32, color: "rgba(255,255,255,0.8)", fontFamily: "'Barlow', sans-serif", fontSize: 14, textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Clock size={16} color="#D4AF37" /> 6 min de lecture</span>
            <span style={{ color: "#D4AF37" }}>|</span>
            <span style={{ textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Par La Rédaction</span>
          </div>
        </motion.div>
      </div>

      {/* Main Content Area - Glassmorphism style integrating with the poster */}
      <div style={{ width: "100%", maxWidth: 840, padding: "0 24px 100px 24px", position: "relative", zIndex: 10 }}>
        
        <div style={{
          background: "rgba(10, 5, 5, 0.6)",
          backdropFilter: "blur(24px)",
          borderTop: "1px solid rgba(212, 175, 55, 0.2)",
          borderLeft: "1px solid rgba(212, 175, 55, 0.1)",
          borderRight: "1px solid rgba(212, 175, 55, 0.1)",
          borderRadius: "24px 24px 0 0",
          padding: "60px 48px",
          boxShadow: "0 -20px 50px rgba(0,0,0,0.5)",
          fontFamily: "'Barlow', sans-serif",
          lineHeight: 1.8,
          color: "rgba(255, 255, 255, 0.9)",
          fontSize: 18,
          fontWeight: 400
        }}>
          
          {/* Introduction with Gold Drop Cap */}
          <p style={{ fontSize: 24, fontWeight: 400, lineHeight: 1.6, color: "#fff", marginBottom: 48 }}>
            <span style={{
              float: "left",
              fontSize: 96,
              lineHeight: 0.8,
              paddingRight: 16,
              paddingTop: 8,
              fontFamily: "'Barlow Condensed', serif",
              fontWeight: 900,
              color: "#D4AF37",
              textShadow: "0 0 20px rgba(212, 175, 55, 0.4)"
            }}>A</span>
            près plus de deux décennies de disette, de quasi-réussites frustrantes, et de reconstructions inachevées, l'attente est enfin terminée. Le ciel de Londres s'est teinté de rouge et blanc. C'est à distance que les Gunners d'Arsenal ont été sacrés, Manchester City ayant concédé un match nul inattendu sur la pelouse de Bournemouth (0-0) au terme d'une rencontre maîtrisée de bout en bout par les Cherries. Un accomplissement majuscule qui vient couronner un projet construit sur la patience, déclenchant des scènes de célébration populaires extraordinaires dans les rues d'Islington.
          </p>

          <hr style={{ border: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.3), transparent)", margin: "60px 0" }} />

          {/* Section 1 */}
          <h2 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 36,
            fontWeight: 800,
            color: "#D4AF37",
            textTransform: "uppercase",
            marginTop: 40,
            marginBottom: 24,
            letterSpacing: "0.02em"
          }}>
            Le triomphe du processus Arteta
          </h2>
          <p style={{ marginBottom: 24 }}>
            Il y a quelques années, le slogan <span style={{ color: "#fff", fontWeight: 600 }}>"Trust the Process"</span> résonnait dans l'Emirates Stadium comme une supplique désespérée face aux critiques acerbes. Aujourd'hui, il est devenu le cri de ralliement d'une armée victorieuse. Mikel Arteta a transformé une équipe en proie au doute en une véritable machine de guerre tactique.
          </p>
          <p style={{ marginBottom: 40 }}>
            L'Espagnol a su instiller une mentalité de vainqueur, tout en imposant un football de possession étouffant et un pressing impitoyable. Ses choix forts, de la réorganisation de la défense à l'intégration progressive des jeunes pépites, ont finalement payé. Arsenal n'a pas seulement gagné des matchs ; ils ont dominé leurs adversaires avec autorité et maestria.
          </p>

          {/* Glass Blockquote / Highlight */}
          <div style={{
            margin: "64px 0",
            padding: "40px",
            background: "rgba(212, 175, 55, 0.05)",
            border: "1px solid rgba(212, 175, 55, 0.2)",
            borderRadius: "16px",
            position: "relative",
            boxShadow: "inset 0 0 40px rgba(212, 175, 55, 0.02)"
          }}>
            <div style={{ position: "absolute", top: -20, left: 30, fontSize: 64, color: "#D4AF37", opacity: 0.5, fontFamily: "serif", lineHeight: 1 }}>"</div>
            <p style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 32,
              fontWeight: 700,
              lineHeight: 1.3,
              color: "#fff",
              margin: 0,
              textAlign: "center",
              fontStyle: "italic",
              textShadow: "0 2px 10px rgba(0,0,0,0.5)"
            }}>
              Ce n'est pas seulement un trophée. C'est l'aboutissement de nos souffrances, de nos larmes, et de notre foi inébranlable dans la beauté de notre football.
            </p>
          </div>

          {/* Section 2 */}
          <h2 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 36,
            fontWeight: 800,
            color: "#D4AF37",
            textTransform: "uppercase",
            marginTop: 40,
            marginBottom: 24,
            letterSpacing: "0.02em"
          }}>
            L'éclosion des cadres et le facteur X
          </h2>
          <p style={{ marginBottom: 24 }}>
            Le titre d'Arsenal n'est pas l'œuvre d'un seul homme. C'est la symbiose parfaite d'un collectif où chaque rouage a joué sa partition à la perfection. La défense de fer incarnée par le duo Saliba-Gabriel, protégé par l'infatigable Declan Rice, a été la fondation de ce succès.
          </p>
          <p style={{ marginBottom: 40 }}>
            Mais c'est devant que la magie a opéré. Martin Ødegaard, capitaine exemplaire, a dicté le tempo tout au long de la saison. Il a été parfaitement épaulé par un Bukayo Saka irrésistible, la percussion électrique d'Eberechi Eze, et surtout, le sens du but clinique et dévastateur de Viktor Gyökeres. La solidité et l'expérience acquise lors des saisons précédentes ont permis aux Gunners de ne pas craquer dans le sprint final, gérant la pression avec une maturité impressionnante.
          </p>

          {/* Section 3 */}
          <h2 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 36,
            fontWeight: 800,
            color: "#D4AF37",
            textTransform: "uppercase",
            marginTop: 40,
            marginBottom: 24,
            letterSpacing: "0.02em"
          }}>
            Une nouvelle ère s'ouvre à l'Emirates
          </h2>
          <p style={{ marginBottom: 24 }}>
            Pour les supporters d'Arsenal, les fantômes des Invicibles de 2004 peuvent enfin reposer en paix. Cette nouvelle génération a écrit sa propre histoire. L'explosion de joie au coup de sifflet final n'était que la libération de vingt années de frustration accumulée.
          </p>
          <p style={{ marginBottom: 40 }}>
            Et maintenant ? Ce titre de Premier League permet aux joueurs de Mikel Arteta de faire le plein absolu de confiance. Un état d'esprit de conquérants qui tombe à pic, puisqu'un défi titanesque les attend très bientôt : la grande finale de la Ligue des Champions face au Paris Saint-Germain. La couronne est de retour dans le Nord de Londres, et l'Europe entière est prévenue.
          </p>
          
          {/* Author Tag */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 80, paddingTop: 40, borderTop: "1px solid rgba(212, 175, 55, 0.2)" }}>
             <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #D4AF37 0%, #8A7322 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20, color: "#111", boxShadow: "0 0 20px rgba(212, 175, 55, 0.3)" }}>
               LE
             </div>
             <div>
               <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>L'Équipe Explore</div>
               <div style={{ fontSize: 14, color: "rgba(212, 175, 55, 0.8)" }}>Grand Format Premier League</div>
             </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}
