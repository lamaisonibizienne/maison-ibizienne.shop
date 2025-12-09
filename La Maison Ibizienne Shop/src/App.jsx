import React, { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X, ArrowRight, Instagram, Facebook, Search, Loader, AlertCircle } from 'lucide-react';

// ==============================================================================
// 1. CONFIGURATION (Vos clés personnelles)
// ==============================================================================

const STOREFRONT_ACCESS_TOKEN = '4b2746c099f9603fde4f9639336a235d'; 
const SHOPIFY_DOMAIN = '91eg2s-ah.myshopify.com'; 
const API_VERSION = '2024-01';

// ==============================================================================
// 2. LOGIQUE API & PAIEMENT (Le moteur)
// ==============================================================================

// Fonction de redirection vers le paiement sécurisé Shopify
const proceedToCheckout = (cartItems) => {
  if (cartItems.length === 0) return;

  // On transforme les produits du panier en lien de paiement
  const itemsString = cartItems.map(item => {
    // On essaie de récupérer l'ID de la variante (nécessaire pour le stock)
    // L'ID ressemble à "gid://shopify/ProductVariant/12345", on garde juste "12345"
    let variantId = item.variants?.edges?.[0]?.node?.id?.split('/').pop();
    
    // Si pas de variante trouvée, on essaie l'ID du produit (cas rare)
    if (!variantId) variantId = item.id.split('/').pop();
    
    return `${variantId}:1`; // ID : Quantité (1)
  }).join(',');

  // Redirection immédiate
  window.location.href = `https://${SHOPIFY_DOMAIN}/cart/${itemsString}`;
};

