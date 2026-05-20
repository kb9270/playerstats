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
    <div style={{ backgroundColor: "#060A11", minHeight: "100vh", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", overflowX: "hidden" }}>
      
      {/* Scroll Progress Bar */}
      <motion.div
        style={{
          position: "fixed", top: 0, left: 0, right: 0, height: 4,
          background: "linear-gradient(90deg, #E8344A 0%, #FF6B81 100%)",
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
          background: "rgba(6, 10, 17, 0.85)", backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
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
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 800, letterSpacing: "0.1em" }}>
          L'ÉQUIPE <span style={{ color: "#E8344A" }}>EXPLORE</span>
        </div>
        <div style={{ display: "flex", gap: 16, color: "rgba(255,255,255,0.6)" }}>
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
          border: "1px solid rgba(255, 255, 255, 0.15)",
          color: "#fff", borderRadius: "50%", width: 44, height: 44,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", transition: "all 0.3s"
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(232, 52, 74, 0.9)"}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.4)"}
      >
        <ArrowLeft size={22} />
      </motion.button>

      {/* Hero Section */}
      <div style={{
        position: "relative", width: "100%", height: "70vh", minHeight: 500,
        backgroundImage: "url('/assets/arsenal.png')",
        backgroundSize: "cover", backgroundPosition: "center 20%",
        display: "flex", alignItems: "flex-end", justifyContent: "center"
      }}>
        {/* Gradients for depth */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(6, 10, 17, 0.2) 0%, rgba(6, 10, 17, 0.8) 70%, #060A11 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%)" }} />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            position: "relative", zIndex: 10,
            width: "100%", maxWidth: 840, padding: "0 40px 40px 40px",
            textAlign: "center"
          }}
        >
          <div style={{ display: "inline-block", padding: "6px 12px", background: "#E8344A", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 20, borderRadius: 2 }}>
            Premier League
          </div>
          <h1 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "clamp(48px, 6vw, 72px)",
            fontWeight: 900,
            color: "#fff",
            margin: 0,
            textTransform: "uppercase",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            textShadow: "0 10px 30px rgba(0,0,0,0.8)"
          }}>
            ARSENAL EST CHAMPION D'ANGLETERRE
          </h1>
          
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, marginTop: 24, color: "rgba(255,255,255,0.6)", fontFamily: "'Barlow', sans-serif", fontSize: 14 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Clock size={16} /> 6 min de lecture</span>
            <span>|</span>
            <span style={{ textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Par La Rédaction</span>
            <span>|</span>
            <span>Édition Spéciale Mai 2026</span>
          </div>
        </motion.div>
      </div>

      {/* Main Content Area */}
      <div style={{ width: "100%", maxWidth: 760, padding: "40px 24px 100px 24px", position: "relative" }}>
        
        {/* Floating decorative elements */}
        <div style={{ position: "absolute", top: 100, left: -60, fontSize: 120, fontFamily: "serif", color: "rgba(255,255,255,0.02)", lineHeight: 1, pointerEvents: "none" }}>"</div>
        
        <div style={{
          fontFamily: "'Barlow', sans-serif",
          lineHeight: 1.8,
          color: "rgba(255, 255, 255, 0.85)",
          fontSize: 18,
          fontWeight: 400
        }}>
          
          {/* Introduction with Drop Cap */}
          <p style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.6, color: "#fff", marginBottom: 48 }}>
            <span style={{
              float: "left",
              fontSize: 84,
              lineHeight: 0.8,
              paddingRight: 12,
              paddingTop: 8,
              fontFamily: "'Barlow Condensed', serif",
              fontWeight: 900,
              color: "#E8344A"
            }}>A</span>
            près plus de deux décennies de disette, de quasi-réussites frustrantes, et de reconstructions inachevées, l'attente est enfin terminée. Le ciel de Londres s'est teinté de rouge et blanc. C'est à distance que les Gunners d'Arsenal ont été sacrés, Manchester City ayant concédé un match nul inattendu sur la pelouse de Bournemouth au terme d'une rencontre maîtrisée de bout en bout par les Cherries. Un accomplissement majuscule qui vient couronner un projet construit sur la patience, déclenchant des scènes de célébration populaires extraordinaires dans les rues d'Islington.
          </p>

          <hr style={{ border: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)", margin: "40px 0" }} />

          {/* Section 1 */}
          <h2 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 32,
            fontWeight: 800,
            color: "#fff",
            textTransform: "uppercase",
            marginTop: 40,
            marginBottom: 20,
            letterSpacing: "0.01em"
          }}>
            Le triomphe du processus Arteta
          </h2>
          <p style={{ marginBottom: 24 }}>
            Il y a quelques années, le slogan "Trust the Process" résonnait dans l'Emirates Stadium comme une supplique désespérée face aux critiques acerbes. Aujourd'hui, il est devenu le cri de ralliement d'une armée victorieuse. Mikel Arteta a transformé une équipe en proie au doute en une véritable machine de guerre tactique.
          </p>
          <p style={{ marginBottom: 40 }}>
            L'Espagnol a su instiller une mentalité de vainqueur, tout en imposant un football de possession étouffant et un pressing impitoyable. Ses choix forts, de la réorganisation de la défense à l'intégration progressive des jeunes pépites, ont finalement payé. Arsenal n'a pas seulement gagné des matchs ; ils ont dominé leurs adversaires avec autorité et maestria.
          </p>

          {/* Blockquote / Highlight */}
          <div style={{
            margin: "48px 0",
            padding: "32px 40px",
            background: "rgba(232, 52, 74, 0.05)",
            borderLeft: "4px solid #E8344A",
            borderRadius: "0 12px 12px 0",
            position: "relative"
          }}>
            <p style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 28,
              fontWeight: 700,
              lineHeight: 1.4,
              color: "#fff",
              margin: 0,
              fontStyle: "italic"
            }}>
              "Ce n'est pas seulement un trophée. C'est l'aboutissement de nos souffrances, de nos larmes, et de notre foi inébranlable dans la beauté de notre football."
            </p>
          </div>

          {/* Section 2 */}
          <h2 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 32,
            fontWeight: 800,
            color: "#fff",
            textTransform: "uppercase",
            marginTop: 40,
            marginBottom: 20,
            letterSpacing: "0.01em"
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
            fontSize: 32,
            fontWeight: 800,
            color: "#fff",
            textTransform: "uppercase",
            marginTop: 40,
            marginBottom: 20,
            letterSpacing: "0.01em"
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
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 64, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
             <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #E8344A 0%, #000 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, color: "#fff" }}>
               LE
             </div>
             <div>
               <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, color: "#fff", textTransform: "uppercase" }}>L'Équipe Explore</div>
               <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Grand Format Premier League</div>
             </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}
