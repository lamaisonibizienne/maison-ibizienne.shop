import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ShoppingBag, X, Instagram, Facebook, Loader, ChevronRight, Menu, ArrowLeft, Heart, ChevronDown, Minus, Plus, ChevronLeft, Send, MessageSquare, Eye } from 'lucide-react';

// ==============================================================================
// 1. CONFIGURATION TECHNIQUE & STYLE
// ==============================================================================

// Configuration Tailwind CSS (Assumée disponible dans l'environnement)
const TailwindConfig = `
  tailwind.config = {
    theme: {
      extend: {
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
          serif: ['Playfair Display', 'serif'],
        },
        colors: {
          'stone-900': '#1c1c1c', // Dark Charcoal
          'stone-500': '#7d7d7d', // Medium Gray
          'stone-100': '#f5f5f5', // Light Gray
          'finca-light': '#FDFBF7', // Off-White Background
          'finca-medium': '#F0EBE5', // Beige/Sand
        },
      }
    }
  }
`;

// Paramètres Shopify API (Nécessitent un jeton d'accès et un domaine valides)
const DEFAULT_ACCESS_TOKEN = '4b2746c099f9603fde4f9639336a235d'; 
const DEFAULT_SHOPIFY_DOMAIN = '91eg2s-ah.myshopify.com';

const STOREFRONT_ACCESS_TOKEN = (typeof process !== 'undefined' && process.env.REACT_APP_SHOPIFY_STOREFRONT_ACCESS_TOKEN) 
  ? process.env.REACT_APP_SHOPIFY_STOREFRONT_ACCESS_TOKEN 
  : DEFAULT_ACCESS_TOKEN;

const SHOPIFY_DOMAIN = (typeof process !== 'undefined' && process.env.REACT_APP_SHOPIFY_DOMAIN) 
  ? process.env.REACT_APP_SHOPIFY_DOMAIN 
  : DEFAULT_SHOPIFY_DOMAIN;

const API_VERSION = '2024-01';


// Définition des couleurs principales pour les composants
const COLOR_LIGHT = '#FDFBF7'; // finca-light
const COLOR_MEDIUM = '#F0EBE5'; // finca-medium


// ==============================================================================
// 2. CONFIGURATION DU CONTENU (TEXTES, LIENS, IMAGES - Modifiables ici)
// ==============================================================================

/**
 * Tous les textes, liens et images non gérés directement par l'API Shopify
 * sont regroupés ici pour un paramétrage simple par l'utilisateur final.
 */
const SITE_CONFIG = {
  // --- SECTION HÉRO ---
  HERO: {
    VIDEO_URL: "https://cdn.shopify.com/videos/c/o/v/c4d96d8c70b64465835c4eadaa115175.mp4",
    SURTITLE: "Slow Living",
    TITLE: "L'Esprit\nMéditerranéen",
    BUTTON_TEXT: "Explorer"
  },

  // --- SECTION MEUBLES SUR MESURE ---
  CUSTOM_FURNITURE: {
    IMAGE_URL: "https://cdn.shopify.com/s/files/1/0943/4005/5378/files/image_2.jpg?v=1765479001",
    TEXT: "Nous réalisons vos meubles sur mesure",
  },

  // --- SECTION MATÉRIAUX / VALEURS (Bloc répétable) ---
  MATERIALS: [
    {
      TITLE: "Bois d'Olivier & Teck",
      TEXT: "Des bois nobles, robustes et patinés par le temps."
    },
    {
      TITLE: "Fibres Naturelles",
      TEXT: "Jute, rotin, osier. Tressés à la main pour apporter chaleur et texture."
    },
    {
      TITLE: "Artisanat",
      TEXT: "Chaque pièce est unique, façonnée par des mains expertes."
    }
  ],
  
  // --- SECTION COACHING / SERVICE (Bloc image/texte) ---
  COACHING: {
    IMAGE_URL: "https://cdn.shopify.com/s/files/1/0943/4005/5378/files/Deco.jpg?v=1765477933", 
    SURTITLE: "Notre Expertise",
    TITLE: "Transformer votre cocon, l'Art du Conseil.",
    DESCRIPTION: "Notre service de coaching et d'accompagnement dépasse la simple décoration. Nous concevons ensemble un style de vie complet, de l'architecture à la sélection de chaque pièce artisanale.",
    ADVANTAGES: [
      "Design d'intérieur personnalisé.",
      "Sourcing d'artisans.",
      "Gestion de projet et rénovation."
    ],
    BUTTON_TEXT: "Découvrir le Coaching"
  },

  // --- LIENS SOCIAUX ET EXTERNES (Utilisés dans le Footer) ---
  SOCIAL_LINKS: {
    CONTACT_URL: "#contact", 
    DELIVERY_URL: "#delivery", 
    PHILOSOPHY_URL: "#philosophy", 
    
    INSTAGRAM_URL: "https://www.instagram.com/lamaisonibizienne", 
    INSTAGRAM_HANDLE: "@lamaisonibizienne",
    FACEBOOK_URL: "https://www.facebook.com/lamaisonibizienne", 
    TIKTOK_URL: "https://www.tiktok.com/@la.maison.ibizienne",
  },
  
  // --- TEXTES DIVERS / NAVIGATION ---
  SECTIONS: {
    UNIVERS: "Nos Univers",
    BOUTIQUE: "La Boutique",
    JOURNAL_TITLE: "Le Journal",
    JOURNAL_SUBTITLE: "Inspirations",
    JOURNAL_LINK: "Toutes les histoires",
    NOUVEAUTES_TITLE: "Nos Nouveautés",
    NOUVEAUTES_SUBTITLE: "Frais et Tendance",
  },
  FOOTER: {
    ABOUT: "Art de vivre méditerranéen.\nFait main par nos artisans."
  }
};


// ==============================================================================
// 3. PARAMÈTRES DE DESIGN & NETTOYAGE
// ==============================================================================

