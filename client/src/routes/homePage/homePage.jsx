import { useContext } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import SearchBar from "../../components/searchBar/SearchBar";
import ScrollAnimations from "../../components/ScrollAnimations/ScrollAnimations";
import "./homePage.scss";
import { AuthContext } from "../../context/AuthContext";

function HomePage() {
  const { t } = useTranslation();
  const { currentUser } = useContext(AuthContext);

  return (
    <div className="homePage" key={i18n.language}>
      <ScrollAnimations />
      {/* Floating Elements */}
      <div className="floating-elements">
        <div className="floating-icon house-icon">🏠</div>
        <div className="floating-icon key-icon">🗝️</div>
        <div className="floating-icon building-icon">🏢</div>
        <div className="floating-icon heart-icon">❤️</div>
        <div className="floating-icon star-icon">⭐</div>
        <div className="floating-icon leaf-icon">🍃</div>
        <div className="floating-icon dream-icon">💭</div>
        <div className="floating-icon peace-icon">🕊️</div>
      </div>
      
      {/* Particle System */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`}></div>
        ))}
      </div>

      {/* Gentle Waves Background */}
      <div className="gentle-waves">
        <div className="wave wave-1"></div>
        <div className="wave wave-2"></div>
        <div className="wave wave-3"></div>
      </div>

      {/* Floating Bubbles */}
      <div className="floating-bubbles">
        {[...Array(8)].map((_, i) => (
          <div key={i} className={`bubble bubble-${i + 1}`}></div>
        ))}
      </div>
      <div className="textContainer">
        <div className="wrapper">
          <h1 className="title fade-up">{t('homepage.title')}</h1>
          <p className="subtitle fade-up">
            {t('homepage.subtitle')}
          </p>
          <div className="fade-up">
            <SearchBar />
          </div>
          <div className="boxes stagger-children">
            <div className="box enhanced-hover">
              <h1>16+</h1>
              <h2>{t('homepage.experience')}</h2>
            </div>
            <div className="box enhanced-hover">
              <h1>200</h1>
              <h2>{t('homepage.awards')}</h2>
            </div>
            <div className="box enhanced-hover">
              <h1>2000+</h1>
              <h2>{t('homepage.properties')}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="imgContainer">
        <div className="imageGrid stagger-children">
          <img
            src="https://images.unsplash.com/photo-1599427303058-f04cbcf4756f?auto=format&fit=crop&w=400&q=80"
            alt="Building 1"
            className="enhanced-hover scale-in"
          />
          <img
            src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80"
            className="circle enhanced-hover scale-in"
            alt="Building 2"
          />
          <img
            src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=400&q=80"
            alt="Building 3"
            className="enhanced-hover scale-in"
          />
          <img
            src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=400&q=80"
            alt="Building 4"
            className="enhanced-hover scale-in"
          />
        </div>
      </div>
    </div>
  );
}

export default HomePage;


