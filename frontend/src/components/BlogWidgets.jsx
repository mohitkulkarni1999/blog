import { useState, useEffect } from 'react';
import { Cloud, TrendingUp, TrendingDown, ArrowRight, Activity, Sun, CloudRain, SunMedium } from 'lucide-react';
import { Link } from 'react-router-dom';

// 1. Weather Widget
export const WeatherWidget = () => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [locationName, setLocationName] = useState('New Delhi, IN');

    useEffect(() => {
        // Fetch weather and reverse geocode
        const fetchWeatherByCoords = async (lat, lon) => {
            try {
                // 1. Fetch live weather using open-meteo
                const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
                const weatherData = await weatherRes.json();
                setWeather(weatherData.current_weather);

                // 2. Fetch City/Country name using BigDataCloud's free reverse geocoding API
                const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
                const geoData = await geoRes.json();

                // Fallback through available locality fields
                const city = geoData.city || geoData.locality || geoData.principalSubdivision;
                if (city && geoData.countryCode) {
                    setLocationName(`${city}, ${geoData.countryCode}`);
                }
            } catch (err) {
                console.error("Failed to fetch live weather", err);
            } finally {
                setLoading(false);
            }
        };

        const checkLocation = () => {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
                    },
                    (error) => {
                        console.warn("Geolocation blocked or failed. Using default location.", error);
                        fetchWeatherByCoords(28.6139, 77.209); // New Delhi
                    },
                    { timeout: 7000 } // Fallback to New Delhi if it takes longer than 7s
                );
            } else {
                fetchWeatherByCoords(28.6139, 77.209);
            }
        };

        checkLocation();
    }, []);

    if (loading) return <div className="h-32 bg-gray-100 dark:bg-dark-card animate-pulse rounded-[2rem] border border-gray-100 dark:border-dark-border"></div>;
    if (!weather) return null;

    const getWeatherIcon = (code) => {
        if (code <= 3) return <Sun size={40} className="text-yellow-400 drop-shadow-lg animate-pulse" />;
        if (code <= 69) return <Cloud size={40} className="text-gray-400 drop-shadow-md" />;
        return <CloudRain size={40} className="text-blue-400 drop-shadow-md" />;
    };

    return (
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700"></div>
            <div className="flex justify-between items-center relative z-10">
                <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-white/80 mb-1">{locationName}</h3>
                    <div className="text-4xl font-heading font-black flex items-start gap-1">
                        {Math.round(weather.temperature)}<span className="text-xl mt-1">°C</span>
                    </div>
                </div>
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
                    {getWeatherIcon(weather.weathercode)}
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-white/90">
                <span>Wind: {weather.windspeed} km/h</span>
                <span className="flex items-center gap-1"><SunMedium size={14} /> LIVE</span>
            </div>
        </div>
    );
};