const DESIGN_CONFIG = {
  COLLECTION_ITEM_WIDTH: "w-[80vw] md:w-[400px] lg:w-[450px]",
  PRODUCT_ITEM_WIDTH: "w-[60vw] sm:w-[50vw] md:w-[350px] lg:w-[300px]",
  JOURNAL_ITEM_WIDTH: "w-[65vw] sm:w-[45vw] md:w-[280px] lg:w-[300px]",
  // Nouvelle largeur pour les vignettes carrées
  NOUVEAUTES_ITEM_WIDTH: "w-[38vw] sm:w-[30vw] md:w-[200px] lg:w-[250px]",

  // Filtres pour nettoyer le contenu HTML importé des articles de blog Shopify
  ARTICLE_CLEANUP_FILTERS: [
    "Salon méditerranéen lumineux avec décoration naturelle harmonieuse",
    "Maison moderne avec extension – agrandissement et permis de construire",
    "www\\.lamaisonibizienne\\.com",
    "erreurs déco qui nuisent à l'harmonie d'un intérieur – et comment les éviter",
    "Un intérieur harmonieux se joue dans les détails\\. Découvrez 5 erreurs fréquentes en décoration d'intérieur et nos conseils simples pour les éviter\\.",
    "Immobilier haut de gamme",
    "Par La Maison Ibizienne – Architecture, Décoration & Accompagnement",
    "Ce que nous observons depuis le terrain, entre Ibiza, la Côte d'Azur et les villages cachés de Corse\\.",
    "tendances été 2025 : Ce que veulent les acheteurs exigeants aujourd'hui",
    "\\(et ce qu'ils fuient\\)",
    "Mieux vaut laisser vivre l'intérieur avant de le remplir\\.",
    "Pour vous aider à naviguer dans ce marché, nous avons condensé les 5 tendances majeures et les 5 erreurs à éviter absolument\\.",
    "Ce que nous proposons",
    "Chez La Maison Ibizienne, nous ne vous aidez pas simplement à acheter ou vendre\\.",
    "Nous révélons le potentiel de votre bien\\.",
    "Et nous créons un environnement qui parle à vos futurs acquéreurs dès la première visite\\.",
    "Un excès d'éclectisme peut nuire à la cohérence visuelle\\. Il est important de choisir une ligne directrice pour créer une harmonie fluide et agréable\\.",
    "Une maison mal éclairée semble triste, même bien décorée\\. Multipliez les sources douces : suspensions, lampes d'ambiance, lumière naturelle\\.",
    "Choisir une couleur sans penser au reste de l'espace \\(mobilier, sol, lumière\\) peut rompre l'équilibre\\. Privilégiez une palette cohérente et naturelle\\.",
    "Le vide n'est pas un manque, mais une respiration\\. Des zones dégagées donnent du relief et valorisent les éléments décoratifs présents\\.",
    // Fragments JSON potentiellement visibles
    "\"@context\":",
    "\"@type\":",
    "\"headline\":",
    "\"description\":",
    "\"image\":",
    "\"author\":",
    "\"name\":",
    "\"url\":",
    "\"datePublished\":",
    "\"publisher\":",
    "\"mainEntityOfPage\":",
    "\"https://www\\.votresite\\.com/assets/[a-zA-Z0-9-]+\\.jpg\"",
    "\\{\\s*",
    "\\}\\s*",
  ]
}


// ==============================================================================
// 4. HOOKS ET LOGIQUE D'ANIMATION
// ==============================================================================

const useIntersectionObserver = (options) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
      }
    }, options);

    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    return () => {
      if (targetRef.current) {
        observer.unobserve(targetRef.current);
      }
    };
  }, [options]);

  return [targetRef, isIntersecting];
};

