// SilverKing Website JavaScript

// Contract address (update this after token launch)
const CONTRACT_ADDRESS = "Coming Soon";

// ===== Silver Price API Integration =====
// Using multiple fallback sources for reliability

async function fetchSilverPrice() {
    try {
        // Primary: Use metals.live free endpoint (no API key needed)
        const response = await fetch('https://api.metals.live/v1/spot');
        if (response.ok) {
            const data = await response.json();
            const silver = data.find(m => m.metal === 'silver');
            const gold = data.find(m => m.metal === 'gold');

            if (silver) {
                updatePriceDisplay({
                    price: silver.price,
                    goldPrice: gold ? gold.price : null,
                    timestamp: new Date()
                });
                return;
            }
        }
    } catch (error) {
        console.log('Primary API failed, trying fallback...');
    }

    try {
        // Fallback: Use a different free source
        const response = await fetch('https://data-asg.goldprice.org/dbXRates/USD');
        if (response.ok) {
            const data = await response.json();
            if (data.items && data.items[0]) {
                const item = data.items[0];
                updatePriceDisplay({
                    price: item.xagPrice,
                    goldPrice: item.xauPrice,
                    change: item.chgXag,
                    changePercent: item.pcXag,
                    timestamp: new Date(item.ts)
                });
                return;
            }
        }
    } catch (error) {
        console.log('Fallback API also failed');
    }

    // If all APIs fail, show demo data with clear indication
    showDemoData();
}

function updatePriceDisplay(data) {
    const priceEl = document.getElementById('silver-price-value');
    const changeEl = document.getElementById('silver-change');
    const timestampEl = document.getElementById('price-timestamp');
    const ratioEl = document.getElementById('gold-silver-ratio');

    if (priceEl && data.price) {
        priceEl.textContent = data.price.toFixed(2);
        priceEl.classList.add('price-loaded');
    }

    if (changeEl) {
        if (data.change !== undefined) {
            const isPositive = data.change >= 0;
            changeEl.innerHTML = `
                <span class="change-value ${isPositive ? 'positive' : 'negative'}">
                    ${isPositive ? '▲' : '▼'} $${Math.abs(data.change).toFixed(2)} 
                    (${isPositive ? '+' : ''}${data.changePercent ? data.changePercent.toFixed(2) : '0.00'}%)
                </span>
            `;
        } else {
            changeEl.innerHTML = `<span class="change-value">Live price</span>`;
        }
    }

    if (timestampEl && data.timestamp) {
        timestampEl.textContent = data.timestamp.toLocaleTimeString();
    }

    if (ratioEl && data.goldPrice && data.price) {
        const ratio = (data.goldPrice / data.price).toFixed(1);
        ratioEl.textContent = `${ratio}:1`;
    }
}

function showDemoData() {
    // Show realistic demo data when APIs are unavailable
    const priceEl = document.getElementById('silver-price-value');
    const changeEl = document.getElementById('silver-change');
    const timestampEl = document.getElementById('price-timestamp');

    if (priceEl) {
        priceEl.textContent = '29.50';
        priceEl.classList.add('price-demo');
    }

    if (changeEl) {
        changeEl.innerHTML = `
            <span class="change-value demo">
                ⚠️ Demo data - API unavailable
            </span>
        `;
    }

    if (timestampEl) {
        timestampEl.textContent = 'Demo mode';
    }
}

// Fetch price on load and refresh every 60 seconds
fetchSilverPrice();
setInterval(fetchSilverPrice, 60000);

// ===== Copy Contract Address =====
function copyContract() {
    const contractText = document.getElementById('contract').textContent;
    if (contractText && contractText !== 'Coming Soon') {
        navigator.clipboard.writeText(contractText).then(() => {
            showToast('Contract address copied!');
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    } else {
        showToast('Contract address not available yet');
    }
}

// ===== Toast Notification =====
function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(192, 192, 192, 0.2);
        border: 1px solid rgba(192, 192, 192, 0.3);
        backdrop-filter: blur(10px);
        padding: 12px 24px;
        border-radius: 8px;
        color: #f8f9fa;
        font-size: 0.9rem;
        z-index: 9999;
        animation: slideUp 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from { opacity: 0; transform: translateX(-50%) translateY(20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    @keyframes slideDown {
        from { opacity: 1; transform: translateX(-50%) translateY(0); }
        to { opacity: 0; transform: translateX(-50%) translateY(20px); }
    }
    .price-loaded {
        animation: priceUpdate 0.5s ease;
    }
    @keyframes priceUpdate {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); color: #4ade80; }
        100% { transform: scale(1); }
    }
    .change-value.positive { color: #4ade80; }
    .change-value.negative { color: #f87171; }
    .change-value.demo { color: #fbbf24; font-size: 0.85rem; }
    .price-demo { opacity: 0.7; }
`;
document.head.appendChild(style);

// ===== Smooth Scroll =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== Navbar on Scroll =====
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(10, 10, 15, 0.95)';
    } else {
        navbar.style.background = 'rgba(10, 10, 15, 0.8)';
    }
});

// ===== Fade-in Animations =====
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    fadeInObserver.observe(section);
});

document.querySelectorAll('.about-card, .social-card, .info-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
    fadeInObserver.observe(card);
});

// ===== Particles =====
function createParticles() {
    const particleContainer = document.getElementById('particles');
    if (!particleContainer) return;

    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 2}px;
            height: ${Math.random() * 4 + 2}px;
            background: rgba(192, 192, 192, ${Math.random() * 0.3 + 0.1});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${Math.random() * 10 + 10}s ease-in-out infinite;
            animation-delay: ${Math.random() * 5}s;
        `;
        particleContainer.appendChild(particle);
    }
}

createParticles();

// ===== Console Branding =====
console.log(`
    ╔═══════════════════════════════════════════════════════════╗
    ║           👑 SilverCoinKing ($SVCK) Community               ║
    ║                                                           ║
    ║  ⚠️  This is a MEMECOIN - NOT silver or silver-backed     ║
    ║      Only participate with funds you can afford to lose   ║
    ╚═══════════════════════════════════════════════════════════╝
`);