// 2. Market Widget (Crypto & Stocks)
export const MarketWidget = () => {
    const [crypto, setCrypto] = useState({ btc: null, eth: null });

    // Hardcoded stock fallback since public APIs without keys are rare for NSE/BSE
    const [stocks] = useState([
        { symbol: 'NIFTY 50', price: '22,462.00', change: '+0.85', up: true },
        { symbol: 'SENSEX', price: '73,996.96', change: '+0.75', up: true }
    ]);

    useEffect(() => {
        const fetchCrypto = async () => {
            try {
                // Free CoinGecko API
                const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true');
                const data = await res.json();
                setCrypto({
                    btc: { price: data.bitcoin.usd, change: data.bitcoin.usd_24h_change },
                    eth: { price: data.ethereum.usd, change: data.ethereum.usd_24h_change }
                });
            } catch (err) {
                console.error("Failed to fetch crypto");
            }
        };
        fetchCrypto();
    }, []);

    const MarketRow = ({ symbol, price, change, up }) => (
        <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${up ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'}`}>
                    {up ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                </div>
                <div>
                    <h5 className="text-sm font-bold text-gray-900 dark:text-white uppercase">{symbol}</h5>
                    <p className={`text-xs font-bold ${up ? 'text-emerald-500' : 'text-red-500'}`}>
                        {up ? '+' : ''}{change ? Number(change).toFixed(2) : '0.00'}%
                    </p>
                </div>
            </div>
            <div className="text-right">
                <span className="text-sm font-black text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                    {typeof price === 'number' ? `$${price.toLocaleString()}` : price}
                </span>
            </div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-dark-card p-6 rounded-[2rem] shadow-soft border border-gray-100 dark:border-dark-border relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-heading font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
                    <Activity size={20} className="text-primary-600" /> Markets
                </h4>
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
            </div>

            <div className="space-y-1">
                {stocks.map(s => <MarketRow key={s.symbol} {...s} />)}
                <div className="my-2 border-t border-gray-100 dark:border-white/5 mx-2"></div>
                {crypto.btc && <MarketRow symbol="BTC" price={crypto.btc.price} change={crypto.btc.change} up={crypto.btc.change >= 0} />}
                {crypto.eth && <MarketRow symbol="ETH" price={crypto.eth.price} change={crypto.eth.change} up={crypto.eth.change >= 0} />}
            </div>
        </div>
    );
};

// 3. Related Posts Grid
export const RelatedPostsGrid = ({ posts }) => {
    if (!posts || posts.length === 0) return null;

    return (
        <section className="py-12 border-t border-gray-100 dark:border-white/5 mt-16">
            <h3 className="text-2xl font-heading font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
                <div className="w-8 h-1 bg-primary-600 rounded-full"></div> More from the Newsroom
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {posts.slice(0, 3).map(post => (
                    <article key={post.id} className="group bg-white dark:bg-dark-card rounded-3xl overflow-hidden border border-gray-100 dark:border-dark-border shadow-soft transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col h-full">
                        <Link to={`/blog/${post.slug}`} className="relative h-48 overflow-hidden block">
                            <img
                                src={post.featured_image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80'}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                alt={post.title}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </Link>
                        <div className="p-6 flex flex-col flex-grow relative bg-white dark:bg-dark-card">
                            <Link to={`/blog/${post.slug}`}>
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3 leading-snug group-hover:text-primary-600 transition-colors line-clamp-2">
                                    {post.title}
                                </h4>
                            </Link>
                            <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-6 font-medium">
                                {post.meta_description || 'Click to read the full technical article from our team...'}
                            </p>
                            <div className="mt-auto pt-4 border-t border-gray-50 dark:border-dark-border">
                                <Link to={`/blog/${post.slug}`} className="text-primary-600 dark:text-primary-400 text-xs font-black uppercase tracking-widest flex items-center gap-2 group/btn">
                                    Read More <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
};

// 4. Trending Posts Widget
export const TrendingPostsWidget = ({ posts }) => {
    if (!posts || posts.length === 0) return null;
    return (
        <div className="bg-white dark:bg-dark-card p-6 rounded-[2rem] shadow-soft border border-gray-100 dark:border-dark-border">
            <h4 className="text-lg font-heading font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-2 mb-6">
                <TrendingUp size={20} className="text-orange-500" /> Trending
            </h4>
            <div className="space-y-6">
                {posts.slice(0, 5).map((post, idx) => (
                    <Link key={post.id} to={`/blog/${post.slug}`} className="flex gap-4 group cursor-pointer">
                        <span className="text-3xl font-black text-gray-100 dark:text-white/5 group-hover:text-primary-600/20 transition-colors">0{idx + 1}</span>
                        <div>
                            <h5 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug">
                                {post.title}
                            </h5>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1 block">
                                {post.category_name}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

// 5. Newsletter Widget
export const NewsletterWidget = () => {
    const [email, setEmail] = useState('');
    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`Thanks! ${email} has been added to our network.`);
        setEmail('');
    };
    return (
        <div className="bg-primary-600 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
            <h4 className="text-2xl font-heading font-black leading-tight mb-4 relative z-10">Join the Hub Newsletter</h4>
            <p className="text-primary-100 text-sm mb-6 relative z-10 font-medium">Get the latest breaking updates and technical deep dives delivered straight to your inbox.</p>
            <form onSubmit={handleSubmit} className="relative z-10 space-y-3">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 placeholder:text-white/50"
                    required
                />
                <button type="submit" className="w-full bg-white text-primary-600 font-black uppercase text-xs tracking-widest py-4 rounded-2xl shadow-xl hover:bg-gray-100 transition-all">
                    Subscribe Now
                </button>
            </form>
        </div>
    );
};

// 6. Author Profile Card
export const AuthorProfile = ({ name, bio }) => {
    return (
        <div className="mt-12 p-8 md:p-12 rounded-[2.5rem] bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center gap-8 animate-fade-in">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white font-black text-4xl shadow-neon-primary flex-shrink-0">
                {name ? name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="text-center md:text-left">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-600 dark:text-primary-400 mb-2 block">Verified Author</span>
                <h4 className="text-2xl font-heading font-black text-gray-900 dark:text-white uppercase tracking-tight">{name || 'Mohit Ramesh Kulkarni'}</h4>
                <p className="text-gray-500 dark:text-gray-400 text-base mt-4 font-medium leading-relaxed">
                    {bio || "Tech writer covering AI, gaming, and emerging technologies. Dedicated to bringing you the most accurate and insightful updates daily inside the DailyUpdatesHub newsroom."}
                </p>
                <div className="flex items-center justify-center md:justify-start gap-4 mt-6">
                    <div className="px-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-gray-400">1.2k Followers</div>
                    <div className="px-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-gray-400">45 Articles</div>
                </div>
            </div>
        </div>
    );
};

