import React, { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X, ArrowRight, Instagram, Facebook, Search, Loader, AlertCircle } from 'lucide-react';

// ==============================================================================
// CONFIGURATION SHOPIFY
// ==============================================================================

// 1. VOTRE JETON D'ACCÈS (Celui que vous avez généré)
const STOREFRONT_ACCESS_TOKEN = '4b2746c099f9603fde4f9639336a235d'; 

// 2. VOTRE DOMAINE TECHNIQUE (Celui de votre admin)
// Correction faite avec votre ID "91eg2s-ah"
const SHOPIFY_DOMAIN = '91eg2s-ah.myshopify.com'; 

const API_VERSION = '2024-01';

// ==============================================================================
// SERVICE LAYER (Connexion à Shopify)
// ==============================================================================

async function fetchShopifyData() {
  const query = `
  {
    shop {
      name
      description
    }
    products(first: 8) {
      edges {
        node {
          id
          title
          handle
          description
          productType
          tags
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 1) {
            edges {
              node {
                url
              }
            }
          }
        }
      }
    }
    collections(first: 3) {
      edges {
        node {
          title
          handle
          image {
            url
          }
        }
      }
    }
  }`;

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
    if (json.errors) {
      console.error("Erreur API Shopify:", json.errors);
      return null;
    }
    return json.data;
  } catch (error) {
    console.error("Erreur réseau ou configuration:", error);
    return null;
  }
}