// Fonction pour récupérer les produits depuis Shopify
async function fetchShopifyData() {
  const query = `
  {
    shop {
      name
      description
    }
    products(first: 20) {
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
          variants(first: 1) {
            edges {
              node {
                id
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
    return json.data;
  } catch (error) {
    console.error("Erreur de connexion:", error);
    return null;
  }
}

// Données de secours (affichées si la connexion échoue)
const FALLBACK_DATA = {
  shop: { name: "LA MAISON IBIZIENNE", description: "L'Art de Vivre Solaire" },
  collections: { edges: [] },
  products: { edges: [] }
};

// ==============================================================================
// 3. COMPOSANTS VISUELS (Le Design)
// ==============================================================================

const Navbar = ({ logo, cartCount, onOpenCart }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="text-xl md:text-2xl font-serif tracking-[0.15em] font-bold text-stone-900 cursor-pointer">
          {logo}
        </div>
        <div className="flex items-center gap-6">
          <div className="relative cursor-pointer hover:opacity-70 transition-opacity" onClick={onOpenCart}>
            <ShoppingBag size={24} className="text-stone-800" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-stone-900 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const HeroSection = ({ title, subtitle, image, onScroll }) => (
  <div className="relative h-screen w-full flex flex-col justify-center items-center text-center px-4 overflow-hidden">
    {/* Image de fond avec overlay */}
    <div className="absolute inset-0 z-[-1]">
      <img 
        src={image || "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2400&auto=format&fit=crop"} 
        alt="Hero Interior" 
        className="w-full h-full object-cover animate-fade-in" 
      />
      <div className="absolute inset-0 bg-black/20" />
    </div>

    {/* Contenu */}
    <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white mb-6 drop-shadow-lg leading-tight animate-slide-up">
      {title || "L'Art de Vivre"}
    </h1>
    <p className="text-white/90 text-lg md:text-xl font-light mb-10 max-w-2xl tracking-wide drop-shadow-md">
      {subtitle || "Une collection exclusive de pièces artisanales pour un intérieur solaire."}
    </p>
    <button 
      onClick={onScroll}
      className="bg-white text-stone-900 px-10 py-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-stone-100 hover:scale-105 transition-all duration-300"
    >
      Découvrir la collection
    </button>
  </div>
);

const ProductCard = ({ product, onAdd }) => {
  const node = product.node || product; // Gestion de structure différente parfois
  
  // Prix : on formatte proprement
  const price = node.priceRange?.minVariantPrice?.amount 
    ? parseInt(node.priceRange.minVariantPrice.amount) 
    : 0;
    
  // Image : on prend la première ou un placeholder
  const image = node.images?.edges?.[0]?.node?.url || "https://via.placeholder.com/600x800?text=No+Image";

  return (
    <div className="group cursor-pointer flex flex-col h-full">
      <div className="relative aspect-[3/4] overflow-hidden bg-stone-100 mb-4">
        <img 
          src={image} 
          alt={node.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
        />
        {/* Bouton Ajouter (Apparaît au survol sur Desktop, toujours là sur Mobile) */}
        <button 
          onClick={(e) => { e.stopPropagation(); onAdd(node); }}
          className="absolute bottom-0 w-full bg-stone-900/95 text-white py-4 uppercase tracking-widest text-xs font-bold translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-center items-center gap-2"
        >
          Ajouter au panier
        </button>
      </div>
      <div className="text-center mt-auto">
        <p className="text-[10px] text-stone-500 uppercase tracking-widest mb-1">{node.productType || "Collection"}</p>
        <h3 className="font-serif text-lg text-stone-900 mb-1">{node.title}</h3>
        <p className="text-stone-600 font-light">{price} €</p>
      </div>
    </div>
  );
};

const CartDrawer = ({ isOpen, onClose, items }) => (
  <>
    {/* Overlay sombre */}
    <div 
      className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
      onClick={onClose}
    />
    
    {/* Panier glissant */}
    <div className={`fixed inset-y-0 right-0 w-full md:w-[450px] bg-white z-[70] shadow-2xl transform transition-transform duration-500 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
      
      {/* En-tête Panier */}
      <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
        <h2 className="font-serif text-2xl text-stone-900">Votre Panier</h2>
        <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
          <X size={24} className="text-stone-500" />
        </button>
      </div>
      
      {/* Liste des produits */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-4">
            <ShoppingBag size={48} className="opacity-20" />
            <p className="font-light">Votre panier est vide.</p>
            <button onClick={onClose} className="text-stone-900 underline text-sm">Continuer vos achats</button>
          </div>
        ) : (
          items.map((item, index) => {
            const price = parseInt(item.priceRange?.minVariantPrice?.amount || 0);
            const img = item.images?.edges?.[0]?.node?.url;
            return (
              <div key={index} className="flex gap-4 animate-fade-in">
                <div className="w-20 h-24 bg-stone-100 flex-shrink-0 overflow-hidden">
                  <img src={img} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h4 className="font-serif text-stone-900 leading-tight">{item.title}</h4>
                    <p className="text-xs text-stone-500 uppercase mt-1">{item.productType}</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="font-medium text-stone-900">{price} €</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bas du panier (Total + Bouton) */}
      {items.length > 0 && (
        <div className="p-6 border-t border-stone-100 bg-stone-50">
          <div className="flex justify-between items-center mb-6">
            <span className="text-stone-500 font-light">Sous-total</span>
            <span className="font-serif text-xl font-bold text-stone-900">
              {items.reduce((acc, item) => acc + parseInt(item.priceRange?.minVariantPrice?.amount || 0), 0)} €
            </span>
          </div>
          <button 
            onClick={() => proceedToCheckout(items)}
            className="w-full bg-stone-900 text-white py-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-stone-800 transition-all active:scale-[0.98]"
          >
            Procéder au paiement
          </button>
          <p className="text-center text-[10px] text-stone-400 mt-4 uppercase tracking-widest">
            Paiement sécurisé par Shopify
          </p>
        </div>
      )}
    </div>
  </>
);

const Footer = ({ logo }) => (
  <footer className="bg-[#1A1A1A] text-stone-400 py-20 mt-auto">
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
      <div>
        <h3 className="text-white font-serif text-xl tracking-widest mb-6">{logo}</h3>
        <p className="text-sm font-light leading-relaxed max-w-xs mx-auto md:mx-0">
          Une sélection unique de décoration méditerranéenne, fabriquée à la main avec passion et authenticité.
        </p>
      </div>
      <div>
        <h4 className="text-white text-xs uppercase tracking-widest mb-6 font-bold">Liens utiles</h4>
        <ul className="space-y-3 text-sm font-light">
          <li><a href="#" className="hover:text-white transition-colors">Nos Collections</a></li>
          <li><a href="#" className="hover:text-white transition-colors">L'Atelier</a></li>
          <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white text-xs uppercase tracking-widest mb-6 font-bold">Suivez-nous</h4>
        <div className="flex gap-6 justify-center md:justify-start">
          <Instagram className="hover:text-white cursor-pointer transition-colors" />
          <Facebook className="hover:text-white cursor-pointer transition-colors" />
        </div>
      </div>
    </div>
    <div className="border-t border-stone-800 mt-16 pt-8 text-center text-xs text-stone-600">
      &copy; 2024 {logo}. Tous droits réservés.
    </div>
  </footer>
);

// ==============================================================================
// 4. APPLICATION PRINCIPALE
// ==============================================================================

export default function App() {
  const [loading, setLoading] = useState(true);
  const [storeData, setStoreData] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  // Chargement initial
  useEffect(() => {
    fetchShopifyData().then((data) => {
      setStoreData(data || FALLBACK_DATA);
      setLoading(false);
    });
  }, []);

  // Fonction de scroll
  const scrollToProducts = () => {
    const section = document.getElementById('products-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const addToCart = (product) => {
    setCartItems([...cartItems, product]);
    setCartOpen(true);
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col justify-center items-center bg-white">
        <Loader className="animate-spin text-stone-300 mb-4" size={32} />
        <p className="text-stone-400 font-serif tracking-[0.3em] text-xs animate-pulse">CHARGEMENT...</p>
      </div>
    );
  }

  const products = storeData.products.edges || [];

  return (
    <div className="font-sans text-stone-800 bg-white min-h-screen flex flex-col selection:bg-stone-200">
      
      {/* Barre d'annonce */}
      <div className="bg-[#2C2C2C] text-white text-[10px] py-2 text-center tracking-[0.2em] uppercase font-medium">
        Livraison offerte dès 150€ d'achat
      </div>

      <Navbar 
        logo={storeData.shop?.name || "LA MAISON"} 
        cartCount={cartItems.length} 
        onOpenCart={() => setCartOpen(true)} 
      />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <HeroSection 
          title="L'Art de Vivre Solaire" 
          subtitle={storeData.shop?.description} 
          image="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2400&auto=format&fit=crop"
          onScroll={scrollToProducts}
        />

        {/* Section Produits (Cible du scroll) */}
        <div id="products-section" className="py-24 bg-stone-50/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col items-center text-center mb-16">
              <span className="text-xs text-stone-500 uppercase tracking-[0.2em] mb-3">Collection</span>
              <h2 className="text-3xl md:text-4xl font-serif text-stone-900">Nos Pièces Uniques</h2>
              <div className="w-12 h-[1px] bg-stone-300 mt-6"></div>
            </div>
            
            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                {products.map((product, idx) => (
                  <ProductCard 
                    key={product.node?.id || idx} 
                    product={product} 
                    onAdd={addToCart} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-stone-400">
                <p>Aucun produit trouvé. Vérifiez votre connexion Shopify.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer logo={storeData.shop?.name} />
      
      <CartDrawer 
        isOpen={cartOpen} 
        onClose={() => setCartOpen(false)} 
        items={cartItems} 
      />
    </div>
  );
}
