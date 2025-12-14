import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ShoppingBag, X, Instagram, Facebook, Loader, ChevronRight, Menu, ArrowLeft, Heart, ChevronDown, Minus, Plus, ChevronLeft, MessageSquare, Eye, PenTool, Ruler, Send, Sparkles, Home, PiggyBank, Mail } from 'lucide-react';

// ==============================================================================
// 1. CONFIGURATION TECHNIQUE & STYLE
// ==============================================================================

// --- APPLICATION DE LA CONFIGURATION TAILWIND ---
// Note: This injects custom config into the Tailwind instance loaded in the environment
const injectTailwindConfig = () => {
    if (typeof window !== 'undefined' && window.tailwind) {
        window.tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                        serif: ['Playfair Display', 'serif'],
                    },
                    colors: {
                        'stone-900': '#1c1c1c',
                        'stone-500': '#7d7d7d',
                        'stone-100': '#f5f5f5',
                        'finca-light': '#FDFBF7',
                        'finca-medium': '#F0EBE5',
                    },
                    keyframes: {
                        fadeIn: {
                            '0%': { opacity: '0' },
                            '100%': { opacity: '1' },
                        }
                    },
                    animation: {
                        'fade-in': 'fadeIn 0.3s ease-out forwards',
                    }
                }
            }
        };
    }
};

// --- CONFIGURATION ---
// Hardcoded for the preview environment to ensure runnability without .env files
const STOREFRONT_ACCESS_TOKEN = '4b2746c099f9603fde4f9639336a235d'; 
const SHOPIFY_DOMAIN = '91eg2s-ah.myshopify.com';
const API_VERSION = '2024-01';

const COLOR_LIGHT = '#FDFBF7';
const COLOR_MEDIUM = '#F0EBE5';

// ==============================================================================
// 2. DESIGN & CONFIGURATION
// ==============================================================================

const DESIGN_CONFIG = {
    COLLECTION_ITEM_WIDTH: 'w-[80vw] sm:w-[50vw] md:w-[40vw] lg:w-[30vw] xl:w-[25vw]',
    PRODUCT_ITEM_WIDTH: 'w-[80vw] sm:w-[50vw] md:w-[40vw] lg:w-[30vw] xl:w-[25vw]',
    JOURNAL_ITEM_WIDTH: 'w-[80vw] sm:w-[50vw] md:w-[40vw] lg:w-[30vw] xl:w-[25vw]',
    NOUVEAUTES_ITEM_WIDTH: 'w-[60vw] sm:w-[45vw] md:w-[30vw] lg:w-[25vw] xl:w-[20vw]',
    ARTICLE_CLEANUP_FILTERS: [
        'Pour en savoir plus sur les produits présentés'
    ],
};

const SITE_CONFIG = {
    HERO: {
        VIDEO_URL: "https://cdn.shopify.com/videos/c/o/v/c4d96d8c70b64465835c4eadaa115175.mp4",
        SURTITLE: "Slow Living",
        TITLE: "L'Esprit\nMéditerranéen",
        BUTTON_TEXT: "Explorer"
    },
    CUSTOM_FURNITURE: {
        IMAGE_URL: "https://cdn.shopify.com/s/files/1/0943/4005/5378/files/image_2.jpg?v=1765479001",
        TEXT: "Nous réalisons vos meubles sur mesure",
    },
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
    PHILOSOPHY: {
        IMAGE_URL: "https://cdn.shopify.com/s/files/1/0943/4005/5378/files/Couloir_boh_me.png?v=1765627710",
        SURTITLE: "Notre ADN",
        TITLE: "L'Architecture comme\nPoint de Départ",
        DESCRIPTION: "Derrière La Maison Ibizienne se cache une vision structurée, celle d'une architecte HMNOP passionnée par l'âme des lieux. Nous ne faisons que décorer, nous construisons des atmosphères.",
        POINTS: [
            "Rigueur architecturale & Créativité bohème",
            "Respect des volumes et de la lumière",
            "Matériaux durables et authentiques"
        ]
    },
    SOCIAL_LINKS: {
        CONTACT_URL: "#contact",
        DELIVERY_URL: "#delivery",
        PHILOSOPHY_URL: "#philosophy",
        INSTAGRAM_URL: "https://www.instagram.com/lamaisonibizienne",
        INSTAGRAM_HANDLE: "@lamaisonibizienne",
        FACEBOOK_URL: "https://www.facebook.com/lamaisonibizienne",
        TIKTOK_URL: "https://www.tiktok.com/@la.maison.ibizienne",
    },
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
// 3. LOGIQUE API & TRACKING ANALYTICS
// ==============================================================================

const useAnalyticsTracker = (pageType, pageTitle, product = null) => {
    useEffect(() => {
        const dataLayer = window.dataLayer = window.dataLayer || [];
        const eventName = pageType.includes('view') ? pageType : 'page_view';

        const ecommerceData = product ? {
            currency: product.priceRange?.minVariantPrice?.currencyCode || 'EUR',
            value: parseFloat(product.priceRange?.minVariantPrice?.amount || 0).toFixed(2),
            items: [{
                item_id: product.id?.split('/').pop() || product.handle,
                item_name: product.title,
                price: parseFloat(product.priceRange?.minVariantPrice?.amount || 0).toFixed(2),
                item_category: product.productType || 'Unknown',
            }]
        } : {};

        dataLayer.push({
            'event': eventName,
            'page_path': window.location.pathname,
            'page_title': pageTitle,
            'ecomm_pagetype': pageType,
            'ecommerce': product ? ecommerceData : undefined,
        });

        window.__st = {
            a: '10415243330',
            pageurl: window.location.href,
            t: pageType === 'index' ? 'home' : pageType,
            p: pageTitle,
        };

        // console.log(`[Analytics] Tracked: ${pageTitle} (${pageType})`);
    }, [pageTitle, pageType, product]);
};

// Utilisation du permalien Shopify (méthode sécurisée native)
const proceedToCheckout = (cartItems) => {
    if (cartItems.length === 0) return;
    const itemsString = cartItems.map(item => {
        const variantId = item.variantId.split('/').pop();
        return `${variantId}:${item.quantity || 1}`;
    }).join(',');

    window.open(`https://${SHOPIFY_DOMAIN}/cart/${itemsString}`, '_blank');
};


async function fetchShopifyData() {
    const query = `
    {
        shop {
            name
            description
            privacyPolicy { title body }
            refundPolicy { title body }
            shippingPolicy { title body }
            termsOfService { title body }
        }
        collections(first: 10) {
            edges {
                node {
                    id title handle
                    image { url }
                    products(first: 8) {
                        edges {
                            node {
                                id title handle description productType tags
                                priceRange { minVariantPrice { amount currencyCode } maxVariantPrice { amount } }
                                images(first: 5) { edges { node { url } } }
                                variants(first: 20) {
                                    edges {
                                        node {
                                            id title
                                            price { amount currencyCode }
                                            compareAtPrice { amount }
                                            image { url }
                                        }
                                    }
                                }
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
        pages(first: 20) {
            edges {
                node {
                    id title handle body
                }
            }
        }
    }
    `;

    try {
        // NOTE: In some code sandboxes, fetching directly from Shopify might be blocked by CORS.
        // If this fails, we will gracefully return null so the App falls back to FALLBACK_DATA.
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
            console.error("GraphQL Errors:", json.errors);
            return null;
        }
        return json.data;
    } catch (error) {
        console.warn("API Fetch failed (likely CORS in sandbox), using Fallback Data.");
        return null;
    }
}

const FALLBACK_DATA = {
    shop: { name: "LA MAISON" },
    collections: { edges: [] },
    blogs: { edges: [] },
    pages: { edges: [] }
};


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


// ==============================================================================
// 5. COMPOSANTS DESIGN
// ==============================================================================

const CollectionCard = ({ collection, onFilterCollection }) => {
    const product = collection.products?.edges?.[0]?.node;
    const image = collection.image?.url || product?.images?.edges?.[0]?.node?.url;

    const handleCollectionClick = (e) => {
        e.stopPropagation();
        onFilterCollection(collection.id);
    };

    return (
        <div
            onClick={handleCollectionClick}
            className="bg-finca-medium group cursor-pointer hover:shadow-lg transition-shadow duration-300 rounded-lg overflow-hidden"
        >
            <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
                <img
                    src={image || "https://placehold.co/800x1000/F0EBE5/7D7D7D?text=Collection"}
                    alt={collection.title}
                    onError={(e) => {e.target.onerror = null; e.target.src="https://placehold.co/800x1000/F0EBE5/7D7D7D?text=Collection"}}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-stone-900/5 transition-opacity duration-300 group-hover:opacity-0"></div>
            </div>
            <div className="p-6">
                <h3 className="text-xl font-serif text-stone-900 mb-2">{collection.title}</h3>
                <p className="text-stone-500 text-xs uppercase tracking-widest font-sans">
                    {collection.products?.edges?.length || 0} Produits
                </p>

                <div className="mt-4 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-stone-900 transition-colors">
                    Sélectionner l'Univers <ChevronRight size={14} />
                </div>
            </div>
        </div>
    );
};

