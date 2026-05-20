import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function ArticleNeymar() {
  const [, setLocation] = useLocation();

  return (
    <div style={{ backgroundColor: "#0B0F19", minHeight: "100vh", color: "#fff", display: "flex", justifyContent: "center" }}>
      <div 
        style={{
          backgroundColor: "#0d1527",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          width: "100%",
          maxWidth: 800,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          boxShadow: "0 0 40px rgba(0, 0, 0, 0.6)"
        }}
      >
        {/* Header Image */}
        <div style={{
          position: "relative",
          width: "100%",
          height: 350,
          backgroundImage: "url('/assets/neymar.png')",
          backgroundSize: "cover",
          backgroundPosition: "center 20%"
        }}>
          {/* Dark overlay inside image */}
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(to top, #0d1527 0%, rgba(13, 21, 39, 0.4) 60%, rgba(0, 0, 0, 0.3) 100%)"
          }} />
          {/* Back button */}
          <button 
            onClick={() => setLocation("/")}
            style={{
              position: "absolute",
              top: 24,
              left: 24,
              background: "rgba(0, 0, 0, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#fff",
              borderRadius: "50%",
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "background 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(232, 52, 74, 0.8)"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.6)"}
          >
            <ArrowLeft size={20} />
          </button>
          {/* Title on Header */}
          <div style={{
            position: "absolute",
            bottom: 24,
            left: 32,
            right: 32
          }}>
            <div style={{
              fontSize: 12,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              color: "#E8344A",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: 8
            }}>
              So Foot Premium • Analyse Exclusive
            </div>
            <h1 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 42,
              fontWeight: 900,
              color: "#fff",
              margin: 0,
              textTransform: "uppercase",
              lineHeight: 1.1
            }}>
              BRÉSIL : Le retour du prince ?
            </h1>
          </div>
        </div>

        {/* Article Content */}
        <div style={{
          padding: "32px 40px 60px 40px",
          fontFamily: "'Barlow', sans-serif",
          lineHeight: 1.6,
          color: "rgba(255, 255, 255, 0.85)",
          fontSize: 16
        }}>
          {/* Introduction */}
          <p style={{
            fontSize: 18,
            fontWeight: 600,
            lineHeight: 1.55,
            color: "#fff",
            marginBottom: 24,
            borderLeft: "4px solid #E8344A",
            paddingLeft: 20
          }}>
            Le peuple brésilien retient son souffle. Après des mois d'une agonie physique silencieuse, marquée par cette terrible rupture des ligaments croisés antérieurs sous le ciel lourd de Montevideo, et un exil doré mais contesté dans le désert saoudien d'Al-Hilal, Neymar da Silva Santos Júnior s'apprête à revêtir la tunique sacrée de la Seleção. Pour beaucoup, c'est l'étincelle ultime. Le retour de l'artiste déchu, venu réclamer sa couronne avant la grande messe nord-américaine de 2026.
          </p>

          {/* Section 1 */}
          <h2 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 24,
            fontWeight: 800,
            color: "#fff",
            textTransform: "uppercase",
            marginTop: 32,
            marginBottom: 12,
            letterSpacing: "0.02em"
          }}>
            Le défi physique et mental : La résilience à 34 ans
          </h2>
          <p style={{ marginBottom: 16 }}>
            À 34 ans (l'âge qu'il aura lors du tournoi), après tant de cicatrices, d'opérations et de soirées d'amertume, la question brûle les lèvres : Neymar a-t-il encore les jambes et le coffre pour le très haut niveau international ? Le football moderne n'attend pas ; il broie les nostalgiques et les corps fatigués. 
          </p>
          <p style={{ marginBottom: 24 }}>
            Pourtant, chez Ney, la résilience n'est pas un vain mot. C'est un moteur intime, alimenté par le désir viscéral de laver l'affront des échecs passés. Ses séances de rééducation spartiates, partagées sur ses réseaux, témoignent d'un homme qui refuse d'abdiquer devant l'usure du temps. Son retour sur les terrains est un défi lancé à la science et à ses détracteurs.
          </p>

          {/* Section 2 */}
          <h2 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 24,
            fontWeight: 800,
            color: "#fff",
            textTransform: "uppercase",
            marginTop: 32,
            marginBottom: 12,
            letterSpacing: "0.02em"
          }}>
            Le nouveau rôle : Chef d'orchestre dans l'ombre des flèches
          </h2>
          <p style={{ marginBottom: 16 }}>
            La Seleção de 2026 n'est plus celle de 2018 ou de 2022. Elle n'est plus dépendante d'un seul homme ni condamnée au soliloque de sa superstar. Porté par la vitesse foudroyante de Vinícius Júnior, le génie clinique de Rodrygo et la fougue printanière d'Endrick, le Brésil s'est doté d'une artillerie moderne et diversifiée.
          </p>
          <p style={{ marginBottom: 24 }}>
            Dans cette constellation, Neymar ne sera plus le dynamiteur solitaire obligé de tout créer par le dribble. Il sera le chef d'orchestre. Un numéro 10 cérébral, dictant le tempo, distillant les ballons dans le bon espace, et libérant la pression physique pour ses jeunes lieutenants. Un rôle de guide technique et de mentor taillé pour sa maturité nouvelle.
          </p>

          {/* Section 3 */}
          <h2 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 24,
            fontWeight: 800,
            color: "#fff",
            textTransform: "uppercase",
            marginTop: 32,
            marginBottom: 12,
            letterSpacing: "0.02em"
          }}>
            La dernière danse : L'obsession de l'étoile
          </h2>
          <p style={{ marginBottom: 16 }}>
            Cette Coupe du Monde 2026 sonne irrémédiablement comme le crépuscule d'une idole polarisante. C'est l'obsession d'une vie, le rêve d'une sixième étoile brodée sur le maillot jaune. Au-delà des critiques sur son exil saoudien et son hygiène de vie, Neymar sait que l'histoire ne retient que les vainqueurs de la finale du dimanche. 
          </p>
          <p style={{ marginBottom: 0 }}>
            Gagner en Amérique du Nord serait sa rédemption absolue, celle qui le placerait définitivement au panthéon du football brésilien aux côtés des géants. C'est la dernière danse d'un prince qui refuse de laisser le trône vide sans avoir livré son combat le plus noble.
          </p>
        </div>
      </div>
    </div>
  );
}
