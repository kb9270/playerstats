import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Clock, Share2, Bookmark } from "lucide-react";
import { motion, useScroll, useSpring } from "framer-motion";

export default function ArticleNeymar() {
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
        backgroundImage: "url('/assets/neymar.png')",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        zIndex: -2,
        filter: "brightness(0.6) contrast(1.1)"
      }} />

      {/* Dynamic Gradient Overlay that fades to dark green at the bottom */}
      <div style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "linear-gradient(to bottom, rgba(5, 10, 5, 0.1) 0%, rgba(5, 15, 5, 0.8) 50%, rgba(0, 10, 2, 0.98) 100%)",
        zIndex: -1,
      }} />

      {/* Scroll Progress Bar (Brazil Yellow/Green) */}
      <motion.div
        style={{
          position: "fixed", top: 0, left: 0, right: 0, height: 4,
          background: "linear-gradient(90deg, #009B3A 0%, #FDE100 100%)",
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
          background: "rgba(0, 10, 2, 0.85)", backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(253, 225, 0, 0.2)",
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
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 800, letterSpacing: "0.1em", color: "#FDE100" }}>
          THE RACE <span style={{ color: "#fff" }}>MAGAZINE</span>
        </div>
        <div style={{ display: "flex", gap: 16, color: "rgba(253, 225, 0, 0.8)" }}>
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
          border: "1px solid rgba(253, 225, 0, 0.3)",
          color: "#FDE100", borderRadius: "50%", width: 44, height: 44,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", transition: "all 0.3s"
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(253, 225, 0, 0.2)"}
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
          <div style={{ display: "inline-block", padding: "6px 16px", background: "rgba(0, 155, 58, 0.6)", backdropFilter: "blur(8px)", border: "1px solid rgba(253, 225, 0, 0.4)", color: "#FDE100", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 24, borderRadius: 30 }}>
            Analyse Exclusive
          </div>
          <h1 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "clamp(48px, 6vw, 84px)",
            fontWeight: 900,
            color: "transparent",
            WebkitTextStroke: "1px rgba(255, 255, 255, 0.8)",
            backgroundImage: "linear-gradient(to bottom, #FFF, #FDE100)",
            WebkitBackgroundClip: "text",
            margin: 0,
            textTransform: "uppercase",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            textShadow: "0 20px 40px rgba(0,0,0,0.9)"
          }}>
            BRÉSIL : Le retour du prince ?
          </h1>
          
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, marginTop: 32, color: "rgba(255,255,255,0.8)", fontFamily: "'Barlow', sans-serif", fontSize: 14, textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Clock size={16} color="#FDE100" /> 5 min de lecture</span>
            <span style={{ color: "#009B3A" }}>|</span>
            <span style={{ textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Par La Rédaction</span>
          </div>
        </motion.div>
      </div>

      {/* Main Content Area - Glassmorphism style integrating with the poster */}
      <div style={{ width: "100%", maxWidth: 840, padding: "0 24px 100px 24px", position: "relative", zIndex: 10 }}>
        
        <div style={{
          background: "rgba(5, 15, 5, 0.6)",
          backdropFilter: "blur(24px)",
          borderTop: "1px solid rgba(253, 225, 0, 0.2)",
          borderLeft: "1px solid rgba(253, 225, 0, 0.1)",
          borderRight: "1px solid rgba(253, 225, 0, 0.1)",
          borderRadius: "24px 24px 0 0",
          padding: "60px 48px",
          boxShadow: "0 -20px 50px rgba(0,0,0,0.5)",
          fontFamily: "'Barlow', sans-serif",
          lineHeight: 1.8,
          color: "rgba(255, 255, 255, 0.9)",
          fontSize: 18,
          fontWeight: 400
        }}>
          
          {/* Introduction with Yellow Drop Cap */}
          <p style={{ fontSize: 24, fontWeight: 400, lineHeight: 1.6, color: "#fff", marginBottom: 48 }}>
            <span style={{
              float: "left",
              fontSize: 96,
              lineHeight: 0.8,
              paddingRight: 16,
              paddingTop: 8,
              fontFamily: "'Barlow Condensed', serif",
              fontWeight: 900,
              color: "#FDE100",
              textShadow: "0 0 20px rgba(253, 225, 0, 0.4)"
            }}>L</span>
            e peuple brésilien retient son souffle. Après des mois d'une agonie physique silencieuse, marquée par cette terrible rupture des ligaments croisés antérieurs sous le ciel lourd de Montevideo, et un retour triomphant mais sous pression dans son club formateur de Santos, Neymar da Silva Santos Júnior s'apprête à revêtir la tunique sacrée de la Seleção. Pour beaucoup, c'est l'étincelle ultime. Le retour de l'artiste déchu, venu réclamer sa couronne avant la grande messe nord-américaine de 2026.
          </p>

          <hr style={{ border: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(253, 225, 0, 0.3), transparent)", margin: "60px 0" }} />

          {/* Section 1 */}
          <h2 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 36,
            fontWeight: 800,
            color: "#FDE100",
            textTransform: "uppercase",
            marginTop: 40,
            marginBottom: 24,
            letterSpacing: "0.02em"
          }}>
            Le défi physique et mental : La résilience à 34 ans
          </h2>
          <p style={{ marginBottom: 24 }}>
            À 34 ans (l'âge qu'il aura lors du tournoi), après tant de cicatrices, d'opérations et de soirées d'amertume, la question brûle les lèvres : Neymar a-t-il encore les jambes et le coffre pour le très haut niveau international ? Le football moderne n'attend pas ; il broie les nostalgiques et les corps fatigués. 
          </p>
          <p style={{ marginBottom: 40 }}>
            Pourtant, chez Ney, la résilience n'est pas un vain mot. C'est un moteur intime, alimenté par le désir viscéral de laver l'affront des échecs passés. Ses séances de rééducation spartiates, partagées sur ses réseaux, témoignent d'un homme qui refuse d'abdiquer devant l'usure du temps. Son retour sur les terrains est un défi lancé à la science et à ses détracteurs.
          </p>

          {/* Glass Blockquote / Highlight */}
          <div style={{
            margin: "64px 0",
            padding: "40px",
            background: "rgba(253, 225, 0, 0.05)",
            border: "1px solid rgba(253, 225, 0, 0.2)",
            borderRadius: "16px",
            position: "relative",
            boxShadow: "inset 0 0 40px rgba(253, 225, 0, 0.02)"
          }}>
            <div style={{ position: "absolute", top: -20, left: 30, fontSize: 64, color: "#FDE100", opacity: 0.5, fontFamily: "serif", lineHeight: 1 }}>"</div>
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
              Son retour sur les terrains est un défi lancé à la science et à ses détracteurs. Une quête d'éternité.
            </p>
          </div>

          {/* Section 2 */}
          <h2 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 36,
            fontWeight: 800,
            color: "#FDE100",
            textTransform: "uppercase",
            marginTop: 40,
            marginBottom: 24,
            letterSpacing: "0.02em"
          }}>
            Chef d'orchestre dans l'ombre des flèches
          </h2>
          <p style={{ marginBottom: 24 }}>
            La Seleção de 2026 n'est plus celle de 2018 ou de 2022. Elle n'est plus dépendante d'un seul homme ni condamnée au soliloque de sa superstar. Portée par la vitesse foudroyante de Vinícius Júnior, la créativité de Raphinha et la fougue printanière d'Endrick, le Brésil s'est doté d'une artillerie moderne et diversifiée.
          </p>
          <p style={{ marginBottom: 40 }}>
            Dans cette constellation, Neymar ne sera plus le dynamiteur solitaire obligé de tout créer par le dribble. Il sera le chef d'orchestre. Un numéro 10 cérébral, dictant le tempo, distillant les ballons dans le bon espace, et libérant la pression physique pour ses jeunes lieutenants. Un rôle de guide technique et de mentor taillé pour sa maturité nouvelle.
          </p>

          {/* Section 3 */}
          <h2 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 36,
            fontWeight: 800,
            color: "#FDE100",
            textTransform: "uppercase",
            marginTop: 40,
            marginBottom: 24,
            letterSpacing: "0.02em"
          }}>
            La dernière danse : L'obsession de l'étoile
          </h2>
          <p style={{ marginBottom: 24 }}>
            Cette Coupe du Monde 2026 sonne irrémédiablement comme le crépuscule d'une idole polarisante. C'est l'obsession d'une vie, le rêve d'une sixième étoile brodée sur le maillot jaune. Au-delà des critiques sur son état de forme et son hygiène de vie, Neymar sait que l'histoire ne retient que les vainqueurs de la finale du dimanche. 
          </p>
          <p style={{ marginBottom: 40 }}>
            Gagner en Amérique du Nord serait sa rédemption absolue, celle qui le placerait définitivement au panthéon du football brésilien aux côtés des géants. C'est la dernière danse d'un prince qui refuse de laisser le trône vide sans avoir livré son combat le plus noble.
          </p>
          
          {/* Author Tag */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 80, paddingTop: 40, borderTop: "1px solid rgba(253, 225, 0, 0.2)" }}>
             <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #009B3A 0%, #004D1D 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20, color: "#fff", boxShadow: "0 0 20px rgba(0, 155, 58, 0.3)", border: "2px solid #FDE100" }}>
               LR
             </div>
             <div>
               <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>La Rédaction</div>
               <div style={{ fontSize: 14, color: "rgba(253, 225, 0, 0.8)" }}>Expert Football Sud-Américain</div>
             </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}