const ScrollFadeIn = ({ children, delay = 0, threshold = 0.1, className = "", initialScale = 1.0 }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: threshold });
  
  const baseClasses = 'transition-all duration-1000 ease-out';
  const visibleClasses = 'opacity-100 translate-y-0 scale-100';
  
  // Correction de fluidité: Réduction de la translation verticale à translate-y-8
  const hiddenClasses = `opacity-0 translate-y-8 scale-[${initialScale}]`;

  return (
    <div
      ref={ref}
      className={`${baseClasses} ${className} ${isVisible ? visibleClasses : hiddenClasses}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const ScrollStickyWrapper = ({ children, bgColor, zIndex, minHeightClass = 'min-h-[120vh]' }) => {
    return (
        <div 
            className={`relative ${minHeightClass}`} 
            style={{ backgroundColor: bgColor }}
        >
            <div 
                className="sticky top-0 w-full h-full"
                style={{ zIndex: zIndex }}
            >
                {children}
            </div>
        </div>
    );
};


// ==============================================================================
// 5. LOGIQUE API & FALLBACKS
// ==============================================================================

const proceedToCheckout = (cartItems) => {
  if (cartItems.length === 0) return;
  const itemsString = cartItems.map(item => {
    let variantId = item.selectedVariantId?.split('/').pop(); 
    if (!variantId) variantId = item.variants?.edges?.[0]?.node?.id?.split('/').pop();
    if (!variantId) variantId = item.id.split('/').pop();
    return `${variantId}:${item.quantity || 1}`;
  }).join(',');
  
  // Simulation de la redirection vers le paiement
  window.open(`https://${SHOPIFY_DOMAIN}/cart/${itemsString}`, '_blank');
};

async function fetchShopifyData() {
  const query = `
  {
    shop { name description }
    collections(first: 10) { 
      edges {
        node {
          id title handle
          image { url }
          products(first: 8) {
            edges {
              node {
                id title handle description productType tags
                priceRange { minVariantPrice { amount currencyCode } }
                images(first: 5) { edges { node { url } } }
                variants(first: 20) { 
                  edges { 
                    node { 
                      id 
                      title 
                      price { amount currencyCode }
                      image { url }
                    } 
                  } 
                }
                # Pour la description, nous avons besoin de contentHtml
                descriptionHtml
              }
            }
          }
        }
      }
    }
    blogs(first: 1) {
      edges {
        node {
          handle
          articles(first: 10) {
            edges {
              node {
                id title excerpt publishedAt handle
                image { url }
                contentHtml 
                authorV2 { name }
              }
            }
          }
        }
      }
    }
  }
  `;

  try {
    const storefrontAccessToken = STOREFRONT_ACCESS_TOKEN;
    const shopifyDomain = SHOPIFY_DOMAIN;

    if (!shopifyDomain || storefrontAccessToken === DEFAULT_ACCESS_TOKEN) {
      console.warn("ATTENTION: Les identifiants Shopify sont par défaut. Les données produits/collections pourraient ne pas être à jour. EN PRODUCTION, configurez les variables d'environnement.");
    }

    const response = await fetch(`https://${shopifyDomain}/api/${API_VERSION}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
      },
      body: JSON.stringify({ query }),
    });
    const json = await response.json();
    return json.data;
  } catch (error) { 
    console.error("Erreur lors de la récupération des données Shopify:", error);
    return null; 
  }
}

const FALLBACK_DATA = { 
  shop: { name: "LA MAISON" }, 
  collections: { edges: [] }, 
  blogs: { edges: [] } 
};


// ==============================================================================
// 6. COMPOSANTS DESIGN
// ==============================================================================

const CollectionCard = ({ collection, onClickProduct, onQuickAddToCart }) => {
  // CollectionCard est principalement pour naviguer dans une catégorie,
  // nous affichons l'image de la collection, ou la première du premier produit.
  const product = collection.products?.edges?.[0]?.node;
  const image = collection.image?.url || product?.images?.edges?.[0]?.node?.url;

  return (
    <div className="bg-finca-medium group cursor-pointer hover:shadow-lg transition-shadow duration-300 rounded-lg overflow-hidden">
      <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
        <img 
          src={image || "https://placehold.co/800x1000/F0EBE5/7D7D7D?text=Collection"} 
          alt={collection.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-stone-900/5 transition-opacity duration-300 group-hover:opacity-0"></div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-serif text-stone-900 mb-2">{collection.title}</h3>
        <p className="text-stone-500 text-xs uppercase tracking-widest font-sans">
          {collection.products?.edges?.length || 0} Produits
        </p>
        {/* Bouton pour ajouter le premier produit de la collection (si disponible) */}
        {product && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onQuickAddToCart(product);
            }}
            className="mt-4 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-stone-900 hover:text-stone-500 transition-colors group"
          >
            Ajouter au panier <ShoppingBag size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
};

// Composant pour l'affichage des produits avec carrousel sur interaction (touch/hover)
const HoverImageCarouselCard = ({ product, onClick, onAddToCart, onShowDescription, aspectClass }) => {
  const images = product.images?.edges?.map(e => e.node.url) || [];
  const [imageIndex, setImageIndex] = useState(0); 
  const [isHovered, setIsHovered] = useState(false);
  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  // Gère l'état de survol pour l'apparition des boutons (uniquement sur desktop)
  const handleMouseEnter = () => !isTouchDevice && setIsHovered(true);
  const handleMouseLeave = () => !isTouchDevice && setIsHovered(false);

  // LOGIQUE DE NAVIGATION POUR MOBILE/TACTILE
  const goNext = (e) => {
    e.stopPropagation();
    setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goPrev = (e) => {
    e.stopPropagation();
    setImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };
  
  // LOGIQUE DE NAVIGATION POUR DESKTOP (basée sur la position de la souris)
  const handleMouseMove = (e) => {
    if (!isTouchDevice && images.length > 1) {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const normalizedX = x / rect.width;
      
      const segmentWidth = 1 / images.length;
      const newIndex = Math.floor(normalizedX / segmentWidth);
      
      if (newIndex !== imageIndex) {
        setImageIndex(newIndex);
      }
    }
  };

  const currentImage = images[imageIndex] || "https://placehold.co/800x1000/F0EBE5/7D7D7D?text=Produit";
  const price = product.priceRange?.minVariantPrice?.amount || '0';
  const currency = product.priceRange?.minVariantPrice?.currencyCode || 'EUR';
  
  // Déterminer si le bouton flottant "Add to Cart" doit être visible
  const showFloatingButtons = isHovered || isTouchDevice;

  return (
    <div 
      // Sur mobile, le clic ouvre la description (la logique de l'Œil)
      onClick={(e) => { 
        if (isTouchDevice) {
            e.preventDefault(); 
            onShowDescription(product);
        }
      }} 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onTouchStart={() => setIsHovered(true)} // Déclenche l'affichage des flèches sur touch
      className="group cursor-pointer transition-shadow duration-300 rounded-lg overflow-hidden bg-finca-light relative"
    >
      <div className={`relative ${aspectClass} overflow-hidden bg-stone-100`}>
        <img 
          src={currentImage} 
          alt={product.title} 
          key={currentImage} 
          className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
        />
        
        {/* --- ÉLÉMENTS FLOTTANTS DE CONVERSION (Style Zoco Home) --- */}

        {/* Bouton Quick View / Eye icon (en haut à droite, Ouvre la description) */}
        <button 
          onClick={(e) => { e.stopPropagation(); onShowDescription(product); }}
          className={`absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-stone-900 transition-opacity duration-300 z-30 
                      ${showFloatingButtons ? 'opacity-100' : 'opacity-0'}`}
          aria-label="Voir la description"
        >
          <Eye size={16} strokeWidth={1.5} />
        </button>

        {/* Bouton "Ajouter au Panier" (Flottant en bas, Ouvre le sélecteur de variantes/quantité) */}
        <div 
            className={`absolute inset-x-0 bottom-0 z-30 transition-transform duration-300 
                        ${showFloatingButtons ? 'translate-y-0' : 'translate-y-full'}`}
        >
            <button 
                onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                // Fond noir opaque comme chez Zoco Home
                className="w-full bg-stone-900 text-white py-3 uppercase tracking-widest text-[11px] font-bold hover:bg-stone-700 transition-colors"
                aria-label="Ajouter au panier (choix des options)"
            >
                Ajouter au panier
            </button>
        </div>
        
        {/* Navigation Mobile/Tactile (Visible si images > 1 ET appareil tactile touché) */}
        {isTouchDevice && images.length > 1 && isHovered && (
            <>
                <button 
                    onClick={goPrev} 
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/30 text-white rounded-full transition-opacity hover:bg-black/50 z-30"
                >
                    <ChevronLeft size={16} />
                </button>
                <button 
                    onClick={goNext} 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/30 text-white rounded-full transition-opacity hover:bg-black/50 z-30"
                >
                    <ChevronRight size={16} />
                </button>
            </>
        )}

        {/* Indicateurs de progression (petits points) */}
        {images.length > 1 && (
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex space-x-1 p-1 bg-black/10 rounded-full z-30">
            {images.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  index === imageIndex ? 'bg-white scale-125' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Informations Produit */}
      <div className="p-4 pt-6 text-center">
        <h3 className="text-base font-serif text-stone-900 mb-1">{product.title}</h3>
        <p className="text-stone-500 text-[11px] uppercase tracking-widest font-sans mb-2">{product.productType}</p>
        <p className="text-sm font-medium text-stone-900">{Math.round(parseFloat(price))} {currency}</p>
      </div>
    </div>
  );
};


// Application de la nouvelle carte aux produits réguliers (3/4 aspect)
const ProductCard = (props) => (
  <HoverImageCarouselCard {...props} aspectClass="aspect-[3/4]" />
);

// Application de la nouvelle carte aux nouveautés (1/1 aspect)
const NouveautesProductCard = (props) => (
  <HoverImageCarouselCard {...props} aspectClass="aspect-[1/1]" />
);


const ArticleCard = ({ article, onClick }) => {
  const image = article.node.image?.url;
  
  return (
    <div 
      onClick={() => onClick(article)} 
      className="group cursor-pointer hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden bg-finca-medium"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        <img 
          src={image || "https://placehold.co/800x600/F0EBE5/7D7D7D?text=Journal"} 
          alt={article.node.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-6">
        <span className="text-[10px] uppercase tracking-widest font-sans text-stone-500 block mb-2">
            {new Date(article.node.publishedAt).toLocaleDateString()}
        </span>
        <h3 className="text-xl font-serif text-stone-900 leading-snug mb-2 group-hover:underline">{article.node.title}</h3>
        <p className="text-stone-500 text-sm italic line-clamp-2">{article.node.excerpt}</p>
      </div>
    </div>
  );
};


const Carousel = ({ title, subtitle, anchorId, itemWidth, children }) => {
  const scrollContainerRef = useRef(null);
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.2 });

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      // Défilement par la taille du conteneur (plus fluide que par item)
      const scrollAmount = current.clientWidth * 0.8; 
      
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    // Remplacement de py-24 par py-16
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full bg-finca-light">
      <section id={anchorId} className="w-full py-16">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12">
          <ScrollFadeIn threshold={0.1}>
            <div className="flex justify-between items-end mb-12 md:mb-16">
              <div>
                {subtitle && (
                  <span className="text-[10px] font-serif tracking-[0.3em] text-stone-400 uppercase mb-3 block">
                    {subtitle}
                  </span>
                )}
                <h2 className="text-3xl md:text-4xl font-serif text-stone-900 italic font-light">
                  {title}
                </h2>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => scroll('left')}
                  className="p-3 border border-stone-200 text-stone-900 hover:bg-stone-900 hover:text-white transition-colors rounded-full"
                  aria-label="Défiler à gauche"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => scroll('right')}
                  className="p-3 border border-stone-200 text-stone-900 hover:bg-stone-900 hover:text-white transition-colors rounded-full"
                  aria-label="Défiler à droite"
                >
                  <ChevronRight size={16} /> 
                </button>
              </div>
            </div>
          </ScrollFadeIn>

          <div
            ref={scrollContainerRef}
            // Changement pour un espace plus petit et style plus fun si c'est la section nouveauté
            className={`flex overflow-x-scroll snap-x snap-mandatory ${anchorId === 'nouveautes' ? 'space-x-4 md:space-x-6' : 'space-x-6 md:space-x-10'} pb-4 md:pb-8 transition-shadow duration-500`}
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none', 
            }}
            onMouseEnter={() => scrollContainerRef.current.style.boxShadow = 'inset 0 -5px 10px rgba(0,0,0,0.05)'}
            onMouseLeave={() => scrollContainerRef.current.style.boxShadow = 'none'}
          >
            {React.Children.map(children, (child, index) => (
              <ScrollFadeIn key={index} delay={index * 100} threshold={0.5} className={`flex-shrink-0 snap-center ${itemWidth}`}>
                {child}
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const CartSidebar = ({ cartItems, isCartOpen, onClose, onUpdateQuantity, onRemove, onCheckout }) => {
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (parseFloat(item.price) * item.quantity);
  }, 0);

  // Formattage du prix (simplifié)
  const formatPrice = (amount) => `${Math.round(amount)} €`;

  return (
    <div 
      // FOND OPAQUE BLANC PUR pour maximiser la lisibilité
      className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 transition-transform duration-500 ease-in-out border-l border-stone-200 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className="flex justify-between items-center p-6 border-b border-stone-200">
        <h2 className="font-serif text-2xl text-stone-900">Panier ({cartItems.length})</h2>
        <button onClick={onClose} className="text-stone-500 hover:text-stone-900"><X size={24} /></button>
      </div>

      <div className="p-6 h-[calc(100vh-180px)] overflow-y-auto">
        {cartItems.length === 0 ? (
          <div className="text-center py-20 text-stone-500 font-serif italic">Votre panier est vide.</div>
        ) : (
          <div className="space-y-6">
            {cartItems.map(item => (
              <div key={item.variantId} className="flex gap-4 border-b border-stone-100 pb-4 last:border-b-0">
                <div className="w-20 h-24 bg-stone-100 flex-shrink-0 rounded-sm overflow-hidden">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-serif text-sm text-stone-900 line-clamp-2">{item.title}</h4>
                      <p className="text-xs text-stone-500 mt-1">{item.variantTitle}</p>
                    </div>
                    <button onClick={() => onRemove(item.variantId)} className="text-stone-400 hover:text-red-500"><X size={16} /></button>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3">
                    <p className="font-medium text-stone-900">{formatPrice(item.price * item.quantity)}</p>
                    <div className="flex items-center border border-stone-300 rounded-sm h-7">
                      <button onClick={() => onUpdateQuantity(item.variantId, item.quantity - 1)} className="px-2 h-full hover:bg-stone-100 text-stone-600 disabled:opacity-50" disabled={item.quantity <= 1}><Minus size={12} /></button>
                      <span className="px-2 text-xs w-6 text-center">{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item.variantId, item.quantity + 1)} className="px-2 h-full hover:bg-stone-100 text-stone-600"><Plus size={12} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="absolute bottom-0 w-full p-6 bg-white border-t border-stone-200">
        <div className="flex justify-between mb-4 text-lg font-bold text-stone-900">
          <span>Sous-total:</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <button 
          onClick={onCheckout}
          disabled={cartItems.length === 0}
          className="w-full bg-stone-900 text-white py-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-stone-700 transition-colors rounded-sm disabled:bg-stone-400"
        >
          Passer à la caisse
        </button>
      </div>
    </div>
  );
};

const Navbar = ({ logo, cartCount, onOpenCart, isArticleView, onBack }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const LogoComponent = () => (
    <div className={`text-2xl md:text-3xl lg:text-4xl font-serif tracking-[0.15em] font-bold text-center text-stone-900 whitespace-nowrap drop-shadow-sm transition-all duration-500 ${isArticleView ? 'cursor-default' : 'hover:opacity-80'}`}>
      {logo}
    </div>
  );

  if (isArticleView) {
    return (
      <nav className="fixed top-0 left-0 w-full z-50 bg-finca-light/95 backdrop-blur-md border-b border-stone-100 py-4 transition-all">
        <div className="max-w-[1200px] mx-auto px-6 flex justify-between items-center">
          <button onClick={onBack} className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold hover:text-stone-500 transition-colors group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Retour
          </button>
          <LogoComponent />
          <div className="w-16"></div> 
        </div>
      </nav>
    );
  }

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 border-b ${isScrolled ? 'bg-finca-light/95 backdrop-blur-md border-stone-200 py-4 shadow-sm' : 'bg-transparent border-transparent py-6'}`}>
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 grid grid-cols-12 items-start">
        <div className="col-span-4 hidden lg:flex gap-8 text-[10px] uppercase tracking-[0.25em] font-serif text-stone-900 pt-1">
          <a href="#collections" className="hover:text-stone-500 transition-colors whitespace-nowrap">Collections</a>
          <a href="#coaching" className="hover:text-stone-500 transition-colors whitespace-nowrap">Coaching</a>
          <a href="#journal-section" className="hover:text-stone-500 transition-colors whitespace-nowrap">Journal</a>
        </div>
        <div className="col-span-12 lg:col-span-4 flex justify-center order-first lg:order-none mb-4 lg:mb-0 lg:mt-5">
          <a href="#top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:opacity-80 transition-opacity">
            <LogoComponent />
          </a>
        </div>
        <div className="col-span-4 hidden lg:flex justify-end items-center gap-8 pt-1">
          <div className="relative cursor-pointer hover:opacity-60 transition-opacity flex items-center gap-2" onClick={onOpenCart}>
            <span className="hidden lg:inline-block text-[10px] uppercase tracking-[0.2em] font-serif mr-2 align-middle text-stone-900">Panier</span>
            <ShoppingBag size={18} strokeWidth={1.5} className="inline-block align-middle text-stone-900" />
            {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-stone-900 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full">{cartCount}</span>}
          </div>
        </div>
        <div className="lg:hidden absolute left-6 top-6"><Menu size={24} className="text-stone-900" /></div>
        <div className="lg:hidden absolute right-6 top-6" onClick={onOpenCart}>
          <ShoppingBag size={24} className="text-stone-900" />
          {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-stone-900 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full">{cartCount}</span>}
        </div>
      </div>
    </nav>
  );
};

const HeroSection = ({ onScroll }) => (
  <div id="top" className="relative h-[95vh] w-full flex flex-col justify-center items-center text-center px-4 overflow-hidden bg-finca-medium">
    <div className="absolute inset-0 z-0">
      <video className="w-full h-full object-cover animate-fade-in" autoPlay loop muted playsInline>
        <source src={SITE_CONFIG.HERO.VIDEO_URL} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-stone-900/10" />
    </div>
    <div className="relative z-10 pt-40 max-w-4xl animate-slide-up">
      <ScrollFadeIn delay={200} threshold={0.1}>
      <div className="bg-white/15 backdrop-blur-sm border border-white/20 p-8 md:p-14 inline-block shadow-2xl">
        <span className="text-[10px] uppercase tracking-[0.4em] text-white/90 mb-6 block font-serif drop-shadow-md">{SITE_CONFIG.HERO.SURTITLE}</span>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white mb-8 leading-[0.85] tracking-tight drop-shadow-xl whitespace-pre-line">{SITE_CONFIG.HERO.TITLE}</h1>
        <button onClick={onScroll} className="group relative overflow-hidden bg-finca-light text-stone-900 px-10 py-4 uppercase tracking-[0.25em] text-[10px] font-bold transition-all hover:bg-white hover:px-12 shadow-lg rounded-sm">
          <span className="relative z-10">{SITE_CONFIG.HERO.BUTTON_TEXT}</span>
        </button>
      </div>
      </ScrollFadeIn>
    </div>
  </div>
);

// NOUVEAU COMPOSANT : Modale pour afficher la description longue du produit
const ProductDescriptionModal = ({ product, onClose }) => {
    if (!product) return null;
    
    // Utilisation de descriptionHtml pour conserver le formatage du CMS
    const ProductDescriptionContent = () => (
        <div 
            // Application de styles pour les éléments bruts du HTML
            className="text-sm leading-relaxed text-stone-700 [&>p]:mb-4 [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mb-4 [&>li]:mb-2" 
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
        >
        </div>
    );

    return (
        <div className="fixed inset-0 z-[80] bg-black/10 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            {/* Contenu de la modale avec la couleur du site */}
            <div className="bg-finca-light w-full max-w-lg shadow-2xl p-8 relative rounded-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-900"><X size={20} /></button>
                
                <h3 className="font-serif text-2xl text-stone-900 mb-2">{product.title}</h3>
                <p className="text-stone-500 text-xs uppercase tracking-widest mb-6 border-b border-stone-200 pb-3">Détails et Description</p>
                
                {/* Image principale */}
                <div className="w-full aspect-[4/3] bg-stone-100 mb-6 rounded-md overflow-hidden">
                    <img 
                      src={product.images?.edges?.[0]?.node?.url || "https://placehold.co/800x600/F0EBE5/7D7D7D?text=Image"} 
                      alt={product.title} 
                      className="w-full h-full object-cover" 
                    />
                </div>
                
                {/* Description avec mise en forme */}
                <ProductDescriptionContent />

                <div className="mt-8 pt-4 border-t border-stone-200">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        className="w-full bg-stone-900 text-white py-3 uppercase tracking-[0.2em] text-xs font-bold hover:bg-stone-700 transition-colors rounded-sm"
                    >
                        Fermer l'aperçu
                    </button>
                </div>
            </div>
        </div>
    );
};


const VariantSelector = ({ product, onClose, onConfirm }) => {
  const variants = product.variants?.edges || [];
  // Le prix minimum est pris du produit si la variante n'a pas encore été sélectionnée
  const initialVariant = variants.length > 0 ? variants[0].node : null;
  
  const [selectedVariant, setSelectedVariant] = useState(initialVariant);
  const [quantity, setQuantity] = useState(1);
  const increment = () => setQuantity(q => q + 1);
  const decrement = () => setQuantity(q => (q > 1 ? q - 1 : 1));
  
  const currentPrice = selectedVariant?.price?.amount || product.priceRange?.minVariantPrice?.amount || 0;
  const finalPrice = Math.round(parseFloat(currentPrice) * quantity);

  if (!initialVariant) {
    return (
        <div className="fixed inset-0 z-[80] bg-black/10 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-finca-light w-full max-w-md shadow-2xl p-8 relative rounded-lg" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-900"><X size={20} /></button>
                <p className="text-center p-4">Aucune variante disponible pour ce produit.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[80] bg-black/10 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      {/* MODALE AVEC FOND OPAQUE COULEUR DU SITE */}
      <div className="bg-finca-light w-full max-w-md shadow-2xl p-8 relative rounded-lg" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-900"><X size={20} /></button>
        <div className="flex gap-6 mb-8">
          <div className="w-24 h-32 bg-stone-100 flex-shrink-0 overflow-hidden rounded-sm">
            <img 
              src={selectedVariant?.image?.url || product.images?.edges?.[0]?.node?.url || "https://placehold.co/800x1000/F0EBE5/7D7D7D?text=Image"} 
              alt={product.title} 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <h3 className="font-serif text-xl text-stone-900 mb-2">{product.title}</h3>
            <p className="text-stone-500 text-xs uppercase tracking-widest mb-3">{product.productType}</p>
            <p className="text-stone-900 font-medium text-lg">{finalPrice} €</p>
          </div>
        </div>
        <div className="mb-6">
          <label className="text-[10px] uppercase tracking-[0.2em] text-stone-500 block mb-3 font-bold font-serif">Variantes</label>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
            {variants.map(({ node }) => (
              <button 
                key={node.id} 
                onClick={() => setSelectedVariant(node)} 
                className={`w-full text-left px-4 py-3 text-sm font-serif border rounded-sm transition-all flex justify-between items-center 
                  ${selectedVariant?.id === node.id ? 'border-stone-900 bg-white shadow-sm' : 'border-stone-200 hover:border-stone-400'}`}
              >
                <span>{node.title} - {Math.round(parseFloat(node.price.amount))} €</span>
                {selectedVariant?.id === node.id && <div className="w-2 h-2 bg-stone-900 rounded-full"></div>}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between mb-8 border-t border-stone-200 pt-6">
          <label className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold font-serif">Quantité</label>
          <div className="flex items-center border border-stone-300 rounded-sm">
            <button onClick={decrement} className="px-3 py-2 hover:bg-stone-100 text-stone-600"><Minus size={14} /></button>
            <span className="px-3 py-2 text-sm font-serif w-8 text-center">{quantity}</span>
            <button onClick={increment} className="px-3 py-2 hover:bg-stone-100 text-stone-600"><Plus size={12} /></button>
          </div>
        </div>
        <button 
          onClick={() => onConfirm(product, selectedVariant, quantity)} 
          className="w-full bg-stone-900 text-white py-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-stone-700 transition-colors rounded-sm"
        >
          Ajouter au panier - {finalPrice} €
        </button>
      </div>
    </div>
  );
};


const ArticleView = ({ article }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  if (!article) return null;
  const node = article.node;

  const processArticleContent = (html) => {
    let text = html
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
        .replace(/\{\s*\"@context\":\s*\"https:\/\/schema\.org\"[\s\S]*?\}/g, ' ')
        .replace(/["{}[]]/g, ' ');

    text = text.replace(/(<\/?p>|<\/?h\d>|<\/?li>|<\/?div>|<br\b[^>]*\/?>)/gi, '\n\n'); 
    text = text.replace(/<[^>]+>/g, ' ');      
    
    DESIGN_CONFIG.ARTICLE_CLEANUP_FILTERS.forEach(filterText => {
      const escapedFilter = filterText.replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$1');
      const regex = new RegExp(escapedFilter, 'g');
      text = text.replace(regex, ' ').trim();
    });
    
    text = text.replace(/(\s*\n\s*){2,}/g, '\n\n').trim(); 
    text = text.replace(/[ \t]+/g, ' '); 
    
    const blocks = text.split('\n\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    const elements = [];
    const numberedTitleRegex = /^(\d+\.?\s+)(.+)/i;

    blocks.forEach((block, index) => {
      if (!block.trim().length) return; 

      const match = block.match(numberedTitleRegex);
      
      if (match) {
        elements.push({
          type: 'title',
          content: block,
          id: index,
        });
      } else {
        elements.push({
          type: 'paragraph',
          content: block,
          id: index,
        });
      }
    });

    return elements;
  };

  const articleElements = processArticleContent(node.contentHtml);

  const PointTitle = ({ children }) => (
    <h2 className="font-serif font-extrabold text-2xl md:text-3xl mt-12 mb-6 leading-snug text-stone-900 border-l-4 border-stone-200 pl-4 max-w-xl mx-auto">
      {children}</h2>
  );

  const BodyParagraph = ({ children }) => {
    const finalContent = children.replace(/:$/, '.');
    
    if (!finalContent.trim()) return null;

    return (
      <p className="font-light leading-loose text-stone-900 text-base md:text-lg mb-6 md:mb-8 max-w-xl mx-auto">
        {finalContent}
      </p>
    );
  };

  return (
    <div className="bg-white min-h-screen pt-32 pb-24 animate-fade-in selection:bg-finca-medium/50">
      
      <div className="max-w-[1400px] mx-auto px-6 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          
          {node.image && (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg shadow-xl bg-finca-medium">
              <img 
                src={node.image.url} 
                alt={node.title} 
                className="w-full h-full object-cover opacity-95" 
              />
            </div>
          )}

          <div className="py-6 md:py-12">
            <div className="flex flex-col gap-2 mb-8 text-sm font-serif italic text-stone-400">
              <span className="text-[10px] uppercase tracking-[0.3em] text-stone-500 font-bold font-sans">
                Par {node.authorV2?.name || "La Rédaction"}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-sans">
                Publié le {new Date(node.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-serif text-stone-900 leading-[1.1] mb-8">
              {node.title}
            </h1>
            
            {node.excerpt && (
                <p className="text-xl font-serif italic text-stone-600 border-l-2 border-stone-200 pl-4 py-2 mt-6">
                    {node.excerpt}
                </p>
            )}
          </div>
        </div>
        <p className="text-right text-[9px] text-stone-400 mt-4 uppercase tracking-widest italic pr-2">La Maison Ibizienne Journal</p>
      </div>

      <article className="max-w-4xl mx-auto px-6 mt-16">
        {articleElements.map(element => {
          if (element.type === 'title') {
            return <PointTitle key={element.id}>{element.content}</PointTitle>;
          }
          if (element.type === 'paragraph') {
            return <BodyParagraph key={element.id}>{element.content}</BodyParagraph>;
          }
          return null;
        })}
        
        <div className="mt-24 pt-12 border-t border-stone-100 flex flex-col items-center">
          <p className="font-serif italic text-stone-400 text-lg">"L'art de vivre est un voyage."</p>
          <div className="flex gap-4 mt-8">
            <span className="text-[10px] uppercase tracking-widest border border-stone-200 px-4 py-2 text-stone-400 cursor-pointer hover:border-stone-900 hover:text-stone-900 transition-all rounded-sm">Partager</span>
          </div>
        </div>
      </article>
    </div>
  );
};


const CustomFurnitureSection = () => {
    const sectionRef = useRef(null);
    const [scrollProgress, setScrollProgress] = useState(0); 
    const localColorLight = COLOR_LIGHT; 

    // Logique de suivi du défilement
    useEffect(() => {
        const handleScroll = () => {
            if (sectionRef.current) {
                const sectionTop = sectionRef.current.offsetTop;
                const sectionHeight = sectionRef.current.offsetHeight;
                const viewportHeight = window.innerHeight;
                const scrollY = window.scrollY;

                // L'animation commence quand le haut de la section arrive en bas de l'écran.
                const startPoint = sectionTop - viewportHeight;
                // L'animation se termine quand le bas de la section dépasse le haut de l'écran.
                const endPoint = sectionTop + sectionHeight; 
                
                let progress = (scrollY - startPoint) / (endPoint - startPoint);
                progress = Math.max(0, Math.min(1, progress));
                
                // Mise à jour de la progression pour piloter l'animation
                setScrollProgress(progress);
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // 1. Déplacement des rideaux (ouverture complète sur les 50% de la progression)
    const openProgress = Math.min(1, scrollProgress * 2); 
    const leftCurtainTransform = `translateX(-${openProgress * 100}%)`;
    const rightCurtainTransform = `translateX(${openProgress * 100}%)`;

    // 2. Le texte apparaît plus tôt et plus longtemps: commence à 30% du scroll, finit à 80% (au lieu de 50%-100%)
    // (progress - 0.3) / 0.5 -> Normalise l'animation entre 0.3 et 0.8
    const textRevealProgress = Math.max(0, Math.min(1, (scrollProgress - 0.3) / 0.5)); 
    const textOpacity = textRevealProgress;
    const textY = 1 - textRevealProgress; 

    return (
        // min-h-[120vh] force le défilement et crée la sensation de "frein"
        <section 
            id="custom-furniture" 
            className="relative w-full min-h-[120vh] overflow-hidden" // Couleur de fond héritée de finca-light du conteneur parent
            ref={sectionRef} // Le ref est sur la section pour mesurer sa position
        >
            <div className="absolute inset-0 z-0">
                {/* Image de fond statique, DÉSORMAIS EN OPACITÉ 100% */}
                <img
                    src={SITE_CONFIG.CUSTOM_FURNITURE.IMAGE_URL}
                    alt="Meubles sur mesure"
                    className="w-full h-full object-cover absolute inset-0 z-10 opacity-100 scale-[1.05]"
                />
                
                {/* Voile sombre - RETIRÉ */}
            </div>

            {/* Contenu superposé (texte révélé) */}
            <div className="absolute inset-0 z-30 flex items-center justify-center p-8">
                <div className="text-center" 
                     style={{ 
                         opacity: textOpacity, 
                         transform: `translateY(${textY * 20}px)`, 
                         // Retirer les transitions CSS pour permettre un contrôle total par le scroll/JS
                         transition: 'none' 
                     }}>
                    <h2 className={`text-4xl md:text-6xl font-serif text-white uppercase tracking-wider drop-shadow-lg`}>
                        {SITE_CONFIG.CUSTOM_FURNITURE.TEXT}
                    </h2>
                    <a href="#contact" className="mt-8 group relative overflow-hidden bg-finca-light text-stone-900 px-8 py-3 uppercase tracking-[0.2em] text-[10px] font-bold transition-all hover:bg-white hover:px-10 rounded-sm inline-block">
                        En savoir plus
                    </a>
                </div>
            </div>

            {/* Masques (Rideaux) - Ils sont absolus pour couvrir le contenu, et leur transformation est pilotée par scrollProgress */}
            <div className="absolute inset-0 z-40 pointer-events-none">
                {/* Panneau Gauche (Couleur du fond: COLOR_LIGHT) */}
                <div 
                    className={`absolute top-0 left-0 h-full w-1/2 transition-none`} 
                    style={{ backgroundColor: localColorLight, transform: leftCurtainTransform, transition: 'none' }}
                />
                
                {/* Panneau Droit (Couleur du fond: COLOR_LIGHT) */}
                <div 
                    className={`absolute top-0 right-0 h-full w-1/2 transition-none`} 
                    style={{ backgroundColor: localColorLight, transform: rightCurtainTransform, transition: 'none' }}
                />
            </div>
        </section>
    );
};


const ValuesSection = () => (
    // Remplacement de py-24 par py-16
    <section id="values" className="py-20 bg-finca-light">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <ScrollFadeIn threshold={0.2}>
            <h2 className="text-[10px] font-serif tracking-[0.4em] text-stone-500 uppercase text-center mb-16">
                Notre Philosophie
            </h2>
            </ScrollFadeIn>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
                {SITE_CONFIG.MATERIALS.map((item, index) => (
                    // La fluidité est assurée par la petite translation dans ScrollFadeIn
                    <ScrollFadeIn key={index} delay={index * 150} threshold={0.5} className="text-center">
                        <div className="text-stone-900 text-4xl mb-4">
                            {/* Icons are purely illustrative here, could be replaced by custom SVGs */}
                            {index === 0 && <span className="font-serif">01</span>}
                            {index === 1 && <span className="font-serif">02</span>}
                            {index === 2 && <span className="font-serif">03</span>}
                        </div>
                        <h3 className="font-serif text-2xl text-stone-900 mb-4">{item.TITLE}</h3>
                        <p className="text-stone-500 font-light leading-relaxed">{item.TEXT}</p>
                    </ScrollFadeIn>
                ))}
            </div>
        </div>
    </section>
);


const CoachingSection = () => (
    // Remplacement de py-24 md:py-32 par py-20 md:py-24
    <section id="coaching" className="py-20 md:py-24 bg-finca-medium">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                
                {/* Bloc Image */}
                <ScrollFadeIn threshold={0.4} initialScale={0.95}>
                <div className="relative aspect-[4/5] bg-stone-100 overflow-hidden rounded-lg shadow-xl">
                    <img 
                        src={SITE_CONFIG.COACHING.IMAGE_URL} 
                        alt="Coaching en décoration" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-stone-900/10"></div>
                </div>
                </ScrollFadeIn>

                {/* Bloc Texte / Contenu */}
                <div className="py-6 lg:py-12">
                    <ScrollFadeIn delay={100} threshold={0.3}>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-stone-500 font-bold font-sans block mb-4">
                        {SITE_CONFIG.COACHING.SURTITLE}
                    </span>
                    <h2 className="text-4xl md:text-5xl font-serif text-stone-900 leading-tight mb-8">
                        {SITE_CONFIG.COACHING.TITLE}
                    </h2>
                    </ScrollFadeIn>
                    
                    <ScrollFadeIn delay={200} threshold={0.3}>
                    <p className="text-lg font-light text-stone-700 mb-10 border-l-2 border-stone-200 pl-4 py-1">
                        {SITE_CONFIG.COACHING.DESCRIPTION}
                    </p>
                    </ScrollFadeIn>
                    
                    <ul className="space-y-3 mb-10">
                        {SITE_CONFIG.COACHING.ADVANTAGES.map((adv, index) => (
                            <ScrollFadeIn key={index} delay={300 + index * 100} threshold={0.8} className="flex items-center gap-3 text-stone-900">
                                <ChevronRight size={18} className="text-stone-500 flex-shrink-0" />
                                <span className="text-sm font-medium">{adv}</span>
                            </ScrollFadeIn>
                        ))}
                    </ul>
                    
                    <ScrollFadeIn delay={600} threshold={0.5}>
                    <a href="#contact" className="group relative overflow-hidden bg-stone-900 text-white px-8 py-3 uppercase tracking-[0.2em] text-[10px] font-bold transition-all hover:bg-stone-700 hover:px-10 rounded-sm">
                        <span className="relative z-10">{SITE_CONFIG.COACHING.BUTTON_TEXT}</span>
                    </a>
                    </ScrollFadeIn>
                </div>
            </div>
        </div>
    </section>
);


const Footer = ({ logo }) => (
    <footer className="bg-stone-900 text-finca-light py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 border-b border-stone-800 pb-12 mb-12">
                
                {/* Bloc Logo / Philosophie */}
                <div>
                    <h3 className="text-3xl font-serif tracking-widest font-bold mb-6 text-finca-light">{logo}</h3>
                    <p className="text-stone-400 text-sm font-light whitespace-pre-line">{SITE_CONFIG.FOOTER.ABOUT}</p>
                </div>

                {/* Bloc Navigation */}
                <div>
                    <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-300 mb-6">Navigation</h4>
                    <ul className="space-y-3 text-sm">
                        <li><a href="#collections" className="text-stone-400 hover:text-white transition-colors">Boutique</a></li>
                        <li><a href="#coaching" className="text-stone-400 hover:text-white transition-colors">Coaching</a></li>
                        <li><a href="#journal-section" className="text-stone-400 hover:text-white transition-colors">Le Journal</a></li>
                    </ul>
                </div>

                {/* Bloc Infos */}
                <div>
                    <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-300 mb-6">Informations</h4>
                    <ul className="space-y-3 text-sm">
                        <li><a href={SITE_CONFIG.SOCIAL_LINKS.CONTACT_URL} className="text-stone-400 hover:text-white transition-colors">Contact</a></li>
                        <li><a href={SITE_CONFIG.SOCIAL_LINKS.DELIVERY_URL} className="text-stone-400 hover:text-white transition-colors">Livraison</a></li>
                        <li><a href={SITE_CONFIG.SOCIAL_LINKS.PHILOSOPHY_URL} className="text-stone-400 hover:text-white transition-colors">Notre Philosophie</a></li>
                    </ul>
                </div>
                
                {/* Bloc Social */}
                <div>
                    <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-300 mb-6">Suivez-nous</h4>
                    <div className="flex items-center gap-4">
                        <a href={SITE_CONFIG.SOCIAL_LINKS.INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-white transition-colors">
                            <Instagram size={20} />
                        </a>
                        <a href={SITE_CONFIG.SOCIAL_LINKS.FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-white transition-colors">
                            <Facebook size={20} />
                        </a>
                        <a href={SITE_CONFIG.SOCIAL_LINKS.TIKTOK_URL} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-white transition-colors">
                             {/* Placeholder Icon for TikTok if needed, or use a custom SVG/text */}
                             <MessageSquare size={20} /> 
                        </a>
                    </div>
                    <p className="text-stone-500 text-xs mt-4">{SITE_CONFIG.SOCIAL_LINKS.INSTAGRAM_HANDLE}</p>
                </div>
            </div>
            
            <div className="text-center text-stone-600 text-xs pt-4">
                © {new Date().getFullYear()} {logo}. Tous droits réservés.
            </div>
        </div>
    </footer>
);


// ==============================================================================
// 7. COMPOSANT APPLICATION PRINCIPALE (App)
// ==============================================================================

const App = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null); 
  const [selectedDescriptionProduct, setSelectedDescriptionProduct] = useState(null); // Nouvel état pour la modale de description
  const [selectedArticle, setSelectedArticle] = useState(null); 
  const [isArticleView, setIsArticleView] = useState(false);
  
  const logoText = data?.shop?.name || "LA MAISON";
  const collections = data?.collections?.edges || [];
  const blog = data?.blogs?.edges?.[0]?.node;
  const articles = blog?.articles?.edges || [];
  
  // --- NOUVEAU LOGIQUE DE FILTRAGE DES COLLECTIONS ---
  const newArrivalsCollection = collections.find(
    c => c.node.title.toLowerCase() === 'nouveautés' || c.node.handle === 'nouveautes'
  );

  const regularCollections = collections.filter(
    c => c.node.title.toLowerCase() !== 'nouveautés' && c.node.handle !== 'nouveautes'
  );
  
  const allProducts = regularCollections.flatMap(c => c.node.products.edges).map(e => e.node);
  
  const nouveautesProducts = newArrivalsCollection
    ? newArrivalsCollection.node.products.edges.map(e => e.node)
    : allProducts.slice(0, 10); // Fallback: premiers produits si la collection Nouveautés n'est pas trouvée
  // --------------------------------------------------


  // --- LOGIQUE DE TÉLÉCHARGEMENT DE DONNÉES ---
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const fetchedData = await fetchShopifyData();
      setData(fetchedData || FALLBACK_DATA);
      setLoading(false);
    };
    loadData();
  }, []);
  
  // --- LOGIQUE DU PANIER ET DES MODALES ---
  
  // Ouvre le sélecteur de variantes (Utilisé par le bouton Ajouter au Panier flottant)
  const handleOpenVariantSelector = useCallback((product) => {
    setSelectedProduct(product);
    setSelectedDescriptionProduct(null);
  }, []);

  // Ouvre la modale de description (Utilisé par l'icône Œil)
  const handleOpenDescriptionModal = useCallback((product) => {
    setSelectedDescriptionProduct(product);
    setSelectedProduct(null);
  }, []);

  // Ferme la modale de description
  const handleCloseDescriptionModal = useCallback(() => {
    setSelectedDescriptionProduct(null);
  }, []);


  // Ajout effectif au panier (depuis VariantSelector)
  const handleAddToCart = useCallback((product, variant, quantity) => {
    const variantId = variant.id;
    const existingItemIndex = cartItems.findIndex(item => item.variantId === variantId);
    
    const newItem = {
        variantId: variantId,
        title: product.title,
        variantTitle: variant.title,
        price: parseFloat(variant.price.amount),
        quantity: quantity,
        image: variant.image?.url || product.images?.edges?.[0]?.node?.url,
    };

    if (existingItemIndex > -1) {
      setCartItems(prevItems => 
        prevItems.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        )
      );
    } else {
      setCartItems(prevItems => [...prevItems, newItem]);
    }
    
    setSelectedProduct(null); // Fermer le modal
    setIsCartOpen(true); // Ouvrir la sidebar du panier
  }, [cartItems]);

  // Mettre à jour la quantité (depuis CartSidebar)
  const handleUpdateQuantity = useCallback((variantId, quantity) => {
    if (quantity < 1) return;
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.variantId === variantId 
          ? { ...item, quantity: quantity } 
          : item
      )
    );
  }, []);

  // Retirer un article (depuis CartSidebar)
  const handleRemoveFromCart = useCallback((variantId) => {
    setCartItems(prevItems => prevItems.filter(item => item.variantId !== variantId));
  }, []);

  // --- LOGIQUE DE VUE/NAVIGATION ---
  
  // Gestion du clic sur un article de blog
  const handleArticleClick = useCallback((article) => {
    setSelectedArticle(article);
    setIsArticleView(true);
    // Le défilement est géré par ArticleView useEffect
  }, []);
  
  // Retour à la page principale
  const handleBackToMain = useCallback(() => {
    setIsArticleView(false);
    setSelectedArticle(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  
  // Défilement de la section Héro
  const handleHeroScroll = () => {
    const collectionsSection = document.getElementById('nouveautes');
    if (collectionsSection) {
      window.scrollTo({
        top: collectionsSection.offsetTop - 100, // Défiler juste au-dessus de la section
        behavior: 'smooth'
      });
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-finca-light">
        <Loader className="animate-spin text-stone-900" size={48} />
        <p className="mt-4 text-stone-500 font-serif italic">Chargement des inspirations...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-finca-light font-sans text-stone-900">
      
      {/* Navbar (toujours visible) */}
      <Navbar 
        logo={logoText} 
        cartCount={cartItems.length} 
        onOpenCart={() => setIsCartOpen(true)} 
        isArticleView={isArticleView}
        onBack={handleBackToMain}
      />
      
      {/* Modale de Description (Nouvelle modale) */}
      {selectedDescriptionProduct && (
          <ProductDescriptionModal 
              product={selectedDescriptionProduct} 
              onClose={handleCloseDescriptionModal}
          />
      )}

      {/* Sélecteur de Variante (Modale) */}
      {selectedProduct && (
        <VariantSelector 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          onConfirm={handleAddToCart}
        />
      )}
      
      {/* Sidebar du Panier */}
      <CartSidebar 
        cartItems={cartItems} 
        isCartOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemoveFromCart}
        onCheckout={() => proceedToCheckout(cartItems)}
      />
      {/* Overlay: Opacité très faible pour ne pas masquer le contenu */}
      {isCartOpen && <div className="fixed inset-0 bg-black/10 z-40 transition-opacity" onClick={() => setIsCartOpen(false)} />}
      
      
      {/* Rendu Conditionnel des Vues */}
      {isArticleView ? (
        
        // --- VUE ARTICLE DE BLOG ---
        <ArticleView article={selectedArticle} />
        
      ) : (
        
        // --- VUE PAGE PRINCIPALE (HOME) ---
        <main>
          
          {/* Section 1: Héro (Vidéo) */}
          <HeroSection onScroll={handleHeroScroll} />
          
          {/* NOUVEAU BLOC : Nouveautés (après le Héro) */}
          <Carousel
            title={SITE_CONFIG.SECTIONS.NOUVEAUTES_TITLE}
            subtitle={SITE_CONFIG.SECTIONS.NOUVEAUTES_SUBTITLE}
            anchorId="nouveautes"
            itemWidth={DESIGN_CONFIG.NOUVEAUTES_ITEM_WIDTH}
          >
            {/* Utilise uniquement les produits de la collection Nouveautés (ou fallback) */}
            {nouveautesProducts.slice(0, 10).map((product, index) => (
              <NouveautesProductCard 
                key={product.id + index} 
                product={product} 
                onClick={handleOpenDescriptionModal} // L'action principale au clic/touch sur mobile ouvre la description
                onAddToCart={handleOpenVariantSelector} // Ouvre le sélecteur de variantes (Bouton Add to Cart)
                onShowDescription={handleOpenDescriptionModal} // Ouvre la description (Icône œil)
              />
            ))}
          </Carousel>
          
          {/* Section 2: Carousel des Collections (Exclut la collection Nouveautés) */}
          <Carousel
            title={SITE_CONFIG.SECTIONS.UNIVERS}
            subtitle="Collections Exclusives"
            anchorId="collections"
            itemWidth={DESIGN_CONFIG.COLLECTION_ITEM_WIDTH}
          >
            {/* PASSAGE DU HANDLER handleSelectProduct */}
            {regularCollections.map(({ node }) => (
              <CollectionCard 
                key={node.id} 
                collection={node} 
                onClickProduct={handleOpenDescriptionModal} // Simuler l'aperçu rapide avec la description
                onQuickAddToCart={handleOpenVariantSelector} // Ouvre le sélecteur de variantes
              />
            ))}
          </Carousel>
          
          {/* Section 3: Carousel des Meilleurs Produits (Utilise les produits des collections régulières) */}
          <Carousel
            title={SITE_CONFIG.SECTIONS.BOUTIQUE}
            subtitle="Nos Incontournables"
            anchorId="products"
            itemWidth={DESIGN_CONFIG.PRODUCT_ITEM_WIDTH}
          >
            {regularCollections.flatMap(c => c.node.products.edges).map(e => e.node).slice(0, 8).map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onClick={handleOpenDescriptionModal} // Ouvre la description (L'action principale du clic/touch)
                onAddToCart={handleOpenVariantSelector} // Ouvre le sélecteur de variantes (Bouton Add to Cart)
                onShowDescription={handleOpenDescriptionModal} // Ouvre la description (Icône œil)
              />
            ))}
          </Carousel>
          
          {/* Section 4: Valeurs / Matériaux (Notre Philosophie) */}
          <ValuesSection />
          
          {/* Section 5: Section sur Mesure (Bannière fluide avec rideau piloté par scroll) */}
          <CustomFurnitureSection />
          
          {/* Section 6: Coaching / Conseils Déco (Notre Expertise) */}
          <CoachingSection />
          
          {/* Section 7: Le Journal (Articles de Blog) */}
          {articles.length > 0 && (
            <Carousel
              title={SITE_CONFIG.SECTIONS.JOURNAL_TITLE}
              subtitle={SITE_CONFIG.SECTIONS.JOURNAL_SUBTITLE}
              anchorId="journal-section"
              itemWidth={DESIGN_CONFIG.JOURNAL_ITEM_WIDTH}
            >
              {articles.map((article) => (
                <ArticleCard 
                  key={article.node.id} 
                  article={article} 
                  onClick={handleArticleClick}
                />
              ))}
            </Carousel>
          )}

          {/* Footer */}
          <Footer logo={logoText} />
          
        </main>
      )}
    </div>
  );
};

export default App;