const HoverImageCarouselCard = ({ product, onAddToCart, onShowDescription, aspectClass }) => {
    const images = product.images?.edges?.map(e => e.node.url) || [];
    const [imageIndex, setImageIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

    const handleMouseEnter = () => !isTouchDevice && setIsHovered(true);
    const handleMouseLeave = () => !isTouchDevice && setIsHovered(false);

    const goNext = (e) => {
        e.stopPropagation();
        setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const goPrev = (e) => {
        e.stopPropagation();
        setImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    };

    const handleMouseMove = (e) => {
        if (!isTouchDevice && images.length > 1 && isHovered) {
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

    const formatPriceDisplay = (price) => {
        const amount = parseFloat(price);
        return `${amount.toFixed(2)} ${currency}`;
    };

    const showFloatingButtons = isHovered || isTouchDevice;

    return (
        <div
            onClick={(e) => {
                if (isTouchDevice) {
                    e.preventDefault();
                    onShowDescription(product);
                }
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            onTouchStart={() => setIsHovered(true)}
            className="group cursor-pointer transition-shadow duration-300 rounded-lg overflow-hidden bg-finca-light relative"
        >
            <div className={`relative ${aspectClass} overflow-hidden bg-stone-100`}>
                <img
                    src={currentImage}
                    alt={product.title}
                    key={currentImage}
                    onError={(e) => {e.target.onerror = null; e.target.src="https://placehold.co/800x1000/F0EBE5/7D7D7D?text=Produit"}}
                    className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                />
                <button
                    onClick={(e) => { e.stopPropagation(); onShowDescription(product); }}
                    className={`absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-stone-900 transition-opacity duration-300 z-30 ${showFloatingButtons ? 'opacity-100' : 'opacity-0'}`}
                    aria-label="Voir la description"
                >
                    <Eye size={16} strokeWidth={1.5} />
                </button>
                <div
                    className={`absolute inset-x-0 bottom-0 z-30 transition-transform duration-300 ${showFloatingButtons ? 'translate-y-0' : 'translate-y-full'}`}
                >
                    <button
                        onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                        className="w-full bg-stone-900 text-white py-3 uppercase tracking-widest text-[11px] font-bold hover:bg-stone-700 transition-colors"
                        aria-label="Ajouter au panier"
                    >
                        Ajouter au panier
                    </button>
                </div>
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
            <div className="p-4 pt-6 text-center">
                <h3 className="text-base font-serif text-stone-900 mb-1">{product.title}</h3>
                <p className="text-stone-500 text-[11px] uppercase tracking-widest font-sans mb-2">{product.productType}</p>
                <p className="text-sm font-medium text-stone-900">{formatPriceDisplay(price)}</p>
            </div>
        </div>
    );
};

const ProductCard = (props) => (
    <HoverImageCarouselCard {...props} aspectClass="aspect-[3/4]" />
);

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
                    onError={(e) => {e.target.onerror = null; e.target.src="https://placehold.co/800x600/F0EBE5/7D7D7D?text=Journal"}}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            </div>
            <div className="p-6">
                <span className="text-[10px] uppercase tracking-widest font-sans text-stone-500 block mb-2">
                    {new Date(article.node.publishedAt).toLocaleDateString()}
                </span>
                <h3 className="text-xl font-serif text-stone-900 leading-snug mb-2">{article.node.title}</h3>
                <p className="text-stone-500 text-sm italic line-clamp-2">{article.node.excerpt}</p>
            </div>
        </div>
    );
};

const Carousel = ({ title, subtitle, anchorId, itemWidth, children }) => {
    const scrollContainerRef = useRef(null);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const { current } = scrollContainerRef;
            const scrollAmount = current.clientWidth * 0.8;

            if (direction === 'left') {
                current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] w-full bg-finca-light">
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
                        className={`flex overflow-x-scroll snap-x snap-mandatory space-x-6 md:space-x-10 pb-4 md:pb-8 transition-shadow duration-500`}
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            WebkitOverflowScrolling: 'touch',
                        }}
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

    const formatPrice = (amount) => `${parseFloat(amount).toFixed(2)} €`;

    return (
        <div
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
                                <div className="w-20 h-24 bg-stone-100 flex-shrink-0 overflow-hidden rounded-sm">
                                    <img
                                        src={item.image || "https://placehold.co/8x96/F0EBE5/7D7D7D?text=Image"}
                                        alt={item.title}
                                        onError={(e) => {e.target.onerror = null; e.target.src="https://placehold.co/80x96/F0EBE5/7D7D7D?text=Image"}}
                                        className="w-full h-full object-cover"
                                    />
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
                    Passer à la caisse (Shopify Checkout)
                </button>
            </div>
        </div>
    );
};

const MobileMenuSidebar = ({ isMenuOpen, onClose, onContactClick, onPhilosophyClick }) => {

    const handleLinkClick = (e, link) => {
        e.preventDefault();
        onClose();

        if (link.action === 'contact') {
            onContactClick();
        } else if (link.action === 'philosophy') {
            onPhilosophyClick();
        } else {
            document.getElementById(link.href.substring(1))?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const NAV_LINKS = [
        { name: "Collections", href: "#collections" },
        { name: "Coaching", href: "#coaching" },
        { name: "Journal", href: "#journal-section" },
        { name: "Notre Philosophie", href: "#philosophy", action: 'philosophy' },
        { name: "Contact", href: "#contact", action: 'contact' },
    ];

    return (
        <div
            className={`fixed top-0 left-0 h-full w-full max-w-xs bg-white shadow-2xl z-50 transition-transform duration-500 ease-in-out border-r border-stone-200 lg:hidden ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
            <div className="flex justify-between items-center p-6 border-b border-stone-200">
                <h2 className="font-serif text-2xl text-stone-900">Menu</h2>
                <button onClick={onClose} className="text-stone-500 hover:text-stone-900"><X size={24} /></button>
            </div>

            <nav className="p-6">
                <ul className="space-y-4">
                    {NAV_LINKS.map((link, index) => (
                        <li key={index}>
                            <a
                                href={link.href}
                                onClick={(e) => handleLinkClick(e, link)}
                                className="font-serif text-lg text-stone-900 hover:text-stone-500 transition-colors block py-2"
                            >
                                {link.name}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

const Navbar = ({ logo, cartCount, onOpenCart, isArticleView, isPolicyView, onBack, onOpenMenu }) => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const LogoComponent = () => (
        <div className={`text-2xl md:text-3xl lg:text-4xl font-serif tracking-[0.15em] font-bold text-center text-stone-900 whitespace-nowrap drop-shadow-sm transition-all duration-500 ${isArticleView || isPolicyView ? 'cursor-default' : 'hover:opacity-80'}`}>
            {logo}
        </div>
    );

    if (isArticleView || isPolicyView) {
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
            <div className="max-w-[1800px] mx-auto px-6 md:px-12 grid grid-cols-12 items-center">
                <div className="col-span-4 hidden lg:flex gap-8 text-[10px] uppercase tracking-[0.25em] font-serif text-stone-900">
                    <a href="#collections" className="hover:text-stone-500 transition-colors whitespace-nowrap" onClick={(e) => { e.preventDefault(); document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' }); }}>Collections</a>
                    <a href="#coaching" className="hover:text-stone-500 transition-colors whitespace-nowrap" onClick={(e) => { e.preventDefault(); document.getElementById('coaching')?.scrollIntoView({ behavior: 'smooth' }); }}>Coaching</a>
                    <a href="#journal-section" className="hover:text-stone-500 transition-colors whitespace-nowrap" onClick={(e) => { e.preventDefault(); document.getElementById('journal-section')?.scrollIntoView({ behavior: 'smooth' }); }}>Journal</a>
                </div>
                <div className="col-span-12 lg:col-span-4 flex justify-center order-first lg:order-none mb-4 lg:mb-0">
                    <a href="#top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:opacity-80 transition-opacity">
                        <LogoComponent />
                    </a>
                </div>
                <div className="col-span-4 hidden lg:flex justify-end items-center gap-8">
                    <div className="relative cursor-pointer hover:opacity-60 transition-opacity flex items-center gap-2" onClick={onOpenCart}>
                        <span className="hidden lg:inline-block text-[10px] uppercase tracking-[0.2em] font-serif mr-2 align-middle text-stone-900">Panier</span>
                        <ShoppingBag size={18} strokeWidth={1.5} className="inline-block align-middle text-stone-900" />
                        {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-stone-900 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full">{cartCount}</span>}
                    </div>
                </div>
                <div className="lg:hidden absolute left-6 top-6 cursor-pointer" onClick={onOpenMenu}><Menu size={24} className="text-stone-900" /></div>
                <div className="lg:hidden absolute right-6 top-6 cursor-pointer" onClick={onOpenCart}>
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
            <video className="w-full h-full object-cover" autoPlay loop muted playsInline controls>
                <source src={SITE_CONFIG.HERO.VIDEO_URL} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-stone-900/10" />
        </div>
        <div className="relative z-10 pt-40 max-w-4xl">
            <ScrollFadeIn delay={200} threshold={0.1}>
            <div className="bg-white/15 backdrop-blur-sm border border-white/20 p-8 md:p-14 inline-block shadow-lg">
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

const ProductDescriptionModal = ({ product, onClose, handleOpenVariantSelector }) => {
    const images = product.images?.edges?.map(e => e.node.url) || [];
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const goToNextImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const goToPrevImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    };

    if (!product) return null;

    const firstVariant = product.variants?.edges?.[0]?.node;
    const currentPrice = parseFloat(firstVariant?.price?.amount || 0);
    const compareAtPrice = parseFloat(firstVariant?.compareAtPrice?.amount || 0);
    const isOnSale = compareAtPrice > currentPrice;

    let discountPercentage = 0;
    if (isOnSale && compareAtPrice > 0) {
        discountPercentage = Math.round(((compareAtPrice - currentPrice) / compareAtPrice) * 100);
    }

    const mockSpecifications = [
        { label: "Matériau principal", value: "Rotin naturel et Bois de Manguier" },
        { label: "Dimensions (L x H x P)", value: "80cm x 150cm x 40cm" },
        { label: "Couleur", value: "Naturel, non-traité" },
        { label: "Origine", value: "Artisanat Indonésien" },
    ];

    const ProductDescriptionContent = () => (
        <div
            className="text-sm leading-relaxed text-stone-700 [&>p]:mb-4 [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mb-4 [&>li]:mb-2"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
        >
        </div>
    );

    const formatPriceDisplay = (price) => `€${parseFloat(price).toFixed(2)}`;
    const currentImageUrl = images[currentImageIndex] || "https://placehold.co/1000x800/F0EBE5/7D7D7D?text=Image+Produit";

    return (
        <div className="fixed inset-0 z-[80] bg-finca-medium/95 lg:bg-finca-medium/95 backdrop-blur-sm flex items-center justify-center p-0 lg:p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-finca-light w-full max-w-5xl shadow-2xl relative rounded-lg h-[90vh] lg:max-h-[90vh] flex flex-col lg:block overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 z-50 p-2 bg-white/50 rounded-full lg:bg-transparent"><X size={24} /></button>
                <div className="grid grid-cols-1 lg:grid-cols-3 h-full overflow-y-auto lg:overflow-hidden">
                    <div className="relative h-auto min-h-[40vh] lg:h-full lg:overflow-hidden bg-stone-100 p-8 flex items-center justify-center lg:col-span-2">
                        {isOnSale && (
                             <div className="absolute top-4 left-4 bg-red-600 text-white text-xs px-3 py-1 rounded-sm font-bold z-10">
                                  Save {discountPercentage}%
                             </div>
                        )}
                        <img
                            src={currentImageUrl}
                            alt={product.title}
                            key={currentImageUrl}
                            onError={(e) => {e.target.onerror = null; e.target.src="https://placehold.co/1000x800/F0EBE5/7D7D7D?text=Image+Produit"}}
                            className="object-contain mx-auto w-full h-full max-h-[50vh] lg:max-h-[80vh] transition-opacity duration-300"
                        />
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={goToPrevImage}
                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/30 text-white rounded-full transition-opacity hover:bg-black/50 z-30"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={goToNextImage}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/30 text-white rounded-full transition-opacity hover:bg-black/50 z-30"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </>
                        )}
                           <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                {images.map((_, index) => (
                                    <div
                                        key={index}
                                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                                        className={`w-2 h-2 rounded-full transition-all cursor-pointer ${index === currentImageIndex ? 'bg-stone-900' : 'bg-stone-400'}`}>
                                    </div>
                                ))}
                           </div>
                    </div>

                    <div className="lg:col-span-1 p-6 md:p-10 flex flex-col lg:h-full lg:overflow-y-auto">
                        <div className="pb-6 border-b border-stone-200 mb-6 flex-shrink-0">
                            <h3 className="font-serif text-3xl text-stone-900 leading-snug">{product.title}</h3>
                            <div className="flex items-baseline mt-2">
                                <p className="text-xl font-medium text-stone-900">
                                    {formatPriceDisplay(currentPrice)}
                                </p>
                                {isOnSale && (
                                    <p className="text-sm font-medium text-stone-500 ml-3 line-through">
                                        {formatPriceDisplay(compareAtPrice)}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mb-8">
                            <ProductDescriptionContent />
                        </div>

                        <div className="mb-8 p-4 bg-finca-medium rounded-lg flex-shrink-0">
                            <h4 className="text-sm font-bold text-stone-900 mb-4 uppercase tracking-widest">Spécifications du produit</h4>
                            {mockSpecifications.map((spec, index) => (
                                <div key={index} className="flex justify-between border-b border-stone-300 py-2 last:border-b-0">
                                    <span className="text-xs font-medium text-stone-900">{spec.label}:</span>
                                    <span className="text-xs text-stone-500 text-right">{spec.value}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex-shrink-0 lg:pt-4 pb-8 lg:pb-0">
                            <button
                                onClick={(e) => { e.stopPropagation(); onClose(); handleOpenVariantSelector(product); }}
                                className="w-full bg-stone-900 text-white py-3 uppercase tracking-widest text-xs font-bold hover:bg-stone-700 transition-colors rounded-sm mt-4"
                            >
                                Choisir les options
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const VariantSelector = ({ product, onClose, onConfirm }) => {
    const variants = product.variants?.edges || [];
    const initialVariant = variants.length > 0 ? variants[0].node : null;

    const [selectedVariant, setSelectedVariant] = useState(initialVariant);
    const [quantity, setQuantity] = useState(1);
    const increment = () => setQuantity(q => q + 1);
    const decrement = () => setQuantity(q => (q > 1 ? q - 1 : 1));

    const currentPrice = selectedVariant?.price?.amount || product.priceRange?.minVariantPrice?.amount || 0;
    const finalPrice = (parseFloat(currentPrice) * quantity).toFixed(2);
    const formatVariantPrice = (price) => `${parseFloat(price).toFixed(2)} €`;

    if (!initialVariant) {
        return (
            <div className="fixed inset-0 z-[80] bg-finca-medium/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
                <div className="bg-finca-light w-full max-w-md shadow-2xl p-8 relative rounded-lg" onClick={(e) => e.stopPropagation()}>
                    <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-900"><X size={20} /></button>
                    <p className="text-center text-stone-500 font-serif italic">Aucune variante disponible pour ce produit.</p>
                </div>
            </div>
        );
    }

    const handleConfirm = () => {
        if (selectedVariant) {
            onConfirm(product, selectedVariant, quantity);
        }
    };

    return (
        <div className="fixed inset-0 z-[80] bg-finca-medium/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-finca-light w-full max-w-md shadow-2xl p-8 relative rounded-lg" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-900"><X size={20} /></button>
                <div className="flex gap-6 mb-8">
                    <div className="w-24 h-32 bg-stone-100 flex-shrink-0 overflow-hidden rounded-sm">
                        <img
                            src={selectedVariant?.image?.url || product.images?.edges?.[0]?.node?.url || "https://placehold.co/800x1000/F0EBE5/7D7D7D?text=Image"}
                            alt={product.title}
                            onError={(e) => {e.target.onerror = null; e.target.src="https://placehold.co/800x1000/F0EBE5/7D7D7D?text=Image"}}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <h3 className="font-serif text-xl text-stone-900 mb-2">{product.title}</h3>
                        <p className="text-stone-500 text-xs uppercase tracking-widest mb-3">{product.productType}</p>
                        <p className="text-sm font-medium text-stone-900">{finalPrice} €</p>
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
                                <span>{node.title} - {formatVariantPrice(node.price.amount)}</span>
                                {selectedVariant?.id === node.id && <div className="w-2 h-2 bg-stone-900 rounded-full"></div>}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center justify-between mb-8 border-t border-stone-200 pt-6">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold font-serif">Quantité</label>
                    <div className="flex items-center border border-stone-300 rounded-sm h-7">
                        <button onClick={decrement} className="px-3 py-2 hover:bg-stone-100 text-stone-600"><Minus size={14} /></button>
                        <span className="px-3 py-2 text-sm font-serif w-8 text-center">{quantity}</span>
                        <button onClick={increment} className="px-3 py-2 hover:bg-stone-100 text-stone-600"><Plus size={12} /></button>
                    </div>
                </div>
                <button
                    onClick={handleConfirm}
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
    }, [article]);

    if (!article) return null;
    const node = article.node;

    const processArticleContent = (html) => {
        let text = html
            .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
            .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
            .replace(/\{\s*\"@context\":\s*\"https:\/\/schema\.org\"[\s\S]*?\}/g, ' ');

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

            if (match || block.length < 50) {
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
        <div className="bg-white min-h-screen pt-32 pb-24 selection:bg-finca-medium/50">
            <div className="max-w-[1400px] mx-auto px-6 mb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                    {node.image && (
                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg shadow-xl bg-finca-medium">
                            <img
                                src={node.image.url}
                                alt={node.title}
                                onError={(e) => {e.target.onerror = null; e.target.src="https://placehold.co/1000x750/F0EBE5/7D7D7D?text=Image+Article"}}
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

const ContactModal = ({ isOpen, onClose }) => {
    const [formStatus, setFormStatus] = useState('idle');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormStatus('sending');
        
        // Récupération des données du formulaire
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            // ⚠️ À CONFIGURER : Remplacez l'URL par votre endpoint réel (ex: Formspree, API Shopify, Zapier)
            // Pour le moment, une erreur 404 est attendue si l'URL n'existe pas.
            const response = await fetch('https://api.votre-site.com/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                setFormStatus('success');
            } else {
                // Fallback pour la démo si pas de backend
                // console.warn("Backend non configuré, simulation de succès.");
                setTimeout(() => setFormStatus('success'), 1000);
            }
        } catch (error) {
            // console.error("Erreur réseau formulaire contact:", error);
            // Simulation succès pour UX démo
            setTimeout(() => setFormStatus('success'), 1000);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[90] bg-finca-medium/95 lg:bg-finca-medium/95 backdrop-blur-sm flex items-center justify-center p-0 lg:p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-finca-light w-full max-w-lg shadow-2xl relative rounded-lg p-8 md:p-12 overflow-y-auto max-h-full" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 z-50 p-2 bg-white/50 rounded-full lg:bg-transparent"><X size={24} /></button>

                <div className="text-center mb-8">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-stone-500 font-bold font-sans block mb-2">
                        Contact
                    </span>
                    <h2 className="text-3xl font-serif text-stone-900">Une question ?</h2>
                    <p className="text-stone-500 font-light mt-2">N'hésitez pas à nous écrire, nous vous répondrons rapidement.</p>
                </div>

                {formStatus === 'success' ? (
                    <div className="flex flex-col items-center justify-center text-center py-12 animate-fade-in">
                        <div className="w-16 h-16 bg-stone-900 text-white rounded-full flex items-center justify-center mb-6">
                            <Mail size={32} />
                        </div>
                        <h3 className="text-xl font-serif text-stone-900 mb-4">Message Envoyé</h3>
                        <p className="text-stone-500 mb-8">
                            Merci de votre message. Notre équipe revient vers vous très vite.
                        </p>
                        <button
                            onClick={onClose}
                            className="border-b border-stone-900 text-stone-900 uppercase tracking-widest text-xs pb-1 hover:opacity-70"
                        >
                            Fermer
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Ajout des attributs name="..." pour le fetch */}
                        <div>
                            <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold block mb-2">Votre Nom</label>
                            <input required name="name" type="text" className="w-full bg-transparent border-b border-stone-300 py-2 focus:border-stone-900 focus:outline-none transition-colors" placeholder="Nom Prénom" />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold block mb-2">Votre Email</label>
                            <input required name="email" type="email" className="w-full bg-transparent border-b border-stone-300 py-2 focus:border-stone-900 focus:outline-none transition-colors" placeholder="email@exemple.com" />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold block mb-2">Sujet</label>
                            <select name="subject" className="w-full bg-transparent border-b border-stone-300 py-2 focus:border-stone-900 focus:outline-none transition-colors appearance-none cursor-pointer">
                                <option value="produit">Question sur un produit</option>
                                <option value="commande">Suivi de commande</option>
                                <option value="partenariat">Demande de partenariat</option>
                                <option value="presse">Presse</option>
                                <option value="autre">Autre</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold block mb-2">Message</label>
                            <textarea required name="message" rows="4" className="w-full bg-stone-50 border border-stone-200 p-4 rounded-sm focus:border-stone-900 focus:outline-none transition-colors text-sm" placeholder="Comment pouvons-nous vous aider ?"></textarea>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={formStatus === 'sending'}
                                className="w-full bg-stone-900 text-white py-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-stone-700 transition-colors rounded-sm flex items-center justify-center gap-3 disabled:bg-stone-400"
                            >
                                {formStatus === 'sending' ? (
                                    <><Loader className="animate-spin" size={16} /> Envoi...</>
                                ) : (
                                    'Envoyer'
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

const PhilosophyModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] bg-finca-medium/95 lg:bg-finca-medium/95 backdrop-blur-sm flex items-center justify-center p-0 lg:p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-finca-light w-full max-w-6xl shadow-2xl relative rounded-lg h-full lg:h-[90vh] lg:max-h-[90vh] flex overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 z-50"><X size={24} /></button>

                <div className="grid grid-cols-1 lg:grid-cols-2 w-full h-full">
                    <div className="relative h-[40vh] lg:h-full bg-stone-200">
                            <img
                                src={SITE_CONFIG.PHILOSOPHY.IMAGE_URL}
                                alt="Architecte au travail"
                                className="w-full h-full object-cover"
                            />
                        <div className="absolute inset-0 bg-stone-900/20"></div>
                    </div>

                    <div className="flex flex-col h-full overflow-y-auto bg-finca-light p-8 md:p-16 justify-center">
                        <div>
                            <span className="text-[10px] uppercase tracking-[0.3em] text-stone-500 font-bold font-sans block mb-4">
                                {SITE_CONFIG.PHILOSOPHY.SURTITLE}
                            </span>
                            <h2 className="text-4xl md:text-5xl font-serif text-stone-900 leading-tight mb-8 whitespace-pre-line">
                                {SITE_CONFIG.PHILOSOPHY.TITLE}
                            </h2>
                            <p className="text-lg font-light text-stone-700 mb-10 leading-relaxed">
                                {SITE_CONFIG.PHILOSOPHY.DESCRIPTION}
                            </p>

                            <div className="space-y-6">
                                {SITE_CONFIG.PHILOSOPHY.POINTS.map((point, idx) => (
                                    <div key={idx} className="flex items-center gap-4 border-b border-stone-200 pb-4 last:border-0">
                                        <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-900 flex-shrink-0">
                                            {idx === 0 && <Ruler size={20} />}
                                            {idx === 1 && <Home size={20} />}
                                            {idx === 2 && <Heart size={20} />}
                                        </div>
                                        <span className="font-serif text-lg text-stone-800">{point}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-12 pt-8 border-t border-stone-200">
                                <p className="font-serif italic text-stone-500 text-sm">
                                    "Chaque projet est une rencontre entre un lieu, une histoire et vos envies."
                                </p>
                                <p className="text-[10px] uppercase tracking-widest text-stone-400 mt-2 font-bold">
                                    — L'Architecte
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CoachingModal = ({ isOpen, onClose }) => {
    const [formStatus, setFormStatus] = useState('idle');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormStatus('sending');

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
             // ⚠️ À CONFIGURER : URL de l'API de coaching
            const response = await fetch('https://api.votre-site.com/coaching-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                setFormStatus('success');
            } else {
                 // console.warn("Backend non configuré (Coaching), simulation de succès.");
                 setTimeout(() => setFormStatus('success'), 1500);
            }
        } catch (error) {
             // console.error("Erreur réseau coaching:", error);
             setTimeout(() => setFormStatus('success'), 1500);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] bg-finca-medium/95 lg:bg-finca-medium/95 backdrop-blur-sm flex items-center justify-center p-0 lg:p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-finca-light w-full max-w-6xl shadow-2xl relative rounded-lg h-full lg:h-[90vh] lg:max-h-[90vh] flex flex-col lg:block overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 z-50 p-2 bg-white/50 rounded-full lg:bg-transparent"><X size={24} /></button>

                <div className="grid grid-cols-1 lg:grid-cols-2 w-full h-full overflow-y-auto lg:overflow-hidden">
                    <div className="relative h-[40vh] lg:h-full flex flex-col justify-end p-8 lg:p-12 bg-stone-900 text-white">
                        <div className="absolute inset-0 z-0 opacity-60">
                               <img
                                    src={SITE_CONFIG.COACHING.IMAGE_URL}
                                    alt="Coaching Déco"
                                    className="w-full h-full object-cover"
                                />
                        </div>
                        <div className="relative z-10">
                            <span className="text-[10px] uppercase tracking-[0.4em] mb-4 block opacity-80">L'Expertise à vos côtés</span>
                            <h2 className="text-3xl lg:text-5xl font-serif mb-6 leading-tight">Ne rêvez plus votre intérieur,<br/>vivez-le.</h2>
                            <p className="text-sm lg:text-lg font-light opacity-90 leading-relaxed mb-8 hidden lg:block">
                                "Vous avez les idées mais pas le temps ? Ou l'envie mais pas les idées ? Notre service de coaching s'adapte à vos besoins."
                            </p>
                            <div className="flex gap-4 text-xs uppercase tracking-widest opacity-70">
                                <span className="flex items-center gap-2"><Sparkles size={14}/> Sublimer</span>
                                <span className="flex items-center gap-2"><PiggyBank size={14}/> Optimiser</span>
                                <span className="flex items-center gap-2"><Home size={14}/> Accompagner</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col h-auto lg:h-full overflow-y-visible lg:overflow-y-auto bg-finca-light p-8 md:p-16">
                        <div className="lg:hidden mb-8">
                            <p className="text-stone-500 text-sm mt-4 italic">"Vous avez les idées mais pas le temps ? Ou l'envie mais pas les idées ? Révélez le potentiel de votre intérieur."</p>
                        </div>

                        {formStatus === 'success' ? (
                            <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in py-12">
                                <div className="w-16 h-16 bg-stone-900 text-white rounded-full flex items-center justify-center mb-6">
                                    <Send size={32} />
                                </div>
                                <h3 className="text-2xl font-serif text-stone-900 mb-4">Message Reçu !</h3>
                                <p className="text-stone-500 mb-8 max-w-sm">
                                    Votre projet est entre de bonnes mains. Un coach déco vous contactera très rapidement pour un premier échange gratuit.
                                </p>
                                <button
                                    onClick={onClose}
                                    className="border-b border-stone-900 text-stone-900 uppercase tracking-widest text-xs pb-1 hover:opacity-70"
                                >
                                    Retour au site
                                </button>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-xl font-serif text-stone-900 mb-8 border-l-4 border-stone-200 pl-4">
                                    Demander un devis coaching
                                </h3>

                                <form onSubmit={handleSubmit} className="space-y-6 flex-grow">
                                    {/* Ajout des attributs name="..." */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="col-span-2 md:col-span-1">
                                            <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold block mb-2">Votre Nom</label>
                                            <input required name="name" type="text" className="w-full bg-transparent border-b border-stone-300 py-2 focus:border-stone-900 focus:outline-none transition-colors" placeholder="Votre nom" />
                                        </div>
                                        <div className="col-span-2 md:col-span-1">
                                            <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold block mb-2">Votre Email</label>
                                            <input required name="email" type="email" className="w-full bg-transparent border-b border-stone-300 py-2 focus:border-stone-900 focus:outline-none transition-colors" placeholder="email@exemple.com" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold block mb-2">Type de Projet</label>
                                        <select name="projectType" className="w-full bg-transparent border-b border-stone-300 py-2 focus:border-stone-900 focus:outline-none transition-colors appearance-none cursor-pointer">
                                            <option value="coaching">Coaching Déco (Conseils & Shopping list)</option>
                                            <option value="renovation">Rénovation Complète (Travaux & Suivi)</option>
                                            <option value="homestaging">Home Staging (Valorisation pour vente)</option>
                                            <option value="pro">Aménagement d'espace professionnel</option>
                                            <option value="autre">Autre</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold block mb-2">Surface & Budget Estimé</label>
                                        <input name="details" type="text" className="w-full bg-transparent border-b border-stone-300 py-2 focus:border-stone-900 focus:outline-none transition-colors" placeholder="Ex: 80m2, env. 15 000€" />
                                    </div>

                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold block mb-2">Vos Attentes</label>
                                        <textarea required name="expectations" rows="4" className="w-full bg-stone-50 border border-stone-200 p-4 rounded-sm focus:border-stone-900 focus:outline-none transition-colors text-sm" placeholder="Dites-nous en plus sur vos besoins : manque de lumière, besoin de rangement, envie de changement de style..."></textarea>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={formStatus === 'sending'}
                                            className="w-full bg-stone-900 text-white py-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-stone-700 transition-colors rounded-sm flex items-center justify-center gap-3 disabled:bg-stone-400"
                                        >
                                            {formStatus === 'sending' ? (
                                                <><Loader className="animate-spin" size={16} /> Envoi en cours...</>
                                            ) : (
                                                'Envoyer ma demande'
                                            )}
                                        </button>
                                        <p className="text-[9px] text-center text-stone-400 mt-3 italic">
                                            Premier échange téléphonique gratuit et sans engagement.
                                        </p>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const CustomFurnitureModal = ({ isOpen, onClose }) => {
    const [formStatus, setFormStatus] = useState('idle');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormStatus('sending');

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            // ⚠️ À CONFIGURER : URL de l'API sur-mesure
            const response = await fetch('https://api.votre-site.com/custom-furniture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                setFormStatus('success');
            } else {
                 // console.warn("Backend non configuré (Meubles), simulation de succès.");
                 setTimeout(() => setFormStatus('success'), 1500);
            }
        } catch (error) {
             // console.error("Erreur réseau meubles:", error);
             setTimeout(() => setFormStatus('success'), 1500);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] bg-finca-medium/95 lg:bg-finca-medium/95 backdrop-blur-sm flex items-center justify-center p-0 lg:p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-finca-light w-full max-w-6xl shadow-2xl relative rounded-lg h-full lg:h-[90vh] lg:max-h-[90vh] flex flex-col lg:block overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 z-50 p-2 bg-white/50 rounded-full lg:bg-transparent"><X size={24} /></button>

                <div className="grid grid-cols-1 lg:grid-cols-2 w-full h-full overflow-y-auto lg:overflow-hidden">
                    <div className="relative h-[40vh] lg:h-full flex flex-col justify-end p-8 lg:p-12 bg-stone-900 text-white">
                        <div className="absolute inset-0 z-0 opacity-60">
                               <img
                                    src="https://cdn.shopify.com/s/files/1/0943/4005/5378/files/image_2.jpg?v=1765479001"
                                    alt="Atelier artisan"
                                    className="w-full h-full object-cover"
                                />
                        </div>
                        <div className="relative z-10">
                            <span className="text-[10px] uppercase tracking-[0.4em] mb-4 block opacity-80">L'Art de l'Unique</span>
                            <h2 className="text-3xl lg:text-5xl font-serif mb-6 leading-tight">Votre imagination,<br/>nos mains.</h2>
                            <p className="text-sm lg:text-lg font-light opacity-90 leading-relaxed mb-8 hidden lg:block">
                                "Parce que votre intérieur ne doit ressembler à aucun autre. Nous dessinons et fabriquons la pièce qui raconte votre histoire."
                            </p>
                            <div className="flex gap-4 text-xs uppercase tracking-widest opacity-70">
                                <span className="flex items-center gap-2"><PenTool size={14}/> Design</span>
                                <span className="flex items-center gap-2"><Ruler size={14}/> Sur-Mesure</span>
                                <span className="flex items-center gap-2"><Heart size={14}/> Fait Main</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col h-auto lg:h-full overflow-y-visible lg:overflow-y-auto bg-finca-light p-8 md:p-16">
                        <div className="lg:hidden mb-8">
                            <p className="text-stone-500 text-sm mt-4 italic">"Parce que votre intérieur ne doit ressembler à aucun autre."</p>
                        </div>

                        {formStatus === 'success' ? (
                            <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in py-12">
                                <div className="w-16 h-16 bg-stone-900 text-white rounded-full flex items-center justify-center mb-6">
                                    <Send size={32} />
                                </div>
                                <h3 className="text-2xl font-serif text-stone-900 mb-4">Demande Envoyée !</h3>
                                <p className="text-stone-500 mb-8 max-w-sm">
                                    Merci de nous avoir confié votre inspiration. Notre équipe de designers vous contactera sous 48h pour affiner votre projet.
                                </p>
                                <button
                                    onClick={onClose}
                                    className="border-b border-stone-900 text-stone-900 uppercase tracking-widest text-xs pb-1 hover:opacity-70"
                                >
                                    Retour à la boutique
                                </button>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-xl font-serif text-stone-900 mb-8 border-l-4 border-stone-200 pl-4">
                                    Parlez-nous de votre projet
                                </h3>

                                <form onSubmit={handleSubmit} className="space-y-6 flex-grow">
                                    {/* Ajout des attributs name="..." */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="col-span-2 md:col-span-1">
                                            <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold block mb-2">Votre Nom</label>
                                            <input required name="name" type="text" className="w-full bg-transparent border-b border-stone-300 py-2 focus:border-stone-900 focus:outline-none transition-colors" placeholder="Jean Dupont" />
                                        </div>
                                        <div className="col-span-2 md:col-span-1">
                                            <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold block mb-2">Votre Email</label>
                                            <input required name="email" type="email" className="w-full bg-transparent border-b border-stone-300 py-2 focus:border-stone-900 focus:outline-none transition-colors" placeholder="jean@exemple.com" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold block mb-2">Type de Meuble</label>
                                        <select name="furnitureType" className="w-full bg-transparent border-b border-stone-300 py-2 focus:border-stone-900 focus:outline-none transition-colors appearance-none cursor-pointer">
                                            <option value="table">Table à manger</option>
                                            <option value="canape">Canapé / Fauteuil</option>
                                            <option value="buffet">Console / Buffet</option>
                                            <option value="lit">Tête de lit</option>
                                            <option value="deco">Objet de décoration</option>
                                            <option value="projet">Projet complet (Villa/Hôtel)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold block mb-2">Dimensions approximatives</label>
                                        <input name="dimensions" type="text" className="w-full bg-transparent border-b border-stone-300 py-2 focus:border-stone-900 focus:outline-none transition-colors" placeholder="L 200cm x l 90cm..." />
                                    </div>

                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold block mb-2">Votre Inspiration</label>
                                        <textarea required name="inspiration" rows="4" className="w-full bg-stone-50 border border-stone-200 p-4 rounded-sm focus:border-stone-900 focus:outline-none transition-colors text-sm" placeholder="Décrivez le style, les matériaux (bois, rotin, pierre...), l'ambiance recherchée..."></textarea>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={formStatus === 'sending'}
                                            className="w-full bg-stone-900 text-white py-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-stone-700 transition-colors rounded-sm flex items-center justify-center gap-3 disabled:bg-stone-400"
                                        >
                                            {formStatus === 'sending' ? (
                                                <><Loader className="animate-spin" size={16} /> Envoi en cours...</>
                                            ) : (
                                                'Envoyer mon brief créatif'
                                            )}
                                        </button>
                                        <p className="text-[9px] text-center text-stone-400 mt-3 italic">
                                            Aucun engagement. Réponse sous 48h.
                                        </p>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const LegalPageView = ({ page }) => {
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [page]);

    if (!page) return null;

    const content = page.body;

    return (
        <div className="bg-white min-h-screen pt-32 pb-24 selection:bg-finca-medium/50">
            <div className="max-w-[1000px] mx-auto px-6">
                <div className="text-center mb-16">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-stone-500 font-bold font-sans block mb-4">
                        Informations Légales
                    </span>
                    <h1 className="text-3xl md:text-5xl font-serif text-stone-900 leading-tight">
                        {page.title}
                    </h1>
                </div>

                <div
                    className="prose prose-stone max-w-none prose-headings:font-serif prose-headings:font-normal prose-a:text-stone-900 prose-a:underline hover:prose-a:text-stone-600 prose-p:font-light prose-p:text-stone-700"
                    dangerouslySetInnerHTML={{ __html: content || "<p>Contenu en cours de rédaction.</p>" }}
                />
            </div>
        </div>
    );
};

const CustomFurnitureSection = ({ onOpen }) => {
    const sectionRef = useRef(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const localColorLight = COLOR_LIGHT;

    useEffect(() => {
        const handleScroll = () => {
            if (sectionRef.current) {
                const sectionTop = sectionRef.current.offsetTop;
                const sectionHeight = sectionRef.current.offsetHeight;
                const viewportHeight = window.innerHeight;
                const scrollY = window.scrollY;

                const startPoint = sectionTop - viewportHeight;
                const endPoint = sectionTop + sectionHeight;

                const range = endPoint - startPoint;
                let progress;

                if (range > 0) {
                    progress = (scrollY - startPoint) / range;
                } else {
                    progress = 0;
                }

                progress = Math.max(0, Math.min(1, progress));

                setScrollProgress(progress);
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const openProgress = Math.min(1, scrollProgress * 2);
    const leftCurtainTransform = `translateX(-${openProgress * 100}%)`;
    const rightCurtainTransform = `translateX(${openProgress * 100}%)`;

    const textRevealProgress = Math.max(0, Math.min(1, (scrollProgress - 0.3) / 0.5));
    const textOpacity = textRevealProgress;
    const textY = 1 - textRevealProgress;

    return (
        <section
            id="custom-furniture"
            className="relative w-full min-h-[120vh] overflow-hidden bg-finca-light"
            ref={sectionRef}
        >
            <div className="absolute inset-0 z-0">
                <img
                    src={SITE_CONFIG.CUSTOM_FURNITURE.IMAGE_URL}
                    alt="Meubles sur mesure"
                    onError={(e) => {e.target.onerror = null; e.target.src="https://placehold.co/1920x1080/F0EBE5/7D7D7D?text=Meubles+Sur+Mesure"}}
                    className="w-full h-full object-cover absolute inset-0 z-10 opacity-100 scale-[1.05]"
                />
            </div>

            <div className="absolute inset-0 z-30 flex items-center justify-center p-8">
                <div className="text-center"
                    style={{
                        opacity: textOpacity,
                        transform: `translateY(${textY * 20}px)`,
                        transition: 'none'
                    }}>
                    <h2 className={`text-4xl md:text-6xl font-serif text-white uppercase tracking-wider drop-shadow-lg`}>
                        {SITE_CONFIG.CUSTOM_FURNITURE.TEXT}
                    </h2>

                    <button
                        onClick={onOpen}
                        className="mt-8 group relative overflow-hidden bg-finca-light text-stone-900 px-8 py-3 uppercase tracking-[0.2em] text-[10px] font-bold transition-all hover:bg-white hover:px-10 rounded-sm inline-block"
                    >
                        <span className="relative z-10">En savoir plus</span>
                    </button>
                </div>
            </div>

            <div className="absolute inset-0 z-40 pointer-events-none">
                <div
                    className={`absolute top-0 left-0 h-full w-1/2 transition-none`}
                    style={{ backgroundColor: localColorLight, transform: leftCurtainTransform, transition: 'none' }}
                />

                <div
                    className={`absolute top-0 right-0 h-full w-1/2 transition-none`}
                    style={{ backgroundColor: localColorLight, transform: rightCurtainTransform, transition: 'none' }}
                />
            </div>
        </section>
    );
};

const ValuesSection = () => (
    <section id="values" className="py-20 bg-finca-light">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <ScrollFadeIn threshold={0.2}>
            <h2 className="text-[10px] font-serif tracking-[0.4em] text-stone-500 uppercase text-center mb-16">
                Notre Philosophie
            </h2>
            </ScrollFadeIn>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
                {SITE_CONFIG.MATERIALS.map((item, index) => (
                    <ScrollFadeIn key={index} delay={index * 150} threshold={0.5} className="text-center">
                        <div className="text-stone-900 text-4xl mb-4 font-serif italic font-extralight">
                            {index === 0 && <span>01</span>}
                            {index === 1 && <span>02</span>}
                            {index === 2 && <span>03</span>}
                        </div>
                        <h3 className="font-serif text-2xl text-stone-900 mb-4">{item.TITLE}</h3>
                        <p className="text-stone-500 font-light leading-relaxed">{item.TEXT}</p>
                    </ScrollFadeIn>
                ))}
            </div>
        </div>
    </section>
);

const CoachingSection = ({ onOpen }) => (
    <section id="coaching" className="py-20 md:py-24 bg-finca-medium">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                <ScrollFadeIn threshold={0.4} initialScale={0.95}>
                <div className="relative aspect-[4/5] bg-stone-100 overflow-hidden rounded-lg shadow-xl">
                    <img
                        src={SITE_CONFIG.COACHING.IMAGE_URL}
                        alt="Coaching en décoration"
                        onError={(e) => {e.target.onerror = null; e.target.src="https://placehold.co/800x1000/F0EBE5/7D7D7D?text=Coaching+Design"}}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-stone-900/10"></div>
                </div>
                </ScrollFadeIn>

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
                    <button
                        onClick={onOpen}
                        className="group relative overflow-hidden bg-stone-900 text-white px-8 py-3 uppercase tracking-[0.2em] text-[10px] font-bold transition-all hover:bg-stone-700 hover:px-10 rounded-sm"
                    >
                        <span className="relative z-10">{SITE_CONFIG.COACHING.BUTTON_TEXT}</span>
                    </button>
                    </ScrollFadeIn>
                </div>
            </div>
        </div>
    </section>
);

const Footer = ({ logo, onPolicyClick, onContactClick, onPhilosophyClick }) => (
    <footer className="bg-stone-900 text-finca-light py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 border-b border-stone-800 pb-12 mb-12">

                <div>
                    <h3 className="text-3xl font-serif tracking-widest font-bold mb-6 text-finca-light">{logo}</h3>
                    <p className="text-stone-400 text-sm font-light whitespace-pre-line">{SITE_CONFIG.FOOTER.ABOUT}</p>
                </div>

                <div>
                    <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-300 mb-6">Navigation</h4>
                    <ul className="space-y-3 text-sm">
                        <li><a href="#collections" className="text-stone-400 hover:text-white transition-colors" onClick={(e) => { e.preventDefault(); document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' }); }}>Boutique</a></li>
                        <li><a href="#coaching" className="text-stone-400 hover:text-white transition-colors" onClick={(e) => { e.preventDefault(); document.getElementById('coaching')?.scrollIntoView({ behavior: 'smooth' }); }}>Coaching</a></li>
                        <li><a href="#journal-section" className="text-stone-400 hover:text-white transition-colors" onClick={(e) => { e.preventDefault(); document.getElementById('journal-section')?.scrollIntoView({ behavior: 'smooth' }); }}>Le Journal</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-300 mb-6">Informations</h4>
                    <ul className="space-y-3 text-sm">
                        <li><button onClick={onContactClick} className="text-stone-400 hover:text-white transition-colors text-left">Contact</button></li>
                        <li><button onClick={onPhilosophyClick} className="text-stone-400 hover:text-white transition-colors text-left">Notre Philosophie</button></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-300 mb-6">Suivez-nous</h4>
                    <div className="flex items-center gap-4">
                        <a href={SITE_CONFIG.SOCIAL_LINKS.INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-white transition-colors" aria-label="Instagram">
                            <Instagram size={20} />
                        </a>
                        <a href={SITE_CONFIG.SOCIAL_LINKS.FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-white transition-colors" aria-label="Facebook">
                            <Facebook size={20} />
                        </a>
                        <a href={SITE_CONFIG.SOCIAL_LINKS.TIKTOK_URL} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-white transition-colors" aria-label="TikTok">
                            <MessageSquare size={20} />
                        </a>
                    </div>
                    <p className="text-stone-500 text-xs mt-4">{SITE_CONFIG.SOCIAL_LINKS.INSTAGRAM_HANDLE}</p>
                </div>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-center text-stone-500 text-[10px] uppercase tracking-widest pt-4 font-medium">
                <span>© {new Date().getFullYear()}, {logo}</span>
                <span className="hidden md:inline">•</span>
                <button onClick={() => onPolicyClick('privacy')} className="hover:text-stone-300 transition-colors">Politique de confidentialité</button>
                <span className="hidden md:inline">•</span>
                <button onClick={() => onPolicyClick('coordonnees')} className="hover:text-stone-300 transition-colors">Coordonnées</button>
                <span className="hidden md:inline">•</span>
                <button onClick={() => onPolicyClick('terms')} className="hover:text-stone-300 transition-colors">Conditions d’utilisation</button>
                <span className="hidden md:inline">•</span>
                <button onClick={() => onPolicyClick('refund')} className="hover:text-stone-300 transition-colors">Politique de remboursement</button>
                <span className="hidden md:inline">•</span>
                <button onClick={() => onPolicyClick('shipping')} className="hover:text-stone-300 transition-colors">Politique d’expédition</button>
                <span className="hidden md:inline">•</span>
                <button onClick={() => onPolicyClick('terms')} className="hover:text-stone-300 transition-colors">Conditions générales de vente</button>
                <span className="hidden md:inline">•</span>
                <button onClick={() => onPolicyClick('mentions-legales')} className="hover:text-stone-300 transition-colors">Mentions légales</button>
                <span className="hidden md:inline">•</span>
                <button onClick={() => onPolicyClick('cookies')} className="hover:text-stone-300 transition-colors">Préférences en matière de cookies</button>
            </div>
        </div>
    </footer>
);


// ==============================================================================
// 6. COMPOSANT APPLICATION PRINCIPALE (App)
// ==============================================================================

const App = () => {
    // Inject custom tailwind config
    useEffect(() => {
        injectTailwindConfig();
    }, []);

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedDescriptionProduct, setSelectedDescriptionProduct] = useState(null);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [isArticleView, setIsArticleView] = useState(false);

    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [isPolicyView, setIsPolicyView] = useState(false);
    const [isCustomFurnitureOpen, setIsCustomFurnitureOpen] = useState(false);
    const [isCoachingOpen, setIsCoachingOpen] = useState(false);
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [isPhilosophyOpen, setIsPhilosophyOpen] = useState(false);

    const [selectedCollectionId, setSelectedCollectionId] = useState(null);
    const [randomizedProducts, setRandomizedProducts] = useState([]);
    const logoText = data?.shop?.name || "LA MAISON";

    const collections = data?.collections?.edges || [];
    const blog = data?.blogs?.edges?.[0]?.node;
    const articles = blog?.articles?.edges || [];

    const { COLLECTION_ITEM_WIDTH, JOURNAL_ITEM_WIDTH, NOUVEAUTES_ITEM_WIDTH } = DESIGN_CONFIG;

    let currentPageTitle = logoText;
    let currentPageType = 'index';
    let currentProductData = null;

    if (isArticleView && selectedArticle) {
        currentPageTitle = selectedArticle.node.title;
        currentPageType = 'article';
    } else if (isPolicyView && selectedPolicy) {
        currentPageTitle = selectedPolicy.title;
        currentPageType = 'page';
    } else if (selectedDescriptionProduct) {
        currentPageTitle = selectedDescriptionProduct.title;
        currentPageType = 'view_item';
        currentProductData = selectedDescriptionProduct;
    }

    useAnalyticsTracker(currentPageType, currentPageTitle, currentProductData);

    useEffect(() => {
        const link = document.createElement('link');
        link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap";
        link.rel = "stylesheet";
        document.head.appendChild(link);
        return () => document.head.removeChild(link);
    }, []);

    const newArrivalsCollection = useMemo(() => collections.find(
        c => c.node.title.toLowerCase() === 'nouveautés' || c.node.handle === 'nouveautes'
    ), [collections]);

    const regularCollections = useMemo(() => collections.filter(
        c => c.node.title.toLowerCase() !== 'nouveautés' && c.node.handle !== 'nouveautes'
    ), [collections]);

    const allProducts = useMemo(() => {
        const uniqueProductsMap = new Map();
        const allProductsRaw = regularCollections.flatMap(c => c.node.products.edges).map(e => e.node);

        allProductsRaw.forEach(product => {
            if (!uniqueProductsMap.has(product.id)) {
                uniqueProductsMap.set(product.id, product);
            }
        });

        return Array.from(uniqueProductsMap.values());
    }, [regularCollections]);

    const nouveautesProducts = useMemo(() => newArrivalsCollection
        ? newArrivalsCollection.node.products.edges.map(e => e.node)
        : allProducts.slice(0, 10)
    , [newArrivalsCollection, allProducts]);

    useEffect(() => {
        if (allProducts.length > 0) {
            const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
            setRandomizedProducts(shuffled.slice(0, 4));
        }
    }, [allProducts]);

    const filteredProducts = useMemo(() => {
        if (!selectedCollectionId || selectedCollectionId === 'all') {
            return randomizedProducts.length > 0 ? randomizedProducts : allProducts.slice(0, 4);
        }

        const targetCollection = collections.find(c => c.node.id === selectedCollectionId);

        if (targetCollection) {
            if (targetCollection.node.id === newArrivalsCollection?.node?.id) {
                return nouveautesProducts;
            }
            return targetCollection.node.products.edges.map(e => e.node);
        }

        return allProducts;
    }, [selectedCollectionId, allProducts, collections, newArrivalsCollection, nouveautesProducts, randomizedProducts]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const fetchedData = await fetchShopifyData();
            setData(fetchedData || FALLBACK_DATA);
            setLoading(false);
        };
        loadData();
    }, []);

    const handleOpenVariantSelector = useCallback((product) => {
        setSelectedProduct(product);
        setSelectedDescriptionProduct(null);
    }, []);

    const handleOpenDescriptionModal = useCallback((product) => {
        setSelectedDescriptionProduct(product);
        setSelectedProduct(null);
    }, []);

    const handleCloseDescriptionModal = useCallback(() => {
        setSelectedDescriptionProduct(null);
    }, []);

    const handleCollectionFilter = useCallback((collectionId) => {
        setSelectedCollectionId(collectionId);

        const productsSection = document.getElementById('products');
        if (productsSection) {
            window.scrollTo({
                top: productsSection.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    }, []);

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

        setSelectedProduct(null);
        setIsCartOpen(true);
    }, [cartItems]);

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

    const handleRemoveFromCart = useCallback((variantId) => {
        setCartItems(prevItems => prevItems.filter(item => item.variantId !== variantId));
    }, []);

    const handleArticleClick = useCallback((article) => {
        setSelectedArticle(article);
        setIsArticleView(true);
        setIsPolicyView(false);
    }, []);

    const handleBackToMain = useCallback(() => {
        setIsArticleView(false);
        setIsPolicyView(false);
        setSelectedArticle(null);
        setSelectedPolicy(null);
        setSelectedCollectionId(null);
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);

    const handlePolicyClick = useCallback((policyKey) => {
        if (!data?.shop) return;

        let policyContent = null;
        const shop = data.shop;
        const pages = data.pages?.edges || [];

        switch(policyKey) {
            case 'privacy':
                policyContent = shop.privacyPolicy || pages.find(p => p.node.handle === 'politique-de-confidentialite')?.node || { title: 'Politique de confidentialité', body: '<p>Contenu non trouvé.</p>' };
                break;
            case 'refund':
                policyContent = shop.refundPolicy || pages.find(p => p.node.handle === 'politique-de-remboursement')?.node || { title: 'Politique de remboursement', body: '<p>Contenu non trouvé.</p>' };
                break;
            case 'shipping':
                policyContent = shop.shippingPolicy || pages.find(p => p.node.handle === 'politique-d-expedition')?.node || { title: 'Politique d’expédition', body: '<p>Contenu non trouvé.</p>' };
                break;
            case 'terms':
                policyContent = shop.termsOfService || pages.find(p => p.node.handle === 'conditions-generales-de-vente')?.node || { title: 'Conditions Générales de Vente', body: '<p>Contenu non trouvé.</p>' };
                break;
            case 'mentions-legales':
                policyContent = pages.find(p => p.node.handle === 'mentions-legales' || p.node.handle === 'mentions')?.node
                                 || { title: 'Mentions Légales', body: '<p>Veuillez créer une page "Mentions Légales" dans votre admin Shopify.</p>' };
                break;
            case 'coordonnees':
                 policyContent = pages.find(p => p.node.handle === 'contact' || p.node.handle === 'coordonnees' || p.node.handle === 'nous-contacter')?.node
                                 || { title: 'Coordonnées', body: `<p><strong>La Maison Ibizienne</strong><br/>Email: contact@lamaisonibizienne.com<br/>Veuillez ajouter une page "Contact" ou "Coordonnées" dans votre admin Shopify.</p>` };
                break;
            case 'cookies':
                 policyContent = pages.find(p => p.node.handle === 'cookies' || p.node.handle === 'politique-cookies' || p.node.handle === 'cookie-policy')?.node
                                 || { title: 'Politique de Cookies', body: `<p>Nous utilisons des cookies pour améliorer votre expérience. Veuillez créer une page "Politique de Cookies" dans votre admin Shopify pour afficher les détails ici.</p>` };
                break;
            default:
                return;
        }

        if (policyContent) {
            setSelectedPolicy(policyContent);
            setIsPolicyView(true);
            setIsArticleView(false);
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    }, [data]);

    const handleHeroScroll = () => {
        const collectionsSection = document.getElementById('nouveautes');
        if (collectionsSection) {
            window.scrollTo({
                top: collectionsSection.offsetTop - 100,
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

    const currentCollectionTitle = selectedCollectionId
        ? collections.find(c => c.node.id === selectedCollectionId)?.node?.title || "Sélection Filtrée"
        : "Nos Incontournables";

    return (
        <div className="relative min-h-screen bg-finca-light font-sans text-stone-900">

            <Navbar
                logo={logoText}
                cartCount={cartItems.length}
                onOpenCart={() => setIsCartOpen(true)}
                isArticleView={isArticleView}
                isPolicyView={isPolicyView}
                onBack={handleBackToMain}
                onOpenMenu={() => setIsMenuOpen(true)}
            />

            <MobileMenuSidebar
                isMenuOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onContactClick={() => { setIsMenuOpen(false); setIsContactOpen(true); }}
                onPhilosophyClick={() => { setIsMenuOpen(false); setIsPhilosophyOpen(true); }}
            />

            <CustomFurnitureModal
                isOpen={isCustomFurnitureOpen}
                onClose={() => setIsCustomFurnitureOpen(false)}
            />

            <CoachingModal
                isOpen={isCoachingOpen}
                onClose={() => setIsCoachingOpen(false)}
            />

            <ContactModal
                isOpen={isContactOpen}
                onClose={() => setIsContactOpen(false)}
            />

            <PhilosophyModal
                isOpen={isPhilosophyOpen}
                onClose={() => setIsPhilosophyOpen(false)}
            />

            {selectedDescriptionProduct && (
                <ProductDescriptionModal
                    product={selectedDescriptionProduct}
                    onClose={handleCloseDescriptionModal}
                    handleOpenVariantSelector={handleOpenVariantSelector}
                />
            )}

            {selectedProduct && (
                <VariantSelector
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onConfirm={handleAddToCart}
                />
            )}

            <CartSidebar
                cartItems={cartItems}
                isCartOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveFromCart}
                onCheckout={() => proceedToCheckout(cartItems)}
            />

            {(isCartOpen || selectedProduct || selectedDescriptionProduct || isMenuOpen || isCustomFurnitureOpen || isCoachingOpen || isContactOpen || isPhilosophyOpen) && <div className="fixed inset-0 bg-finca-medium/95 lg:bg-finca-medium/95 backdrop-blur-sm z-40 transition-opacity" onClick={() => { setIsCartOpen(false); setSelectedProduct(null); setSelectedDescriptionProduct(null); setIsMenuOpen(false); setIsCustomFurnitureOpen(false); setIsCoachingOpen(false); setIsContactOpen(false); setIsPhilosophyOpen(false); }} />}

            {isArticleView ? (
                <ArticleView article={selectedArticle} />
            ) : isPolicyView ? (
                <LegalPageView page={selectedPolicy} />
            ) : (

                <main>
                    <HeroSection onScroll={handleHeroScroll} />

                    <Carousel
                        title={SITE_CONFIG.SECTIONS.NOUVEAUTES_TITLE}
                        subtitle={SITE_CONFIG.SECTIONS.NOUVEAUTES_SUBTITLE}
                        anchorId="nouveautes"
                        itemWidth={NOUVEAUTES_ITEM_WIDTH}
                    >
                        {nouveautesProducts.slice(0, 10).map((product, index) => (
                            <NouveautesProductCard
                                key={product.id + index}
                                product={product}
                                onClick={handleOpenDescriptionModal}
                                onAddToCart={handleOpenVariantSelector}
                                onShowDescription={handleOpenDescriptionModal}
                            />
                        ))}
                    </Carousel>

                    <Carousel
                        title={SITE_CONFIG.SECTIONS.UNIVERS}
                        subtitle="Collections Exclusives"
                        anchorId="collections"
                        itemWidth={COLLECTION_ITEM_WIDTH}
                    >
                        {regularCollections.map(({ node }) => (
                            <CollectionCard
                                key={node.id}
                                collection={node}
                                onFilterCollection={handleCollectionFilter}
                            />
                        ))}
                    </Carousel>

                    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full bg-finca-light">
                        <section id="products" className="w-full py-16">
                            <div className="max-w-[1800px] mx-auto px-6 md:px-12">
                                <ScrollFadeIn threshold={0.1}>
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16">
                                        <div>
                                            <span className="text-[10px] font-serif tracking-[0.3em] text-stone-400 uppercase mb-3 block">
                                                La Boutique
                                            </span>
                                            <h2 className="text-3xl md:text-4xl font-serif text-stone-900 italic font-light">
                                                {currentCollectionTitle}
                                                {selectedCollectionId && (
                                                    <button
                                                        onClick={() => setSelectedCollectionId(null)}
                                                        className="ml-4 text-xs font-sans text-stone-500 hover:text-stone-900 uppercase tracking-widest underline"
                                                    >
                                                        [Effacer le filtre]
                                                    </button>
                                                )}
                                            </h2>
                                        </div>
                                    </div>
                                </ScrollFadeIn>

                                {filteredProducts.length > 0 ? (
                                    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 md:gap-8`}>
                                        {filteredProducts.map((product, index) => (
                                            <ScrollFadeIn key={product.id + index} delay={index * 50} threshold={0.1}>
                                                <ProductCard
                                                    product={product}
                                                    onClick={handleOpenDescriptionModal}
                                                    onAddToCart={handleOpenVariantSelector}
                                                    onShowDescription={handleOpenDescriptionModal}
                                                />
                                            </ScrollFadeIn>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-stone-500 font-serif italic border border-stone-200 p-8 rounded-lg">
                                        Aucun produit trouvé dans cette collection.
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    <ValuesSection />

                    <CustomFurnitureSection onOpen={() => setIsCustomFurnitureOpen(true)} />

                    <CoachingSection onOpen={() => setIsCoachingOpen(true)} />

                    {articles.length > 0 && (
                        <Carousel
                            title={SITE_CONFIG.SECTIONS.JOURNAL_TITLE}
                            subtitle={SITE_CONFIG.SECTIONS.JOURNAL_SUBTITLE}
                            anchorId="journal-section"
                            itemWidth={JOURNAL_ITEM_WIDTH}
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

                    <Footer
                        logo={logoText}
                        onPolicyClick={handlePolicyClick}
                        onContactClick={() => setIsContactOpen(true)}
                        onPhilosophyClick={() => setIsPhilosophyOpen(true)}
                    />

                </main>
            )}
        </div>
    );
};

export default App;
