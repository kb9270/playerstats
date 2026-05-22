import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Clock, Share2, Bookmark } from "lucide-react";
import { motion, useScroll, useSpring } from "framer-motion";

export default function ArticleNeymar() {
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
      backgroundImage: "url('/assets/neymar.png')",
      backgroundSize: "cover",
      backgroundPosition: "center top",
      backgroundAttachment: "fixed",
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
          background: "linear-gradient(90deg, #009B3A, #FDE100)",
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
            borderBottom: "1px solid rgba(253,225,0,0.2)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 24px", zIndex: 9999
          }}
        >
          <button onClick={() => setLocation("/")} style={{ background: "none", border: "none", color: "#fff", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, textTransform: "uppercase", fontWeight: 600 }}>
            <ArrowLeft size={20} /> Retour
          </button>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 800, letterSpacing: "0.1em", color: "#FDE100" }}>
            THE RACE <span style={{ color: "#fff" }}>MAGAZINE</span>
          </div>
          <div style={{ display: "flex", gap: 16, color: "rgba(253,225,0,0.8)" }}>
            <Share2 size={18} style={{ cursor: "pointer" }} />
            <Bookmark size={18} style={{ cursor: "pointer" }} />
          </div>
        </motion.div>

        {/* Bouton retour */}
        <motion.button
          animate={{ opacity: isScrolled ? 0 : 1, pointerEvents: isScrolled ? "none" : "auto" }}
          onClick={() => setLocation("/")}
          style={{
            position: "fixed", top: 32, left: 32, zIndex: 999,
            background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(253,225,0,0.3)", color: "#FDE100",
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
            style={{ maxWidth: 840, padding: "0 40px", textAlign: "center" }}
          >
            <div style={{ display: "inline-block", padding: "6px 16px", background: "rgba(0,155,58,0.15)", border: "1px solid rgba(253,225,0,0.4)", color: "#FDE100", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 24, borderRadius: 30 }}>
              Analyse Exclusive
            </div>
            <h1 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "clamp(42px, 6vw, 80px)", fontWeight: 900, color: "#fff",
              margin: 0, textTransform: "uppercase", lineHeight: 1.05,
              letterSpacing: "-0.02em", textShadow: "0 4px 30px rgba(0,0,0,0.9)"
            }}>
              BRÉSIL : Le retour du prince ?
            </h1>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginTop: 28, color: "rgba(255,255,255,0.7)", fontFamily: "'Barlow', sans-serif", fontSize: 14 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Clock size={16} color="#FDE100" /> 5 min de lecture</span>
              <span style={{ color: "#009B3A" }}>|</span>
              <span style={{ textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Par Khalil</span>
            </div>
          </motion.div>
        </div>

        {/* Contenu de l'article */}
        <div style={{ maxWidth: 760, width: "100%", padding: "0 24px 100px 24px", fontFamily: "'Barlow', sans-serif", lineHeight: 1.8, color: "rgba(255,255,255,0.9)", fontSize: 18 }}>

          <p style={{ fontSize: 22, lineHeight: 1.6, color: "#fff", marginBottom: 48 }}>
            <span style={{ float: "left", fontSize: 88, lineHeight: 0.8, paddingRight: 14, paddingTop: 6, fontFamily: "'Barlow Condensed', serif", fontWeight: 900, color: "#FDE100" }}>L</span>
            e peuple brésilien retient son souffle. Après des mois d'une agonie physique silencieuse, marquée par cette terrible rupture des ligaments croisés antérieurs sous le ciel lourd de Montevideo, et un retour triomphant mais sous pression dans son club formateur de Santos, Neymar da Silva Santos Júnior s'apprête à revêtir la tunique sacrée de la Seleção. Pour beaucoup, c'est l'étincelle ultime. Le retour de l'artiste déchu, venu réclamer sa couronne avant la grande messe nord-américaine de 2026.
          </p>

          <hr style={{ border: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(253,225,0,0.3), transparent)", margin: "48px 0" }} />

          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 34, fontWeight: 800, color: "#FDE100", textTransform: "uppercase", marginBottom: 20 }}>
            Le défi physique et mental : La résilience à 34 ans
          </h2>
          <p style={{ marginBottom: 24 }}>
            À 34 ans (l'âge qu'il aura lors du tournoi), après tant de cicatrices, d'opérations et de soirées d'amertume, la question brûle les lèvres : Neymar a-t-il encore les jambes et le coffre pour le très haut niveau international ? Le football moderne n'attend pas ; il broie les nostalgiques et les corps fatigués.
          </p>
          <p style={{ marginBottom: 40 }}>
            Pourtant, chez Ney, la résilience n'est pas un vain mot. C'est un moteur intime, alimenté par le désir viscéral de laver l'affront des échecs passés. Ses séances de rééducation spartiates, partagées sur ses réseaux, témoignent d'un homme qui refuse d'abdiquer devant l'usure du temps. Son retour sur les terrains est un défi lancé à la science et à ses détracteurs.
          </p>

          {/* Citation */}
          <div style={{ margin: "48px 0", padding: "32px 40px", borderLeft: "4px solid #FDE100", background: "rgba(253,225,0,0.05)", borderRadius: "0 12px 12px 0" }}>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 700, lineHeight: 1.4, color: "#fff", margin: 0, fontStyle: "italic" }}>
              "Son retour sur les terrains est un défi lancé à la science et à ses détracteurs. Une quête d'éternité."
            </p>
          </div>

          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 34, fontWeight: 800, color: "#FDE100", textTransform: "uppercase", marginBottom: 20 }}>
            Chef d'orchestre dans l'ombre des flèches
          </h2>
          <p style={{ marginBottom: 24 }}>
            La Seleção de 2026 n'est plus celle de 2018 ou de 2022. Elle n'est plus dépendante d'un seul homme ni condamnée au soliloque de sa superstar. Portée par la vitesse foudroyante de Vinícius Júnior, la créativité de Raphinha et la fougue printanière d'Endrick, le Brésil s'est doté d'une artillerie moderne et diversifiée.
          </p>
          <p style={{ marginBottom: 40 }}>
            Dans cette constellation, Neymar ne sera plus le dynamiteur solitaire obligé de tout créer par le dribble. Il sera le chef d'orchestre. Un numéro 10 cérébral, dictant le tempo, distillant les ballons dans le bon espace, et libérant la pression physique pour ses jeunes lieutenants. Un rôle de guide technique et de mentor taillé pour sa maturité nouvelle.
          </p>

          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 34, fontWeight: 800, color: "#FDE100", textTransform: "uppercase", marginBottom: 20 }}>
            La dernière danse : L'obsession de l'étoile
          </h2>
          <p style={{ marginBottom: 24 }}>
            Cette Coupe du Monde 2026 sonne irrémédiablement comme le crépuscule d'une idole polarisante. C'est l'obsession d'une vie, le rêve d'une sixième étoile brodée sur le maillot jaune. Au-delà des critiques sur son état de forme et son hygiène de vie, Neymar sait que l'histoire ne retient que les vainqueurs de la finale du dimanche.
          </p>
          <p style={{ marginBottom: 40 }}>
            Gagner en Amérique du Nord serait sa rédemption absolue, celle qui le placerait définitivement au panthéon du football brésilien aux côtés des géants. C'est la dernière danse d'un prince qui refuse de laisser le trône vide sans avoir livré son combat le plus noble.
          </p>

          {/* Auteur */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 64, paddingTop: 32, borderTop: "1px solid rgba(253,225,0,0.2)" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg, #009B3A, #004D1D)", border: "2px solid #FDE100", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, color: "#fff" }}>K</div>
            <div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, color: "#fff", textTransform: "uppercase" }}>Khalil</div>
              <div style={{ fontSize: 13, color: "rgba(253,225,0,0.8)" }}>Expert Football Sud-Américain</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