// Données de secours (Si la connexion échoue pour une raison X ou Y)
const FALLBACK_DATA = {
  shop: {
    name: "LA MAISON IBIZIENNE",
    description: "L'Art de Vivre Solaire"
  },
  collections: {
    edges: [
      { node: { title: "Luminaires en Rotin", image: { url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop" } } },
      { node: { title: "Assises Bois Massif", image: { url: "https://images.unsplash.com/photo-1538688521862-48fa88742153?q=80&w=800&auto=format&fit=crop" } } },
      { node: { title: "Céramiques & Vases", image: { url: "https://images.unsplash.com/photo-1612152605332-2e1919876371?q=80&w=800&auto=format&fit=crop" } } }
    ]
  },
  products: {
    edges: [
      {
        node: {
          id: "1", title: "Suspension Cala Salada", productType: "Luminaire", tags: ["Best-seller"],
          priceRange: { minVariantPrice: { amount: "189.00", currencyCode: "EUR" } },
          images: { edges: [{ node: { url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1000&auto=format&fit=crop" } }] }
        }
      },
      {
        node: {
          id: "2", title: "Tabouret Brut Teck", productType: "Mobilier", tags: ["Fait main"],
          priceRange: { minVariantPrice: { amount: "145.00", currencyCode: "EUR" } },
          images: { edges: [{ node: { url: "https://images.unsplash.com/photo-1594056223528-9c4c47f7d187?q=80&w=1000&auto=format&fit=crop" } }] }
        }
      },
      {
        node: {
          id: "3", title: "Vase Amphore Terra", productType: "Décoration", tags: ["Nouveau"],
          priceRange: { minVariantPrice: { amount: "85.00", currencyCode: "EUR" } },
          images: { edges: [{ node: { url: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?q=80&w=1000&auto=format&fit=crop" } }] }
        }
      },
       {
        node: {
          id: "4", title: "Fauteuil Lounge Ibiza", productType: "Mobilier", tags: [],
          priceRange: { minVariantPrice: { amount: "450.00", currencyCode: "EUR" } },
          images: { edges: [{ node: { url: "https://images.unsplash.com/photo-1617364852223-75f57e78dc96?q=80&w=1000&auto=format&fit=crop" } }] }
        }
      }
    ]
  }
};

// ==============================================================================
// COMPOSANTS UI
// ==============================================================================

const AnnouncementBar = ({ text }) => (
  <div className="bg-[#2C2C2C] text-white text-xs py-2 text-center tracking-widest uppercase font-medium px-4">
    {text || "Livraison offerte dès 150€ d'achat"}
  </div>
);

const Navbar = ({ logo, cartCount, onOpenCart }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-stone-800">
            <Menu size={24} />
          </button>

          <div className={`text-2xl font-serif tracking-widest text-stone-900 cursor-pointer flex-1 md:flex-none text-center md:text-left font-bold`}>
            {logo}
          </div>

          <div className="hidden md:flex space-x-8 text-sm font-medium tracking-wide text-stone-600">
            {["Nouveautés", "Mobilier", "Décoration", "Luminaires", "L'Atelier"].map((item) => (
              <a key={item} href="#" className="hover:text-stone-900 transition-colors border-b-2 border-transparent hover:border-stone-900 pb-1">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center space-x-6 text-stone-800">
            <Search size={20} className="hidden md:block cursor-pointer hover:text-stone-500" />
            <div className="relative cursor-pointer" onClick={onOpenCart}>
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-stone-800 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div className="bg-white h-full w-3/4 max-w-sm p-8 flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-10">
              <span className="font-serif text-xl">{logo}</span>
              <X onClick={() => setMobileMenuOpen(false)} />
            </div>
            <div className="flex flex-col space-y-6 text-lg">
              {["Nouveautés", "Mobilier", "Décoration", "Luminaires", "L'Atelier"].map((item) => (
                <a key={item} href="#" className="text-stone-800 border-b border-stone-100 pb-2">{item}</a>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const HeroSection = ({ title, subtitle, image }) => (
  <div className="relative h-screen w-full overflow-hidden">
    <div className="absolute inset-0">
      <img src={image} alt="Hero Interior" className="w-full h-full object-cover animate-fade-in" />
      <div className="absolute inset-0 bg-black/20" />
    </div>
    
    <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 max-w-4xl mx-auto">
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white mb-6 leading-tight drop-shadow-md">
        {title || "L'Art de Vivre"}
      </h1>
      <p className="text-white/90 text-lg md:text-xl font-light mb-10 max-w-2xl tracking-wide">
        {subtitle || "Une collection exclusive de pièces artisanales."}
      </p>
      <button className="bg-white text-stone-900 px-8 py-4 uppercase tracking-widest text-sm font-bold hover:bg-stone-100 transition-colors duration-300">
        Découvrir la collection
      </button>
    </div>
  </div>
);

const CategoryGrid = ({ collections }) => {
  if (!collections || collections.length === 0) return null;
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {collections.map((cat, idx) => {
          const item = cat.node ? cat.node : cat; 
          const imageUrl = item.image?.url || item.image?.src || "https://via.placeholder.com/800";
          const title = item.title || item.name;

          return (
            <div key={idx} className="group relative h-[400px] overflow-hidden cursor-pointer">
              <img 
                src={imageUrl} 
                alt={title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
              <div className="absolute bottom-8 left-8 text-white">
                <h3 className="text-2xl font-serif mb-2">{title}</h3>
                <span className="text-sm border-b border-white pb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">Découvrir</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

const ProductCard = ({ product, onAdd }) => {
  const node = product.node ? product.node : product;
  const imageSrc = node.images?.edges?.[0]?.node?.url || node.image || "https://via.placeholder.com/600";
  
  let price = "0";
  let currencySymbol = "€";

  if (node.priceRange?.minVariantPrice) {
    price = parseInt(node.priceRange.minVariantPrice.amount);
    currencySymbol = node.priceRange.minVariantPrice.currencyCode === 'EUR' ? '€' : '$';
  } else if (node.price) {
    price = node.price;
  }
  
  const category = node.productType || (node.tags && node.tags[0]) || "Collection";

  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-[4/5] overflow-hidden bg-stone-100 mb-4">
        <img 
          src={imageSrc} 
          alt={node.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {node.tags && node.tags.includes('Best-seller') && (
          <span className="absolute top-4 left-4 bg-white/90 text-stone-900 text-[10px] px-2 py-1 uppercase tracking-wider font-bold">
            Best-seller
          </span>
        )}
        <button 
          onClick={(e) => { e.stopPropagation(); onAdd(node); }}
          className="absolute bottom-0 w-full bg-stone-900 text-white py-3 text-sm uppercase tracking-widest translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-center items-center gap-2"
        >
          Ajouter au panier
        </button>
      </div>
      <div className="text-center">
        <p className="text-xs text-stone-500 uppercase tracking-widest mb-1">{category}</p>
        <h3 className="text-stone-900 font-medium font-serif text-lg">{node.title}</h3>
        <p className="text-stone-600 mt-1">{price} {currencySymbol}</p>
      </div>
    </div>
  );
};

const FeaturedProducts = ({ products, onAdd }) => (
  <section className="py-20 bg-stone-50/50">
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-3xl md:text-4xl font-serif text-stone-900 mb-2">Nos Essentiels</h2>
          <p className="text-stone-500 font-light">Les pièces favorites de la saison</p>
        </div>
        <a href="#" className="hidden md:flex items-center gap-2 text-stone-900 border-b border-stone-900 pb-1 hover:opacity-70 transition-opacity">
          Tout voir <ArrowRight size={16} />
        </a>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product, idx) => (
          <ProductCard key={product.id || idx} product={product} onAdd={onAdd} />
        ))}
      </div>
    </div>
  </section>
);

const CartDrawer = ({ isOpen, onClose, items }) => (
  <>
    {isOpen && <div className="fixed inset-0 z-[60] bg-black/50 transition-opacity" onClick={onClose} />}
    <div className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-white z-[70] transform transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} shadow-2xl flex flex-col`}>
      <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
        <h2 className="font-serif text-xl text-stone-900">Votre Panier ({items.length})</h2>
        <X onClick={onClose} className="cursor-pointer text-stone-500 hover:text-stone-900" />
      </div>
      
      <div className="flex-1 overflow-y-auto p-6">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-stone-400">
            <ShoppingBag size={48} className="mb-4 opacity-20" />
            <p>Votre panier est vide.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {items.map((item, index) => {
              const node = item; 
              
              let price = "0";
              if (node.priceRange?.minVariantPrice) {
                price = parseInt(node.priceRange.minVariantPrice.amount);
              } else if (node.price) {
                price = node.price;
              }

              const img = node.images?.edges?.[0]?.node?.url || node.image || "https://via.placeholder.com/150";

              return (
                <div key={index} className="flex gap-4">
                  <div className="w-20 h-24 bg-stone-100 flex-shrink-0">
                    <img src={img} alt={node.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h4 className="font-medium font-serif text-stone-900">{node.title}</h4>
                      <p className="text-xs text-stone-500 uppercase mt-1">{node.productType || "Article"}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-stone-900">{price} €</span>
                      <button className="text-xs underline text-stone-400 hover:text-red-800">Retirer</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="p-6 border-t border-stone-100 bg-stone-50">
        <button className="w-full bg-stone-900 text-white py-4 uppercase tracking-widest text-sm font-bold hover:bg-stone-800 transition-colors">
          Procéder au paiement
        </button>
      </div>
    </div>
  </>
);

const Footer = ({ logo }) => (
  <footer className="bg-[#1A1A1A] text-stone-300 py-20">
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
      <div className="col-span-1 md:col-span-1">
        <h3 className="text-white font-serif text-xl tracking-widest mb-6">{logo}</h3>
        <div className="flex gap-4">
          <Instagram size={20} className="hover:text-white cursor-pointer" />
          <Facebook size={20} className="hover:text-white cursor-pointer" />
        </div>
      </div>
      <div>
        <h4 className="text-white text-sm uppercase tracking-widest mb-6 font-bold">La Maison</h4>
        <ul className="space-y-3 text-sm font-light">
          <li>À propos</li>
          <li>Nos artisans</li>
        </ul>
      </div>
    </div>
  </footer>
);

export default function App() {
  const [loading, setLoading] = useState(true);
  const [storeData, setStoreData] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    fetchShopifyData().then((data) => {
      if (data) {
        setStoreData(data);
      } else {
        console.log("Passage en mode démo (Fallback)");
        setStoreData(FALLBACK_DATA);
        setUsingFallback(true);
      }
      setLoading(false);
    });
  }, []);

  const addToCart = (product) => {
    setCartItems([...cartItems, product]);
    setCartOpen(true);
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col justify-center items-center bg-white">
        <Loader className="animate-spin text-stone-400 mb-4" size={32} />
        <p className="text-stone-500 font-serif tracking-widest text-sm animate-pulse">CHARGEMENT DE LA MAISON IBIZIENNE...</p>
      </div>
    );
  }

  const collections = storeData.collections.edges || storeData.collections;
  const products = storeData.products.edges || storeData.products;

  return (
    <div className="font-sans text-stone-800 bg-white min-h-screen selection:bg-stone-200">
      {usingFallback && (
        <div className="bg-red-50 text-red-800 text-xs py-2 px-4 text-center border-b border-red-100 flex items-center justify-center gap-2">
          <AlertCircle size={14} />
          Mode Démo : Vérifiez votre domaine myshopify.com dans le code.
        </div>
      )}

      <AnnouncementBar text={storeData.shop?.announcement || "Livraison offerte dès 150€"} />
      <Navbar 
        logo={storeData.shop?.name || "LA MAISON"} 
        cartCount={cartItems.length} 
        onOpenCart={() => setCartOpen(true)} 
      />
      
      <main>
        <HeroSection 
          title="L'Art de Vivre Solaire" 
          subtitle={storeData.shop?.description}
          image="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2400&auto=format&fit=crop"
        />
        <CategoryGrid collections={collections} />
        <FeaturedProducts products={products} onAdd={addToCart} />
        
        <section className="py-24 max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="w-full md:w-1/2">
               <div className="relative aspect-[4/5] md:aspect-square">
                <img src="https://images.unsplash.com/photo-1459416417751-936c5ad621db?q=80&w=1600&auto=format&fit=crop" alt="Artisanat" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <span className="text-xs font-bold tracking-[0.2em] text-stone-500 uppercase mb-4 block">Notre Philosophie</span>
              <h2 className="text-4xl md:text-5xl font-serif text-stone-900 mb-8 leading-tight">L'artisanat au cœur de notre démarche</h2>
              <p className="text-stone-600 leading-relaxed text-lg font-light mb-8">
                Chaque pièce raconte une histoire. Celle de mains expertes qui tissent le rotin et sculptent le bois d'olivier.
              </p>
              <button className="flex items-center gap-3 text-stone-900 font-medium hover:gap-5 transition-all">
                Lire le journal <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer logo={storeData.shop?.name || "LA MAISON"} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} items={cartItems} />
    </div>
  );
}