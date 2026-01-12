// SilverCoinKing Website JavaScript

// Contract address
const CONTRACT_ADDRESS = "FyP7vp9uKfULi7JAV96Q8YHZWuoJLUWr4bhpUbufpump";

// ===== Silver Price API Integration =====
async function fetchSilverPrice() {
    let success = false;

    // Try primary API: metals.live
    try {
        const response = await fetch('https://api.metals.live/v1/spot');
        if (response.ok) {
            const data = await response.json();
            const silver = data.find(m => m.metal === 'silver');
            const gold = data.find(m => m.metal === 'gold');

            if (silver && silver.price) {
                updatePriceDisplay({
                    price: silver.price,
                    goldPrice: gold ? gold.price : null,
                    source: 'metals.live'
                });
                success = true;
            }
        }
    } catch (error) {
        console.log('Primary API (metals.live) failed:', error.message);
    }

    // Try fallback API if primary failed
    if (!success) {
        try {
            const response = await fetch('https://api.gold-api.com/price/XAG');
            if (response.ok) {
                const data = await response.json();
                if (data.price) {
                    updatePriceDisplay({
                        price: data.price,
                        change: data.ch || 0,
                        changePercent: data.chp || 0,
                        source: 'gold-api'
                    });
                    success = true;
                }
            }
        } catch (error) {
            console.log('Fallback API failed:', error.message);
        }
    }

    // If all APIs fail, show placeholder with current time
    if (!success) {
        showPlaceholderData();
    }
}

function updatePriceDisplay(data) {
    const priceEl = document.getElementById('silver-price-value');
    const changeEl = document.getElementById('silver-change');
    const timestampEl = document.getElementById('price-timestamp');
    const ratioEl = document.getElementById('gold-silver-ratio');
    const highEl = document.getElementById('silver-high');
    const lowEl = document.getElementById('silver-low');
    const ytdEl = document.getElementById('silver-ytd');

    // Update main price
    if (priceEl && data.price) {
        priceEl.textContent = data.price.toFixed(2);
        priceEl.classList.remove('price-demo');
        priceEl.classList.add('price-loaded');
    }

    // Update change
    if (changeEl) {
        if (data.change !== undefined && data.changePercent !== undefined) {
            const isPositive = data.change >= 0;
            changeEl.innerHTML = `
                <span class="change-value ${isPositive ? 'positive' : 'negative'}">
                    ${isPositive ? '▲' : '▼'} $${Math.abs(data.change).toFixed(2)} 
                    (${isPositive ? '+' : ''}${data.changePercent.toFixed(2)}%)
                </span>
            `;
        } else {
            changeEl.innerHTML = `<span class="change-value">Live from ${data.source || 'API'}</span>`;
        }
    }

    // Update timestamp with current time
    if (timestampEl) {
        const now = new Date();
        timestampEl.textContent = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    // Update gold/silver ratio
    if (ratioEl && data.goldPrice && data.price) {
        const ratio = (data.goldPrice / data.price).toFixed(1);
        ratioEl.textContent = `${ratio}:1`;
    } else if (ratioEl && data.price) {
        // Estimate ratio using current approximate gold price (~$4500 in 2026)
        const estimatedRatio = (4500 / data.price).toFixed(1);
        ratioEl.textContent = `~${estimatedRatio}:1`;
    }

    // Set high/low based on current price (estimate ±2%)
    if (highEl && data.price) {
        highEl.textContent = `$${(data.price * 1.02).toFixed(2)}`;
    }
    if (lowEl && data.price) {
        lowEl.textContent = `$${(data.price * 0.98).toFixed(2)}`;
    }

    // YTD - not available from free APIs
    if (ytdEl) {
        ytdEl.textContent = 'N/A';
    }
}

function showPlaceholderData() {
    const priceEl = document.getElementById('silver-price-value');
    const changeEl = document.getElementById('silver-change');
    const timestampEl = document.getElementById('price-timestamp');
    const highEl = document.getElementById('silver-high');
    const lowEl = document.getElementById('silver-low');
    const ratioEl = document.getElementById('gold-silver-ratio');
    const ytdEl = document.getElementById('silver-ytd');

    if (priceEl) {
        priceEl.textContent = '30.50';
        priceEl.classList.add('price-demo');
    }

    if (changeEl) {
        changeEl.innerHTML = `
            <span class="change-value demo">
                ⚠️ Unable to fetch live data
            </span>
        `;
    }

    if (timestampEl) {
        timestampEl.textContent = 'Refresh to retry';
    }

    if (highEl) highEl.textContent = '$31.00';
    if (lowEl) lowEl.textContent = '$30.00';
    if (ratioEl) ratioEl.textContent = '~87:1';
    if (ytdEl) ytdEl.textContent = 'N/A';
}

// Fetch price on load and refresh every 60 seconds
fetchSilverPrice();
setInterval(fetchSilverPrice, 60000);

// ===== Copy Contract Address =====
function copyContract() {
    const contractText = document.getElementById('contract').textContent;
    if (contractText && contractText.length > 10) {
        navigator.clipboard.writeText(contractText).then(() => {
            showToast('Contract address copied!');
        }).catch(err => {
            console.error('Failed to copy:', err);
            showToast('Failed to copy');
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
