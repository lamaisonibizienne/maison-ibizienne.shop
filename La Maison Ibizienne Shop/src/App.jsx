import React, { useState, useEffect } from 'react';
import { ShoppingBag, X, Instagram, Facebook, Loader, ChevronRight, Menu, ArrowRight, ArrowLeft, Heart, ChevronDown } from 'lucide-react';

// ==============================================================================
// 1. CONFIGURATION TECHNIQUE
// ==============================================================================

const STOREFRONT_ACCESS_TOKEN = '4b2746c099f9603fde4f9639336a235d'; 
const SHOPIFY_DOMAIN = '91eg2s-ah.myshopify.com'; 
const API_VERSION = '2024-01';
const HERO_VIDEO_URL = "https://cdn.shopify.com/videos/c/o/v/c4d96d8c70b64465835c4eadaa115175.mp4";

const INSTAGRAM_URL = "https://www.instagram.com/lamaisonibizienne";
const FACEBOOK_URL = "https://www.facebook.com/lamaisonibizienne";

// ==============================================================================
// 2. TEXTES MODIFIABLES
// ==============================================================================

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
      title: "Artisanat",
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

// ==============================================================================
// 3. LOGIQUE API
// ==============================================================================

const proceedToCheckout = (cartItems) => {
  if (cartItems.length === 0) return;
  const itemsString = cartItems.map(item => {
    // L'item dans le panier contient maintenant le variantId spécifique choisi
    let variantId = item.selectedVariantId?.split('/').pop(); 
    // Fallback si ancienne structure
    if (!variantId) variantId = item.variants?.edges?.[0]?.node?.id?.split('/').pop();
    if (!variantId) variantId = item.id.split('/').pop();
    return `${variantId}:1`; 
  }).join(',');
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
                
                # CORRECTION : On récupère TOUTES les infos des variantes
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
          articles(first: 3) {
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
  } catch (error) { return null; }
}

const FALLBACK_DATA = { shop: { name: "LA MAISON" }, collections: { edges: [] }, products: { edges: [] } };

// ==============================================================================
// 4. COMPOSANTS DESIGN
// ==============================================================================

