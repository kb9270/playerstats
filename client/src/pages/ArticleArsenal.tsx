import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Clock, Share2, Bookmark } from "lucide-react";
import { motion, useScroll, useSpring } from "framer-motion";

export default function ArticleArsenal() {
  const [, setLocation] = useLocation();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{
      minHeight: "100vh", color: "#fff",
      backgroundImage: "url('/assets/arsenal.png')",
      backgroundSize: "cover",
      backgroundPosition: "center top",
      backgroundRepeat: "no-repeat"
    }}>
      {/* Dégradé par dessus l'image */}
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.85) 60%, #000 80%)",
        display: "flex", flexDirection: "column", alignItems: "center"
      }}>

        {/* Progress Bar */}
        <motion.div style={{
          position: "fixed", top: 0, left: 0, right: 0, height: 4,
          background: "linear-gradient(90deg, #D4AF37, #FFDF00)",
          transformOrigin: "0%", scaleX, zIndex: 10000
        }} />

        {/* Navbar flottante */}
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: isScrolled ? 0 : -100 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "fixed", top: 0, left: 0, right: 0, height: 64,
            background: "rgba(0,0,0,0.9)", backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(212,175,55,0.2)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 24px", zIndex: 9999
          }}
        >
          <button onClick={() => setLocation("/")} style={{ background: "none", border: "none", color: "#fff", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, textTransform: "uppercase", fontWeight: 600 }}>
            <ArrowLeft size={20} /> Retour
          </button>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 800, letterSpacing: "0.1em", color: "#D4AF37" }}>
            L'ÉQUIPE <span style={{ color: "#fff" }}>EXPLORE</span>
          </div>
          <div style={{ display: "flex", gap: 16, color: "rgba(212,175,55,0.8)" }}>
            <Share2 size={18} style={{ cursor: "pointer" }} />
            <Bookmark size={18} style={{ cursor: "pointer" }} />
          </div>
        </motion.div>

        {/* Bouton retour */}
        <motion.button
          animate={{ opacity: isScrolled ? 0 : 1, pointerEvents: isScrolled ? "none" : "auto" }}
          onClick={() => setLocation("/")}
          style={{
            position: "fixed", top: 16, left: 16, zIndex: 999,
            background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(212,175,55,0.3)", color: "#D4AF37",
            borderRadius: "50%", width: 44, height: 44,
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
          }}
        >
          <ArrowLeft size={22} />
        </motion.button>

        {/* Hero - titre sur l'image */}
        <div style={{ minHeight: "70vh", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 60, width: "100%" }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ maxWidth: 840, padding: "0 20px", textAlign: "center" }}
          >
            <div style={{ display: "inline-block", padding: "6px 16px", background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.4)", color: "#D4AF37", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 24, borderRadius: 30 }}>
              Premier League Champions
            </div>
            <h1 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "clamp(32px, 6vw, 80px)", fontWeight: 900, color: "#fff",
              margin: 0, textTransform: "uppercase", lineHeight: 1.05,
              letterSpacing: "-0.02em", textShadow: "0 4px 30px rgba(0,0,0,0.9)"
            }}>
              ARSENAL EST CHAMPION D'ANGLETERRE
            </h1>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginTop: 28, color: "rgba(255,255,255,0.7)", fontFamily: "'Barlow', sans-serif", fontSize: 14 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Clock size={16} color="#D4AF37" /> 6 min de lecture</span>
              <span style={{ color: "#D4AF37" }}>|</span>
              <span style={{ textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Par Khalil</span>
            </div>
          </motion.div>
        </div>

        {/* Contenu de l'article */}
        <div style={{ maxWidth: 760, width: "100%", padding: "0 24px 100px 24px", fontFamily: "'Barlow', sans-serif", lineHeight: 1.8, color: "rgba(255,255,255,0.9)", fontSize: 18 }}>

          <p style={{ fontSize: 22, lineHeight: 1.6, color: "#fff", marginBottom: 48 }}>
            <span style={{ float: "left", fontSize: 88, lineHeight: 0.8, paddingRight: 14, paddingTop: 6, fontFamily: "'Barlow Condensed', serif", fontWeight: 900, color: "#D4AF37" }}>A</span>
            près plus de deux décennies de disette, de quasi-réussites frustrantes, et de reconstructions inachevées, l'attente est enfin terminée. Le ciel de Londres s'est teinté de rouge et blanc. C'est à distance que les Gunners d'Arsenal ont été sacrés, Manchester City ayant concédé un match nul inattendu sur la pelouse de Bournemouth (0-0) au terme d'une rencontre maîtrisée de bout en bout par les Cherries. Un accomplissement majuscule qui vient couronner un projet construit sur la patience, déclenchant des scènes de célébration populaires extraordinaires dans les rues d'Islington.
          </p>

          <hr style={{ border: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)", margin: "48px 0" }} />

          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 34, fontWeight: 800, color: "#D4AF37", textTransform: "uppercase", marginBottom: 20 }}>
            Le triomphe du processus Arteta
          </h2>
          <p style={{ marginBottom: 24 }}>
            Il y a quelques années, le slogan <span style={{ color: "#fff", fontWeight: 600 }}>"Trust the Process"</span> résonnait dans l'Emirates Stadium comme une supplique désespérée face aux critiques acerbes. Aujourd'hui, il est devenu le cri de ralliement d'une armée victorieuse. Mikel Arteta a transformé une équipe en proie au doute en une véritable machine de guerre tactique.
          </p>
          <p style={{ marginBottom: 40 }}>
            L'Espagnol a su instiller une mentalité de vainqueur, tout en imposant un football de possession étouffant et un pressing impitoyable. Ses choix forts, de la réorganisation de la défense à l'intégration progressive des jeunes pépites, ont finalement payé. Arsenal n'a pas seulement gagné des matchs ; ils ont dominé leurs adversaires avec autorité et maestria.
          </p>

          {/* Citation */}
          <div style={{ margin: "48px 0", padding: "32px 40px", borderLeft: "4px solid #D4AF37", background: "rgba(212,175,55,0.05)", borderRadius: "0 12px 12px 0" }}>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 700, lineHeight: 1.4, color: "#fff", margin: 0, fontStyle: "italic" }}>
              "Ce n'est pas seulement un trophée. C'est l'aboutissement de nos souffrances, de nos larmes, et de notre foi inébranlable dans la beauté de notre football."
            </p>
          </div>

          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 34, fontWeight: 800, color: "#D4AF37", textTransform: "uppercase", marginBottom: 20 }}>
            L'éclosion des cadres et le facteur X
          </h2>
          <p style={{ marginBottom: 24 }}>
            Le titre d'Arsenal n'est pas l'œuvre d'un seul homme. C'est la symbiose parfaite d'un collectif où chaque rouage a joué sa partition à la perfection. La défense de fer incarnée par le duo Saliba-Gabriel, protégé par l'infatigable Declan Rice, a été la fondation de ce succès.
          </p>
          <p style={{ marginBottom: 40 }}>
            Mais c'est devant que la magie a opéré. Martin Ødegaard, capitaine exemplaire, a dicté le tempo tout au long de la saison. Il a été parfaitement épaulé par un Bukayo Saka irrésistible, la percussion électrique d'Eberechi Eze, et surtout, le sens du but clinique et dévastateur de Viktor Gyökeres. La solidité et l'expérience acquise lors des saisons précédentes ont permis aux Gunners de ne pas craquer dans le sprint final, gérant la pression avec une maturité impressionnante.
          </p>

          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 34, fontWeight: 800, color: "#D4AF37", textTransform: "uppercase", marginBottom: 20 }}>
            Une nouvelle ère s'ouvre à l'Emirates
          </h2>
          <p style={{ marginBottom: 24 }}>
            Pour les supporters d'Arsenal, les fantômes des Invicibles de 2004 peuvent enfin reposer en paix. Cette nouvelle génération a écrit sa propre histoire. L'explosion de joie au coup de sifflet final n'était que la libération de vingt années de frustration accumulée.
          </p>
          <p style={{ marginBottom: 40 }}>
            Et maintenant ? Ce titre de Premier League permet aux joueurs de Mikel Arteta de faire le plein absolu de confiance. Un état d'esprit de conquérants qui tombe à pic, puisqu'un défi titanesque les attend très bientôt : la grande finale de la Ligue des Champions face au Paris Saint-Germain. La couronne est de retour dans le Nord de Londres, et l'Europe entière est prévenue.
          </p>

          {/* Auteur */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 64, paddingTop: 32, borderTop: "1px solid rgba(212,175,55,0.2)" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg, #D4AF37, #8A7322)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, color: "#111" }}>K</div>
            <div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, color: "#fff", textTransform: "uppercase" }}>Khalil</div>
              <div style={{ fontSize: 13, color: "rgba(212,175,55,0.8)" }}>Grand Format Premier League</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
