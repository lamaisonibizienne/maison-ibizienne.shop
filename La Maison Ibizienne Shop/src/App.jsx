import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ShoppingBag, X, Instagram, Facebook, Loader, ChevronRight, Menu, ArrowLeft, Heart, ChevronDown, Minus, Plus, ChevronLeft } from 'lucide-react';

// ==============================================================================
// 1. CONFIGURATION TECHNIQUE & STYLE
// ==============================================================================

// Ajoutez cette configuration pour Tailwind CSS pour utiliser la police "Playfair Display"
// et les couleurs personnalisées.
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

const STOREFRONT_ACCESS_TOKEN = '4b2746c099f9603fde4f9639336a235d'; 
const SHOPIFY_DOMAIN = '91eg2s-ah.myshopify.com'; 
const API_VERSION = '2024-01';
const HERO_VIDEO_URL = "https://cdn.shopify.com/videos/c/o/v/c4d96d8c70b64465835c4eadaa115175.mp4";

// ==============================================================================
// 1b. LIENS EXTERNES CENTRALISÉS (Facilement modifiables)
// ==============================================================================

const EXTERNAL_LINKS = {
  INSTAGRAM_URL: "https://www.instagram.com/lamaisonibizienne", // Lien Instagram
  FACEBOOK_URL: "https://www.facebook.com/lamaisonibizienne",   // Lien Facebook
};


// ==============================================================================
// 2. TEXTES MODIFIABLES & CONFIGURATION DE CONTENU
// ==============================================================================

/**
 * NOUVEAU: Configuration des médias pour faciliter l'édition des URLs de posts.
 * Utiliser des URLs d'images carrées (aspect-ratio 1/1) de préférence.
 */
const MEDIA_CONFIG = {
  INSTAGRAM_POSTS: [
    "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=600&auto=format&fit=crop", // Post 1
    "https://images.unsplash.com/photo-1522771753035-4a50c95b9389?q=80&w=600&auto=format&fit=crop", // Post 2
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?q=80&w=600&auto=format&fit=crop", // Post 3
    "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=600&auto=format&fit=crop", // Post 4
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=600&auto=format&fit=crop", // Post 5
    "https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?q=80&w=600&auto=format&fit=crop"  // Post 6
  ]
};

const TEXTS = {
  hero: {
    surtitle: "Slow Living",
    title: "L'Esprit\nFinca",
    button: "Explorer"
  },
  materials: [
    {
      title: "Bois d'Olivier & Teck",
      text: "Des bois nobles, robustes et patinés par le temps."
    },
    {
      title: "Fibres Naturelles",
      text: "Jute, rotin, osier. Tressés à la main pour apporter chaleur et texture."
    },
    {
      title: "Artisanat Local",
      text: "Chaque pièce est unique, façonnée par des mains expertes."
    }
  ],
  sections: {
    univers: "Nos Univers",
    boutique: "La Boutique",
    journal_title: "Le Journal",
    journal_subtitle: "Inspirations",
    journal_link: "Toutes les histoires"
  },
  footer: {
    about: "Art de vivre méditerranéen.\nFait main à Ibiza."
  }
};

const ARTICLE_CONTENT_CLEANUP_FILTERS = [
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
  "Chez La Maison Ibizienne, nous ne vous aidons pas simplement à acheter ou vendre\\.",
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
];

// ==============================================================================
// 3. LOGIQUE API
// ==============================================================================

const proceedToCheckout = (cartItems) => {
  if (cartItems.length === 0) return;
  // This uses the "cart/add" quick link format, which is sufficient for checkout simulation
  const itemsString = cartItems.map(item => {
    // Extract ID (GraphQL ID is typically base64 encoded, split on '/' and take the last part)
    let variantId = item.selectedVariantId?.split('/').pop(); 
    if (!variantId) variantId = item.variants?.edges?.[0]?.node?.id?.split('/').pop();
    if (!variantId) variantId = item.id.split('/').pop();
    return `${variantId}:${item.quantity || 1}`;
  }).join(',');
  
  // NOTE: This URL construction is a simple approximation for demo purposes.
  // A real integration would use the Storefront API to create a Checkout object.
  window.location.href = `https://${SHOPIFY_DOMAIN}/cart/${itemsString}`;
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
                images(first: 2) { edges { node { url } } }
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
    const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/${API_VERSION}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query }),
    });
    const json = await response.json();
    return json.data;
  } catch (error) { 
    console.error("Error fetching Shopify data:", error);
    return null; 
  }
}