const Navbar = ({ logo, cartCount, onOpenCart, isArticleView, onBack }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isArticleView) {
    return (
      <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b border-stone-100 py-4">
        <div className="max-w-[1200px] mx-auto px-6 flex justify-between items-center">
          <button onClick={onBack} className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold hover:text-stone-500 transition-colors">
            <ArrowLeft size={16} /> Retour
          </button>
          <div className="text-xl font-serif font-bold tracking-[0.15em] text-stone-900">{logo}</div>
          <div className="w-16"></div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 border-b ${isScrolled ? 'bg-[#FDFBF7]/95 backdrop-blur-md border-stone-200 py-4 shadow-sm' : 'bg-transparent border-transparent py-6'}`}>
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 grid grid-cols-12 items-start">
        <div className="col-span-4 hidden lg:flex gap-8 text-[10px] uppercase tracking-[0.25em] font-serif text-stone-900 pt-1">
          <a href="#collections" className="hover:text-stone-500 transition-colors whitespace-nowrap">Collections</a>
          <a href="#new-in" className="hover:text-stone-500 transition-colors whitespace-nowrap">Nouveautés</a>
          <a href="#journal" className="hover:text-stone-500 transition-colors whitespace-nowrap">Journal</a>
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
  <div className="relative h-[95vh] w-full flex flex-col justify-center items-center text-center px-4 overflow-hidden bg-[#F2F0EB]">
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
        <button onClick={onScroll} className="group relative overflow-hidden bg-[#FDFBF7] text-stone-900 px-10 py-4 uppercase tracking-[0.25em] text-[10px] font-bold transition-all hover:bg-white hover:px-12 shadow-lg">
          <span className="relative z-10">{TEXTS.hero.button}</span>
        </button>
      </div>
    </div>
  </div>
);

// MODAL DE SÉLECTION DE VARIANTE (CORRIGÉE & DYNAMIQUE)
const VariantSelector = ({ product, onClose, onConfirm }) => {
  // Sélectionne la première variante par défaut
  const [selectedVariant, setSelectedVariant] = useState(product.variants.edges[0]?.node);

  return (
    <div className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-[#FDFBF7] w-full max-w-md shadow-2xl p-8 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-900"><X size={20} /></button>
        
        <div className="flex gap-6 mb-8">
          <div className="w-24 h-32 bg-stone-100 flex-shrink-0 overflow-hidden">
             {/* Image dynamique selon la variante */}
            <img 
              src={selectedVariant?.image?.url || product.images?.edges?.[0]?.node?.url} 
              alt={product.title} 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <h3 className="font-serif text-xl text-stone-900 mb-2">{product.title}</h3>
            <p className="text-stone-500 text-xs uppercase tracking-widest mb-2">{product.productType}</p>
            {/* Prix dynamique selon la variante */}
            <p className="text-stone-900 font-medium text-lg">
              {parseInt(selectedVariant?.price?.amount || 0)} €
            </p>
          </div>
        </div>

        <div className="mb-8">
          <label className="text-[10px] uppercase tracking-[0.2em] text-stone-500 block mb-3 font-bold">Choisir une option</label>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {product.variants.edges.map(({ node }) => (
              <button
                key={node.id}
                onClick={() => setSelectedVariant(node)}
                className={`w-full text-left px-4 py-3 text-sm font-serif border transition-all flex justify-between items-center ${selectedVariant?.id === node.id ? 'border-stone-900 bg-white shadow-sm' : 'border-stone-200 hover:border-stone-400'}`}
              >
                <span>{node.title}</span>
                {selectedVariant?.id === node.id && <div className="w-2 h-2 bg-stone-900 rounded-full"></div>}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={() => onConfirm(product, selectedVariant)}
          className="w-full bg-stone-900 text-white py-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-stone-700 transition-colors"
        >
          Ajouter au panier - {parseInt(selectedVariant?.price?.amount || 0)} €
        </button>
      </div>
    </div>
  );
};

const ArticleView = ({ article }) => {
  if (!article) return null;
  const node = article.node;
  return (
    <div className="bg-white min-h-screen pt-32 pb-24 animate-fade-in">
      <article className="max-w-[800px] mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-[10px] uppercase tracking-[0.3em] text-stone-400 block mb-4">{new Date(node.publishedAt).toLocaleDateString()} — {node.authorV2?.name || "La Maison"}</span>
          <h1 className="text-4xl md:text-5xl font-serif text-stone-900 leading-tight mb-8">{node.title}</h1>
          <div className="w-12 h-[1px] bg-stone-300 mx-auto"></div>
        </div>
        {node.image && <div className="mb-16"><img src={node.image.url} alt={node.title} className="w-full h-auto object-cover shadow-sm" /></div>}
        <div className="prose prose-stone prose-lg mx-auto font-serif text-stone-600 leading-loose first-letter:text-5xl first-letter:font-serif first-letter:float-left first-letter:mr-3 first-letter:mt-[-10px]" dangerouslySetInnerHTML={{ __html: node.contentHtml }} />
        <div className="mt-20 pt-10 border-t border-stone-100 text-center"><p className="text-xs uppercase tracking-widest text-stone-400">La Maison Ibizienne</p></div>
      </article>
    </div>
  );
};

const CollectionsGrid = ({ collections, onCollectionSelect }) => {
  const validCollections = collections.filter(c => {
    const title = c.node.title.toLowerCase();
    return !['coaching', 'service', 'homepage', 'frontpage'].some(bad => title.includes(bad)) && c.node.products.edges.length > 0;
  });
  if (validCollections.length === 0) return null;
  return (
    <section id="collections" className="py-24 px-6 max-w-[1800px] mx-auto bg-[#FDFBF7]">
      <div className="text-center mb-16">
        <span className="text-[10px] font-serif tracking-[0.3em] text-stone-400 uppercase mb-4 block">Découvrir</span>
        <h2 className="text-3xl font-serif text-stone-900 italic">{TEXTS.sections.univers}</h2>
        <div className="w-12 h-[1px] bg-stone-300 mx-auto mt-6"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {validCollections.map((col) => (
          <div key={col.node.id} onClick={() => onCollectionSelect(col.node.id)} className="group cursor-pointer relative h-[500px] overflow-hidden bg-[#F0EBE5]">
            <img src={col.node.image?.url || "https://via.placeholder.com/800"} alt={col.node.title} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105 opacity-95 hover:opacity-100" />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-700" />
            <div className="absolute bottom-10 left-10 text-white z-10">
              <span className="text-[10px] uppercase tracking-[0.3em] mb-3 block font-serif italic drop-shadow-md">Collection</span>
              <h3 className="text-3xl font-serif leading-none drop-shadow-md">{col.node.title}</h3>
              <div className="w-8 h-[1px] bg-white/80 mt-4 group-hover:w-16 transition-all duration-500"></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const ProductGrid = ({ products, title, onAdd }) => {
  if (!products || products.length === 0) return null;
  return (
    <section id="new-in" className="py-24 px-6 max-w-[1800px] mx-auto border-t border-stone-200 bg-[#FDFBF7]">
      <div className="flex flex-col items-center mb-20">
        <span className="text-[10px] font-serif tracking-[0.3em] text-stone-500 uppercase mb-4 italic">{TEXTS.sections.boutique}</span>
        <h2 className="text-4xl font-serif text-stone-900">{title}</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-16">
        {products.map((p) => {
          const node = p.node;
          const price = parseInt(node.priceRange?.minVariantPrice?.amount || 0);
          const img1 = node.images?.edges?.[0]?.node?.url;
          const img2 = node.images?.edges?.[1]?.node?.url || img1;
          return (
            <div key={node.id} className="group cursor-pointer">
              <div className="relative aspect-[3/4] bg-[#F5F2EB] mb-6 overflow-hidden">
                <img src={img1} alt={node.title} className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 group-hover:opacity-0" />
                <img src={img2} alt={node.title} className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-1000 group-hover:opacity-100 scale-105" />
                <button 
                  onClick={() => onAdd(node)}
                  className="absolute bottom-0 left-0 w-full bg-[#FDFBF7]/95 backdrop-blur-sm text-stone-900 py-4 uppercase text-[10px] tracking-[0.2em] font-bold translate-y-full group-hover:translate-y-0 transition-transform duration-500 hover:bg-stone-900 hover:text-white border-t border-stone-100"
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
      </div>
    </section>
  );
};

const MaterialsSection = () => (
  <section className="py-24 bg-[#FDFBF7] border-t border-stone-200">
    <div className="max-w-[1600px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
      {TEXTS.materials.map((item, index) => (
        <div key={index} className="flex flex-col items-center">
          <h3 className="font-serif text-xl mb-3 text-stone-900 italic">{item.title}</h3>
          <p className="text-sm text-stone-500 font-light leading-relaxed max-w-xs">{item.text}</p>
        </div>
      ))}
    </div>
  </section>
);

const JournalSection = ({ articles, onArticleClick }) => {
  if (!articles || articles.length === 0) return null;
  return (
    <section id="journal" className="py-32 bg-[#F5F2EB]">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-6 border-b border-stone-300 pb-8">
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-stone-500 font-serif italic block mb-4">{TEXTS.sections.journal_subtitle}</span>
            <h2 className="text-5xl font-serif text-stone-900">{TEXTS.sections.journal_title}</h2>
          </div>
          <button className="text-xs uppercase tracking-widest text-stone-600 hover:text-stone-900 transition-colors font-serif">{TEXTS.sections.journal_link}</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {articles.map((article, idx) => {
            const node = article.node;
            return (
              <div key={idx} onClick={() => onArticleClick(article)} className="group cursor-pointer block">
                <div className="relative aspect-[4/3] overflow-hidden mb-8 bg-[#EBE5DE]">
                  <img src={node.image?.url} alt={node.title} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105 opacity-95 group-hover:opacity-100" />
                </div>
                <div className="pr-6">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-stone-500 block mb-3 font-serif">{new Date(node.publishedAt).toLocaleDateString()}</span>
                  <h3 className="text-2xl font-serif text-stone-900 mb-4 leading-tight group-hover:text-stone-600 transition-colors">{node.title}</h3>
                  <p className="text-stone-600 font-serif text-sm italic leading-relaxed line-clamp-3">{node.excerpt}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const InstagramSection = () => {
  const posts = [
    "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522771753035-4a50c95b9389?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?q=80&w=600&auto=format&fit=crop"
  ];
  return (
    <section className="py-24 bg-[#FDFBF7]">
      <div className="max-w-[1600px] mx-auto px-6">
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center mb-12 group">
          <Instagram size={20} className="text-stone-900 mb-4 group-hover:text-stone-600 transition-colors" />
          <h3 className="text-xl font-serif text-stone-900 mb-2 group-hover:text-stone-600 transition-colors">@lamaisonibizienne</h3>
          <p className="text-[10px] uppercase tracking-widest text-stone-400">Suivez-nous</p>
        </a>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 md:gap-4">
          {posts.map((img, i) => (
            <a key={i} href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="relative aspect-square overflow-hidden group cursor-pointer bg-[#F0EBE5]">
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

const CartDrawer = ({ isOpen, onClose, items }) => (
  <>
    <div className={`fixed inset-0 z-[60] bg-stone-900/20 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
    <div className={`fixed inset-y-0 right-0 w-full md:w-[450px] bg-[#FDFBF7] z-[70] shadow-2xl transform transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
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
              <div className="w-20 h-28 bg-[#F5F2EB] flex-shrink-0">
                <img src={item.selectedVariant?.image?.url || item.images?.edges?.[0]?.node?.url} className="w-full h-full object-cover mix-blend-multiply" />
              </div>
              <div className="flex-1 py-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-serif text-base text-stone-900 leading-tight mb-2">{item.title}</h4>
                  {/* On affiche le nom de la variante choisie */}
                  <p className="text-stone-400 text-[10px] uppercase tracking-widest font-serif">{item.selectedVariant?.title !== 'Default Title' ? item.selectedVariant?.title : item.productType}</p>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-stone-900 font-medium text-sm">{parseInt(item.priceRange?.minVariantPrice?.amount)} €</span>
                  <button className="text-xs text-stone-400 underline hover:text-red-900">Retirer</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {items.length > 0 && (
        <div className="p-8 bg-[#F5F2EB]">
          <div className="flex justify-between items-center mb-6 text-xl font-serif text-stone-900">
            <span>Total</span>
            <span>{items.reduce((acc, item) => acc + parseInt(item.priceRange?.minVariantPrice?.amount || 0), 0)} €</span>
          </div>
          <button onClick={() => proceedToCheckout(items)} className="w-full bg-stone-900 text-[#FDFBF7] py-5 uppercase tracking-[0.2em] text-xs font-bold hover:bg-stone-700 transition-colors">
            Paiement
          </button>
        </div>
      )}
    </div>
  </>
);

const Footer = ({ logo }) => (
  <footer className="bg-[#1C1C1C] text-[#FDFBF7] py-24">
    <div className="max-w-[1800px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12">
      <div className="md:col-span-1">
        <h3 className="text-2xl font-serif tracking-[0.1em] font-bold mb-6">{logo}</h3>
        <p className="text-stone-400 text-sm font-serif italic leading-relaxed max-w-xs">{TEXTS.footer.about}</p>
      </div>
      <div>
        <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-8 text-stone-500">Service</h4>
        <ul className="space-y-4 text-sm font-light text-stone-300 font-serif">
          <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
          <li><a href="#" className="hover:text-white transition-colors">Livraison</a></li>
        </ul>
      </div>
      <div>
        <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-8 text-stone-500">Maison</h4>
        <ul className="space-y-4 text-sm font-light text-stone-300 font-serif">
          <li><a href="#" className="hover:text-white transition-colors">Philosophie</a></li>
          <li><a href="#" className="hover:text-white transition-colors">Journal</a></li>
        </ul>
      </div>
      <div>
        <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-8 text-stone-500">Social</h4>
        <div className="flex gap-6 text-stone-400">
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"><Instagram className="hover:text-white cursor-pointer transition-colors" size={20} /></a>
          <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer"><Facebook className="hover:text-white cursor-pointer transition-colors" size={20} /></a>
        </div>
      </div>
    </div>
  </footer>
);

export default function App() {
  const [loading, setLoading] = useState(true);
  const [storeData, setStoreData] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [activeProducts, setActiveProducts] = useState([]); 
  const [activeCollectionName, setActiveCollectionName] = useState("");
  const [activeArticle, setActiveArticle] = useState(null);
  
  // NOUVEAU STATE : Produit en cours de sélection de variante
  const [selectingProduct, setSelectingProduct] = useState(null);

  useEffect(() => {
    fetchShopifyData().then((data) => {
      const allData = data || FALLBACK_DATA;
      setStoreData(allData);
      
      const collections = allData.collections?.edges || [];
      const validCollections = collections.filter(c => {
        const title = c.node.title.toLowerCase();
        return !['coaching', 'service', 'homepage', 'frontpage'].some(bad => title.includes(bad));
      });

      if (validCollections.length > 0) {
        setActiveProducts(validCollections[0].node.products.edges);
        setActiveCollectionName(validCollections[0].node.title);
      }
      setLoading(false);
    });
  }, []);

  const scrollToCollections = () => { document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' }); };
  
  // MODIFICATION DE LA FONCTION D'AJOUT
  const handleAddToCartClick = (product) => {
    const variants = product.variants?.edges || [];
    // Si plus d'une variante, ou si la seule variante n'est pas "Default Title"
    if (variants.length > 1 || (variants.length === 1 && variants[0].node.title !== "Default Title")) {
      setSelectingProduct(product); // Ouvre la modal
    } else {
      // Ajout direct (une seule variante par défaut)
      addToCart(product, variants[0]?.node);
    }
  };

  const addToCart = (product, variant) => {
    // On ajoute le produit avec l'info de la variante choisie
    setCartItems([...cartItems, { ...product, selectedVariant: variant, selectedVariantId: variant?.id }]);
    setCartOpen(true);
    setSelectingProduct(null); // Ferme la modal
  };

  const handleCollectionSelect = (collectionId) => {
    const collection = storeData.collections.edges.find(c => c.node.id === collectionId);
    if (collection) {
      setActiveProducts(collection.node.products.edges);
      setActiveCollectionName(collection.node.title);
      setTimeout(() => {
        const productList = document.getElementById('new-in');
        if (productList) {
            const y = productList.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({top: y, behavior: 'smooth'});
        }
      }, 100);
    }
  };

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-[#FDFBF7]"><Loader className="animate-spin text-stone-400" /></div>;

  const collections = storeData.collections?.edges || [];
  const blogArticles = storeData.blogs?.edges?.[0]?.node?.articles?.edges || [];

  if (activeArticle) {
    return (
      <div className="font-sans text-stone-900 bg-white min-h-screen">
        <Navbar logo={storeData.shop?.name} cartCount={cartItems.length} onOpenCart={() => setCartOpen(true)} isArticleView={true} onBack={() => setActiveArticle(null)} />
        <ArticleView article={activeArticle} />
        <Footer logo={storeData.shop?.name} />
      </div>
    );
  }

  return (
    <div className="font-sans text-stone-900 bg-[#FDFBF7] min-h-screen selection:bg-stone-200">
      <Navbar logo={storeData.shop?.name} cartCount={cartItems.length} onOpenCart={() => setCartOpen(true)} />
      
      <main>
        <HeroSection onScroll={scrollToCollections} />
        <CollectionsGrid collections={collections} onCollectionSelect={handleCollectionSelect} />
        <MaterialsSection />
        
        <div id="new-in">
          {/* On passe la nouvelle fonction handleAddToCartClick */}
          <ProductGrid products={activeProducts} title={activeCollectionName} onAdd={handleAddToCartClick} />
        </div>

        <JournalSection articles={blogArticles} onArticleClick={setActiveArticle} />
        <InstagramSection />
      </main>
      
      <Footer logo={storeData.shop?.name} />
      
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} items={cartItems} />
      
      {/* MODAL DE SÉLECTION */}
      {selectingProduct && (
        <VariantSelector 
          product={selectingProduct} 
          onClose={() => setSelectingProduct(null)} 
          onConfirm={addToCart} 
        />
      )}
    </div>
  );
}