const FALLBACK_DATA = { shop: { name: "LA MAISON" }, collections: { edges: [] }, products: { edges: [] } };

// ==============================================================================
// 4. COMPOSANTS DESIGN
// ==============================================================================

/**
 * Composant de carrousel générique pour le défilement horizontal.
 * @param {object} props - Les propriétés du composant.
 * @param {string} props.title - Le titre de la section.
 * @param {string} props.subtitle - Le sous-titre de la section (optionnel).
 * @param {string} props.anchorId - L'ID de l'ancre pour le scroll.
 * @param {number} props.itemWidth - La largeur de l'élément en Tailwind (ex: 'w-[80vw]', 'md:w-[350px]').
 * @param {React.ReactNode} props.children - Les éléments à faire défiler (doivent être enveloppés).
 */
const Carousel = ({ title, subtitle, anchorId, itemWidth, children }) => {
  const scrollContainerRef = useRef(null);

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
    <section id={anchorId} className="py-24 bg-finca-light">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
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

        {/* Conteneur de défilement horizontal (Slide) */}
        <div
          ref={scrollContainerRef}
          className={`flex overflow-x-scroll snap-x snap-mandatory space-x-6 md:space-x-10 pb-4 md:pb-8 touch-pan-x transition-shadow duration-500`}
          style={{ 
            // Cacher la barre de défilement
            scrollbarWidth: 'none', /* Firefox */
            msOverflowStyle: 'none' /* IE and Edge */
          }}
          // Style pour cacher la barre de défilement sur Chrome/Safari
          onMouseEnter={() => scrollContainerRef.current.style.boxShadow = 'inset 0 -5px 10px rgba(0,0,0,0.05)'}
          onMouseLeave={() => scrollContainerRef.current.style.boxShadow = 'none'}
        >
          {React.Children.map(children, (child) => (
            // Chaque élément doit être un snap point et avoir la largeur définie par itemWidth
            <div className={`flex-shrink-0 snap-center ${itemWidth}`} key={child.key}>
              {child}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


const Navbar = ({ logo, cartCount, onOpenCart, isArticleView, onBack }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isArticleView) {
    return (
      <nav className="fixed top-0 left-0 w-full z-50 bg-finca-light/95 backdrop-blur-md border-b border-stone-100 py-4 transition-all">
        <div className="max-w-[1200px] mx-auto px-6 flex justify-between items-center">
          <button onClick={onBack} className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold hover:text-stone-500 transition-colors group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Retour
          </button>
          <div className="text-xl font-serif font-bold tracking-[0.15em] text-stone-900">{logo}</div>
          <div className="w-16"></div> {/* Spacer équilibrant */}
        </div>
      </nav>
    );
  }

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 border-b ${isScrolled ? 'bg-finca-light/95 backdrop-blur-md border-stone-200 py-4 shadow-sm' : 'bg-transparent border-transparent py-6'}`}>
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 grid grid-cols-12 items-start">
        <div className="col-span-4 hidden lg:flex gap-8 text-[10px] uppercase tracking-[0.25em] font-serif text-stone-900 pt-1">
          <a href="#collections" className="hover:text-stone-500 transition-colors whitespace-nowrap">Collections</a>
          <a href="#new-in" className="hover:text-stone-500 transition-colors whitespace-nowrap">Nouveautés</a>
          <a href="#journal-section" className="hover:text-stone-500 transition-colors whitespace-nowrap">Journal</a>
        </div>
        <div className="col-span-12 lg:col-span-4 flex justify-center order-first lg:order-none mb-4 lg:mb-0 lg:mt-5 transition-all duration-500">
          <div className={`text-2xl md:text-3xl lg:text-4xl font-serif tracking-[0.15em] font-bold text-center text-stone-900 whitespace-nowrap drop-shadow-sm`}>
            {logo}
          </div>
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
  <div className="relative h-[95vh] w-full flex flex-col justify-center items-center text-center px-4 overflow-hidden bg-finca-medium">
    <div className="absolute inset-0 z-0">
      <video className="w-full h-full object-cover animate-fade-in" autoPlay loop muted playsInline>
        <source src={HERO_VIDEO_URL} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-stone-900/5" />
    </div>
    <div className="relative z-10 pt-40 max-w-4xl animate-slide-up">
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-8 md:p-14 inline-block shadow-2xl">
        <span className="text-[10px] uppercase tracking-[0.4em] text-white/90 mb-6 block font-serif">{TEXTS.hero.surtitle}</span>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white mb-8 leading-[0.85] tracking-tight drop-shadow-lg whitespace-pre-line">{TEXTS.hero.title}</h1>
        <button onClick={onScroll} className="group relative overflow-hidden bg-finca-light text-stone-900 px-10 py-4 uppercase tracking-[0.25em] text-[10px] font-bold transition-all hover:bg-white hover:px-12 shadow-lg rounded-sm">
          <span className="relative z-10">{TEXTS.hero.button}</span>
        </button>
      </div>
    </div>
  </div>
);

const VariantSelector = ({ product, onClose, onConfirm }) => {
  // Ensure product has variants before trying to access the first one
  const variants = product.variants?.edges || [];
  const initialVariant = variants.length > 0 ? variants[0].node : null;
  
  const [selectedVariant, setSelectedVariant] = useState(initialVariant);
  const [quantity, setQuantity] = useState(1);
  const increment = () => setQuantity(q => q + 1);
  const decrement = () => setQuantity(q => (q > 1 ? q - 1 : 1));
  
  const currentPrice = selectedVariant?.price?.amount || product.priceRange?.minVariantPrice?.amount || 0;
  const finalPrice = Math.round(parseFloat(currentPrice) * quantity);

  if (!initialVariant) {
    // Should not happen if data fetch is correct, but safe check
    return <p className="text-center p-4">Aucune variante disponible.</p>;
  }

  return (
    <div className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
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
                  ${selectedVariant?.id === node.id ? 'border-stone-900 bg-white shadow-sm' : 'border-stone-200 hover:border-stone-400'}`}>
                <span>{node.title}</span>
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
            <button onClick={increment} className="px-3 py-2 hover:bg-stone-100 text-stone-600"><Plus size={14} /></button>
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

// COMPOSANT ARTICLE : STYLE MAGAZINE HAUT DE GAMME
const ArticleView = ({ article }) => {
  // SCROLL AUTOMATIQUE VERS LE HAUT À L'OUVERTURE
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  if (!article) return null;
  const node = article.node;

  /**
   * Nettoie et structure le contenu HTML brut des articles Shopify.
   */
  const processArticleContent = (html) => {
    
    // Étape 1: Suppression du code (scripts, styles) et JSON-LD.
    let text = html
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
        // Suppression des blocs JSON-LD et des accolades/guillemets restants
        .replace(/\{\s*\"@context\":\s*\"https:\/\/schema\.org\"[\s\S]*?\}/g, ' ')
        .replace(/["{}[]]/g, ' ');

    // Étape 2: Remplacement des balises de bloc par des sauts de ligne rigoureux (\n\n).
    // On remplace toutes les balises de bloc par un DOUBLE saut de ligne.
    text = text.replace(/(<\/?p>|<\/?h\d>|<\/?li>|<\/?div>|<br\b[^>]*\/?>)/gi, '\n\n'); 

    // Étape 3: Suppression de toutes les balises HTML ouvrantes et restantes.
    text = text.replace(/<[^>]+>/g, ' ');      
    
    // Étape 4: Application des filtres de texte (nettoyage du contenu non désiré)
    ARTICLE_CONTENT_CLEANUP_FILTERS.forEach(filterText => {
      // Échapper pour la regex (sauf si c'est déjà un motif regex)
      const escapedFilter = filterText.replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$1');
      const regex = new RegExp(escapedFilter, 'g');
      text = text.replace(regex, ' ').trim();
    });
    
    // Étape 5: Nettoyage et reconstruction des blocs.

    // A. Nettoyer les espaces et sauts de ligne multiples en UN SEUL double saut de ligne.
    // Cela force la séparation des blocs là où il y avait une balise de bloc.
    text = text.replace(/(\s*\n\s*){2,}/g, '\n\n').trim(); 
    
    // B. Recompresser les espaces simples (à l'intérieur des lignes)
    text = text.replace(/[ \t]+/g, ' '); // Compresse les espaces multiples horizontaux
    
    // C. Split par DOUBLE saut de ligne pour obtenir les blocs structurés.
    const blocks = text.split('\n\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    

    // Étape 6: Structuration en objets pour le rendu React.
    const elements = [];
    // Regex pour détecter les titres numérotés (commence par 1., 2., 3. ou 01., 02.)
    const numberedTitleRegex = /^(\d+\.?\s+)(.+)/i;

    blocks.forEach((block, index) => {
      // Si le bloc est vide après le trim final (cas limite), on l'ignore.
      if (!block.trim().length) return; 

      const match = block.match(numberedTitleRegex);
      
      if (match) {
        // C'est un titre numéroté (ex: "1. Trop meubler... trop vite")
        elements.push({
          type: 'title',
          content: block,
          id: index,
        });
      } else {
        // C'est un paragraphe de texte
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

  // Styles pour les titres des points numérotés
  const PointTitle = ({ children }) => (
    <h2 className="font-serif font-extrabold text-2xl md:text-3xl mt-12 mb-6 leading-snug text-stone-900 border-l-4 border-stone-200 pl-4 max-w-xl mx-auto">
      {children}
    </h2>
  );

  // Styles pour les paragraphes du corps de texte
  const BodyParagraph = ({ children }) => {
    // Retirer les deux-points de fin pour améliorer le style de lecture si présent
    const finalContent = children.replace(/:$/, '.');
    
    if (!finalContent.trim()) return null;

    // text-base sur mobile, text-lg sur tablette/desktop
    return (
      <p className="font-light leading-loose text-stone-900 text-base md:text-lg mb-6 md:mb-8 max-w-xl mx-auto">
        {finalContent}
      </p>
    );
  };

  return (
    <div className="bg-white min-h-screen pt-32 pb-24 animate-fade-in selection:bg-finca-medium/50">
      
      {/* NOUVEL EN-TÊTE : Colonne Image & Colonne Titre/Métadonnées */}
      <div className="max-w-[1400px] mx-auto px-6 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          
          {/* Colonne Gauche: Image de l'article */}
          {node.image && (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg shadow-xl bg-finca-medium">
              <img 
                src={node.image.url} 
                alt={node.title} 
                className="w-full h-full object-cover opacity-95" 
              />
            </div>
          )}

          {/* Colonne Droite: Titre, Date, Auteur */}
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
            
            {/* Excerpt stylisé comme texte d'introduction */}
            {node.excerpt && (
                <p className="text-xl font-serif italic text-stone-600 border-l-2 border-stone-200 pl-4 py-2 mt-6">
                    {node.excerpt}
                </p>
            )}
          </div>
        </div>
        <p className="text-right text-[9px] text-stone-400 mt-4 uppercase tracking-widest italic pr-2">La Maison Ibizienne Journal</p>
      </div>

      {/* Contenu Éditorial - Rendu structuré */}
      <article className="max-w-4xl mx-auto px-6 mt-16">
        {articleElements.map(element => {
          if (element.type === 'title') {
            return <PointTitle key={element.id}>{element.content}</PointTitle>;
          }
          if (element.type === 'paragraph') {
            // Centrer les blocs de texte (max-w-xl défini dans BodyParagraph)
            return <BodyParagraph key={element.id}>{element.content}</BodyParagraph>;
          }
          return null;
        })}
        
        {/* Signature & Partage */}
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

// NOUVEAU: Utilise le composant Carousel
const CollectionCarousel = ({ collections, onCollectionSelect }) => {
  const validCollections = collections.filter(c => {
    const title = c.node.title.toLowerCase();
    // Filtre les collections non pertinentes et celles sans produits
    return !['coaching', 'service', 'homepage', 'frontpage'].some(bad => title.includes(bad)) && c.node.products.edges.length > 0;
  });
  if (validCollections.length === 0) return null;

  return (
    <Carousel 
      title={TEXTS.sections.univers} 
      subtitle="Découvrir" 
      anchorId="collections" 
      // Largeur: 80% sur mobile, 350px sur desktop pour que plusieurs items soient visibles
      itemWidth="w-[80vw] md:w-[400px] lg:w-[450px]"
    >
      {validCollections.map((col) => (
        <div 
          key={col.node.id} 
          onClick={() => onCollectionSelect(col.node.id)} 
          className="group cursor-pointer relative h-[500px] overflow-hidden bg-finca-medium rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300"
        >
          <img 
            src={col.node.image?.url || "https://placehold.co/800x1000/F0EBE5/7D7D7D?text=Collection"} 
            alt={col.node.title} 
            className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105 opacity-95 hover:opacity-100" 
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-700 rounded-lg" />
          <div className="absolute bottom-10 left-10 text-white z-10">
            <span className="text-[10px] uppercase tracking-[0.3em] mb-3 block font-serif italic drop-shadow-md">Collection</span>
            <h3 className="text-3xl font-serif leading-none drop-shadow-md">{col.node.title}</h3>
            <div className="w-8 h-[1px] bg-white/80 mt-4 group-hover:w-16 transition-all duration-500"></div>
          </div>
        </div>
      ))}
    </Carousel>
  );
};

// NOUVEAU: Utilise le composant Carousel
const ProductCarousel = ({ products, title, onAdd }) => {
  if (!products || products.length === 0) return null;
  return (
    <Carousel
      title={title}
      subtitle={TEXTS.sections.boutique}
      anchorId="new-in-list"
      // Largeur: 60% sur mobile, 300px sur desktop
      itemWidth="w-[60vw] sm:w-[50vw] md:w-[350px] lg:w-[300px]"
    >
      {products.map((p) => {
        const node = p.node;
        const price = parseInt(node.priceRange?.minVariantPrice?.amount || 0);
        const img1 = node.images?.edges?.[0]?.node?.url || "https://placehold.co/600x800/F0EBE5/7D7D7D?text=Image";
        const img2 = node.images?.edges?.[1]?.node?.url || img1;
        return (
          <div key={node.id} className="group cursor-pointer pb-6">
            <div className="relative aspect-[3/4] bg-finca-medium mb-6 overflow-hidden rounded-sm shadow-lg">
              {/* Image 1: Default view */}
              <img src={img1} alt={node.title} className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 group-hover:opacity-0" />
              {/* Image 2: Hover view */}
              <img src={img2} alt={node.title} className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-1000 group-hover:opacity-100 scale-105" />
              <button 
                onClick={(e) => { e.stopPropagation(); onAdd(node); }}
                className="absolute bottom-0 left-0 w-full bg-finca-light/95 backdrop-blur-sm text-stone-900 py-4 uppercase text-[10px] tracking-[0.2em] font-bold translate-y-full group-hover:translate-y-0 transition-transform duration-500 hover:bg-stone-900 hover:text-white border-t border-stone-100 rounded-sm"
              >
                Ajouter au panier
              </button>
            </div>
            <div className="text-left px-1">
              <h3 className="font-serif text-lg text-stone-900 mb-1 leading-tight group-hover:text-stone-600 transition-colors">{node.title}</h3>
              <p className="text-[10px] text-stone-400 uppercase tracking-widest mb-2 font-serif">{node.productType}</p>
              <span className="text-sm font-medium text-stone-800">{price} €</span>
            </div>
          </div>
        );
      })}
    </Carousel>
  );
};

const MaterialsSection = () => (
  <section className="py-24 bg-finca-medium border-t border-b border-stone-200">
    <div className="max-w-[1600px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
      {TEXTS.materials.map((item, index) => (
        <div key={index} className="flex flex-col items-center">
          <h3 className="font-serif text-xl mb-3 text-stone-900 italic">{item.title}</h3>
          <p className="text-sm text-stone-600 font-light leading-relaxed max-w-xs">{item.text}</p>
        </div>
      ))}
    </div>
  </section>
);

// NOUVEAU: Utilise le composant Carousel (JournalSection renommé en JournalCarousel)
const JournalCarousel = ({ articles, onArticleClick }) => {
  if (!articles || articles.length === 0) return null;
  return (
    <Carousel 
      title={TEXTS.sections.journal_title} 
      subtitle={TEXTS.sections.journal_subtitle} 
      anchorId="journal-section" 
      // MODIFICATION APPLIQUÉE : Réduction supplémentaire pour un aspect plus élancé et luxueux
      itemWidth="w-[65vw] sm:w-[45vw] md:w-[280px] lg:w-[300px]"
    >
      {articles.map((article, idx) => {
        const node = article.node;
        return (
          <div key={idx} onClick={() => onArticleClick(article)} className="group cursor-pointer flex flex-col items-center text-center">
            <div className="relative aspect-[3/4] w-full overflow-hidden mb-8 bg-finca-medium rounded-sm shadow-xl">
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-700 z-10" />
              <img 
                src={node.image?.url || "https://placehold.co/600x800/F0EBE5/7D7D7D?text=Article"} 
                alt={node.title} 
                className="w-full h-full object-cover transition-transform duration-[1.8s] ease-out group-hover:scale-105 opacity-95" 
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20">
                <span className="bg-white/95 backdrop-blur-sm text-stone-900 px-8 py-3 uppercase text-[10px] tracking-[0.25em] font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 rounded-sm">Lire</span>
              </div>
            </div>
            <div className="px-4 max-w-sm">
              <span className="text-[9px] uppercase tracking-[0.25em] text-stone-400 block mb-4 font-sans">{new Date(node.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <h3 className="text-2xl md:text-2xl font-serif text-stone-900 mb-4 leading-tight group-hover:text-stone-600 transition-colors">{node.title}</h3>
              <p className="text-stone-500 font-serif text-sm italic leading-loose line-clamp-3">{node.excerpt}</p>
            </div>
          </div>
        );
      })}
      {/* Ajout d'un bouton "Voir tout" comme dernier élément du carousel (pas un snap point) */}
      <div className="flex-shrink-0 flex items-center justify-center w-[45vw] sm:w-[35vw] md:w-[250px] lg:w-[300px] pr-10">
        <button className="text-[10px] uppercase tracking-[0.2em] text-stone-400 hover:text-stone-900 transition-colors border-b border-transparent hover:border-stone-900 pb-1 font-serif flex items-center gap-3">
          {TEXTS.sections.journal_link} <ChevronRight size={14} />
        </button>
      </div>
    </Carousel>
  );
};

const InstagramSection = () => {
  // Les posts sont maintenant importés de MEDIA_CONFIG
  const posts = MEDIA_CONFIG.INSTAGRAM_POSTS;

  return (
    <section className="py-24 bg-finca-light">
      <div className="max-w-[1600px] mx-auto px-6">
        <a href={EXTERNAL_LINKS.INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center mb-12 group">
          <Instagram size={20} className="text-stone-900 mb-4 group-hover:text-stone-600 transition-colors" />
          <h3 className="text-xl font-serif text-stone-900 mb-2 group-hover:text-stone-600 transition-colors">@lamaisonibizienne</h3>
          <p className="text-[10px] uppercase tracking-widest text-stone-400 font-serif">Suivez-nous</p>
        </a>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 md:gap-4">
          {posts.map((img, i) => (
            <a key={i} href={EXTERNAL_LINKS.INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="relative aspect-square overflow-hidden group cursor-pointer bg-finca-medium rounded-sm">
              <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" />
              <div className="absolute inset-0 bg-stone-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Heart size={20} fill="white" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

const CartDrawer = ({ isOpen, onClose, items, onRemove }) => {
  const total = items.reduce((acc, item) => acc + (parseFloat(item.selectedVariant?.price?.amount || item.priceRange?.minVariantPrice?.amount || 0) * (item.quantity || 1)), 0);

  return (
    <>
      {/* Overlay */}
      <div className={`fixed inset-0 z-[60] bg-stone-900/20 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      
      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-[450px] bg-finca-light z-[70] shadow-2xl transform transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col rounded-l-lg`}>
        <div className="p-8 border-b border-stone-200 flex justify-between items-center">
          <h2 className="font-serif text-xl text-stone-900 italic">Panier</h2>
          <button onClick={onClose} className="hover:rotate-90 transition-transform duration-300 text-stone-500 hover:text-stone-900">
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-4">
              <ShoppingBag size={32} strokeWidth={1} opacity={0.3} />
              <p className="font-serif text-sm italic">Votre panier est vide</p>
            </div>
          ) : (
            items.map((item, index) => (
              <div key={index} className="flex gap-6 animate-fade-in">
                <div className="w-20 h-28 bg-finca-medium flex-shrink-0 rounded-sm">
                  <img 
                    src={item.selectedVariant?.image?.url || item.images?.edges?.[0]?.node?.url || "https://placehold.co/600x800/F0EBE5/7D7D7D?text=Image"} 
                    alt={item.title} 
                    className="w-full h-full object-cover mix-blend-multiply" 
                  />
                </div>
                <div className="flex-1 py-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-serif text-base text-stone-900 leading-tight mb-2">{item.title}</h4>
                    <p className="text-stone-400 text-[10px] uppercase tracking-widest font-serif">{item.selectedVariant?.title !== 'Default Title' ? item.selectedVariant?.title : item.productType}</p>
                    <p className="text-stone-400 text-[10px] uppercase tracking-widest font-serif mt-1">Qté: {item.quantity || 1}</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-stone-900 font-medium text-sm">{Math.round(parseFloat(item.selectedVariant?.price?.amount || item.priceRange?.minVariantPrice?.amount || 0) * (item.quantity || 1))} €</span>
                    <button onClick={() => onRemove(index)} className="text-xs text-stone-400 underline hover:text-red-900">Retirer</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {items.length > 0 && (
          <div className="p-8 bg-finca-medium rounded-t-xl shadow-inner">
            <div className="flex justify-between items-center mb-6 text-xl font-serif text-stone-900">
              <span>Total</span>
              <span>{Math.round(total)} €</span>
            </div>
            <button 
              onClick={() => proceedToCheckout(items)} 
              className="w-full bg-stone-900 text-finca-light py-5 uppercase tracking-[0.2em] text-xs font-bold hover:bg-stone-700 transition-colors rounded-sm"
            >
              Paiement
            </button>
          </div>
        )}
      </div>
    </>
  );
};

const Footer = ({ logo }) => (
  <footer className="bg-[#1C1C1C] text-finca-light py-24">
    <div className="max-w-[1800px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12">
      <div className="md:col-span-1">
        <h3 className="text-2xl font-serif tracking-[0.1em] font-bold mb-6">{logo}</h3>
        <p className="text-stone-400 text-sm font-serif italic leading-relaxed max-w-xs whitespace-pre-line">{TEXTS.footer.about}</p>
      </div>
      <div>
        <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-8 text-stone-500 font-serif">Service</h4>
        <ul className="space-y-4 text-sm font-light text-stone-300 font-serif">
          <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
          <li><a href="#" className="hover:text-white transition-colors">Livraison</a></li>
        </ul>
      </div>
      <div>
        <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-8 text-stone-500 font-serif">Maison</h4>
        <ul className="space-y-4 text-sm font-light text-stone-300 font-serif">
          <li><a href="#" className="hover:text-white transition-colors">Philosophie</a></li>
          <li><a href="#" className="hover:text-white transition-colors">Journal</a></li>
        </ul>
      </div>
      <div>
        <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-8 text-stone-500 font-serif">Social</h4>
        <div className="flex gap-6 text-stone-400">
          <a href={EXTERNAL_LINKS.INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"><Instagram className="hover:text-white cursor-pointer transition-colors" size={20} /></a>
          <a href={EXTERNAL_LINKS.FACEBOOK_URL} target="_blank" rel="noopener noreferrer"><Facebook className="hover:text-white cursor-pointer transition-colors" size={20} /></a>
        </div>
      </div>
    </div>
  </footer>
);

// ==============================================================================
// 5. COMPOSANT PRINCIPAL (APP)
// ==============================================================================

export default function App() {
  const [loading, setLoading] = useState(true);
  const [storeData, setStoreData] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [activeProducts, setActiveProducts] = useState([]); 
  const [activeCollectionName, setActiveCollectionName] = useState("");
  const [activeArticle, setActiveArticle] = useState(null);
  const [selectingProduct, setSelectingProduct] = useState(null);

  useEffect(() => {
    // Inject Tailwind config and font link dynamically
    const style = document.createElement('script');
    style.innerHTML = TailwindConfig;
    document.head.appendChild(style);

    const fontLink = document.createElement('link');
    fontLink.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap";
    fontLink.rel = "stylesheet";
    document.head.appendChild(fontLink);
    
    // --- Data Fetch ---
    fetchShopifyData().then((data) => {
      const allData = data || FALLBACK_DATA;
      setStoreData(allData);
      const collections = allData.collections?.edges || [];
      const validCollections = collections.filter(c => {
        const title = c.node.title.toLowerCase();
        // Filter out system or unwanted collections
        return !['coaching', 'service', 'homepage', 'frontpage'].some(bad => title.includes(bad));
      });
      if (validCollections.length > 0) {
        // Set the first valid collection as the default view
        setActiveProducts(validCollections[0].node.products.edges);
        setActiveCollectionName(validCollections[0].node.title);
      }
      setLoading(false);
    });
  }, []);

  const scrollToCollections = useCallback(() => { 
    document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' }); 
  }, []);
  
  const handleCollectionSelect = useCallback((collectionId) => {
    if (!storeData) return;
    const collection = storeData.collections.edges.find(c => c.node.id === collectionId);
    if (collection) {
      setActiveProducts(collection.node.products.edges);
      setActiveCollectionName(collection.node.title);
      setTimeout(() => {
        // Scroll smoothly to the product list (offset for the fixed navbar)
        const productList = document.getElementById('new-in-list');
        if (productList) {
            const y = productList.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({top: y, behavior: 'smooth'});
        }
      }, 100);
    }
  }, [storeData]);


  const addToCart = useCallback((product, variant, quantity = 1) => {
    setCartItems(prevItems => [...prevItems, { 
      ...product, 
      selectedVariant: variant, 
      selectedVariantId: variant?.id,
      quantity: quantity 
    }]);
    setCartOpen(true);
    setSelectingProduct(null);
  }, []);

  const handleAddToCartClick = useCallback((product) => {
    const variants = product.variants?.edges || [];
    // Check if multiple variants or if the single variant is NOT "Default Title"
    if (variants.length > 1 || (variants.length === 1 && variants[0].node.title !== "Default Title")) {
      setSelectingProduct(product); 
    } else {
      // Direct add to cart if only one default variant exists
      addToCart(product, variants[0]?.node, 1);
    }
  }, [addToCart]);

  const removeFromCart = useCallback((indexToRemove) => {
    setCartItems(cartItems.filter((_, index) => index !== indexToRemove));
  }, [cartItems]);


  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-finca-light"><Loader className="animate-spin text-stone-400" /></div>;

  const collections = storeData?.collections?.edges || [];
  const blogArticles = storeData?.blogs?.edges?.[0]?.node?.articles?.edges || [];
  const shopName = storeData?.shop?.name || "La Maison";

  if (activeArticle) {
    return (
      <div className="font-sans text-stone-900 bg-white min-h-screen">
        <Navbar logo={shopName} cartCount={cartItems.length} onOpenCart={() => setCartOpen(true)} isArticleView={true} onBack={() => setActiveArticle(null)} />
        <ArticleView article={activeArticle} />
        <Footer logo={shopName} />
        <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} items={cartItems} onRemove={removeFromCart} />
      </div>
    );
  }

  return (
    <div className="font-sans text-stone-900 bg-finca-light min-h-screen selection:bg-finca-medium/50">
      <Navbar logo={shopName} cartCount={cartItems.length} onOpenCart={() => setCartOpen(true)} />
      <main>
        <HeroSection onScroll={scrollToCollections} />
        {/* Composants convertis en carousels */}
        <CollectionCarousel collections={collections} onCollectionSelect={handleCollectionSelect} />
        <MaterialsSection />
        <div id="new-in">
          <ProductCarousel products={activeProducts} title={activeCollectionName} onAdd={handleAddToCartClick} />
        </div>
        <JournalCarousel articles={blogArticles} onArticleClick={setActiveArticle} />
        <InstagramSection />
      </main>
      <Footer logo={shopName} />
      {/* Modals and Drawers */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} items={cartItems} onRemove={removeFromCart} />
      {selectingProduct && (
        <VariantSelector product={selectingProduct} onClose={() => setSelectingProduct(null)} onConfirm={addToCart} />
      )}
    </div>
  );
}
