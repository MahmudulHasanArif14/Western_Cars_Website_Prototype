import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  lazy,
  Suspense,
} from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  Menu,
  X,
  ArrowRight,
  Volume2,
  VolumeX,
  ChevronDown,
  MapPin as MapPinIcon,
  Navigation,
} from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import { useInView } from "react-intersection-observer";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import heroVideo from "./assets/hero.mp4";

// ============ CAR MODEL (inline) ============
function CarModel() {
  const { scene } = useGLTF("/models/scene.gltf");
  return <primitive object={scene} scale={0.8} />;
}

// ============ CUSTOM HOOKS ============
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = (e) => setMatches(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
};

const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      return saved
        ? saved === "dark"
        : window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return [isDark, setIsDark];
};

// ============ 3D SCENE COMPONENT ============
const ThreeScene = ({ scrollY }) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const rotation = useTransform(scrollY, [0, 1000], [0, Math.PI * 2]);

  return (
    <div ref={ref} className="h-[400px] w-full md:h-[500px] relative">
      <AnimatePresence>
        {inView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <Suspense
              fallback={
                <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black animate-pulse" />
              }
            >
              <Canvas camera={{ position: [0, 1, 5], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                <Environment preset="city" />
                <motion.group rotation={rotation}>
                  <CarModel />
                </motion.group>
                <OrbitControls
                  enableZoom={false}
                  autoRotate
                  autoRotateSpeed={2}
                />
              </Canvas>
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============ FARE ESTIMATOR ============
const FareEstimator = ({ pickup, dropoff, distance }) => {
  const [estimatedFare, setEstimatedFare] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculateFare = useCallback(async () => {
    if (!pickup || !dropoff) return;

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const baseFare = 5;
    const perMile = 2.5;
    const timeOfDay = new Date().getHours();
    const surgeMultiplier = timeOfDay >= 22 || timeOfDay <= 6 ? 1.5 : 1;

    const fare = (baseFare + distance * perMile) * surgeMultiplier;
    setEstimatedFare(Math.round(fare * 100) / 100);
    setLoading(false);
  }, [pickup, dropoff, distance]);

  useEffect(() => {
    calculateFare();
  }, [calculateFare]);

  return (
    <div className="mt-4 p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/50">Estimated Fare</span>
        {loading ? (
          <div className="w-20 h-6 bg-white/10 animate-pulse rounded" />
        ) : (
          <span className="text-2xl font-semibold text-white">
            £{estimatedFare || "—"}
          </span>
        )}
      </div>
      <div className="mt-2 text-xs text-white/40">
        *Includes base fare, distance, and time-based surcharges
      </div>
    </div>
  );
};

// ============ GOOGLE MAPS AUTOCOMPLETE ============
const LocationAutocomplete = ({ value, onChange, placeholder, label }) => {
  const [predictions, setPredictions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const autocompleteService = useRef(null);
  const placesService = useRef(null);

  useEffect(() => {
    setOptions({
      key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      libraries: ["places"],
    });

    const loadPlaces = async () => {
      try {
        const places = await importLibrary("places");
        autocompleteService.current = new places.AutocompleteService();
        placesService.current = new places.PlacesService(
          document.createElement("div"),
        );
      } catch (error) {
        console.error("Failed to load Google Maps Places library", error);
      }
    };
    loadPlaces();
  }, []);

  const handleInput = (e) => {
    const value = e.target.value;
    onChange(value);

    if (value.length > 2 && autocompleteService.current) {
      autocompleteService.current.getPlacePredictions(
        {
          input: value,
          types: ["geocode", "establishment"],
          componentRestrictions: { country: "uk" },
        },
        (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            setPredictions(results);
          }
        },
      );
    } else {
      setPredictions([]);
    }
  };

  const handleSelect = (prediction) => {
    onChange(prediction.description);
    setPredictions([]);
    setIsFocused(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-white/70 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/50 transition-colors"
        />
        <MapPinIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
      </div>
      <AnimatePresence>
        {isFocused && predictions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl"
          >
            {predictions.map((prediction) => (
              <button
                key={prediction.place_id}
                onClick={() => handleSelect(prediction)}
                className="w-full px-4 py-3 text-left text-white/80 hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                <Navigation className="w-4 h-4 text-white/30" />
                <span className="text-sm">{prediction.description}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============ BOOKING FORM ============
const BookingForm = ({ isOpen, onClose }) => {
  const [tripType, setTripType] = useState("one-way");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [distance, setDistance] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [mapsLoaded, setMapsLoaded] = useState(false);

  // Load Google Maps libraries
  useEffect(() => {
    setOptions({
      key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      libraries: ["places", "distance_matrix"],
    });

    const loadMaps = async () => {
      try {
        await importLibrary("places");
        await importLibrary("distance_matrix");
        setMapsLoaded(true);
      } catch (error) {
        console.error("Failed to load Google Maps libraries", error);
      }
    };
    loadMaps();
  }, []);

  const handleDistanceCalculation = useCallback(() => {
    if (!mapsLoaded || !pickup || !dropoff) return;

    const service = new window.google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [pickup],
        destinations: [dropoff],
        travelMode: "DRIVING",
        unitSystem: window.google.maps.UnitSystem.IMPERIAL,
      },
      (response, status) => {
        if (status === "OK") {
          const distanceInMiles =
            response.rows[0].elements[0].distance.value / 1609.34;
          setDistance(distanceInMiles);
        }
      },
    );
  }, [pickup, dropoff, mapsLoaded]);

  useEffect(() => {
    const timer = setTimeout(handleDistanceCalculation, 500);
    return () => clearTimeout(timer);
  }, [handleDistanceCalculation]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ tripType, pickup, dropoff, date, time, passengers });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="relative w-full max-w-2xl bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Book Your Ride</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/5 transition-colors text-white/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Progress Indicator */}
          <div className="flex gap-2 mb-6">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex-1 h-1 rounded-full transition-colors ${
                  step <= currentStep ? "bg-white" : "bg-white/10"
                }`}
              />
            ))}
          </div>

          {/* Step 1: Trip Details */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Trip Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["one-way", "return", "airport"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setTripType(type)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        tripType === type
                          ? "bg-white text-black"
                          : "bg-white/5 text-white/70 hover:bg-white/10"
                      }`}
                    >
                      {type === "one-way" && "One Way"}
                      {type === "return" && "Return"}
                      {type === "airport" && "Airport"}
                    </button>
                  ))}
                </div>
              </div>

              <LocationAutocomplete
                value={pickup}
                onChange={setPickup}
                placeholder="Enter pickup location"
                label="Pickup Location"
              />

              <LocationAutocomplete
                value={dropoff}
                onChange={setDropoff}
                placeholder="Enter dropoff location"
                label="Dropoff Location"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Passengers
                </label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={passengers}
                  onChange={(e) => setPassengers(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/50 transition-colors"
                />
              </div>

              <FareEstimator
                pickup={pickup}
                dropoff={dropoff}
                distance={distance}
              />
            </motion.div>
          )}

          {/* Step 2: Vehicle Selection */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-medium text-white">
                Select Your Vehicle
              </h3>
              <div className="grid gap-3">
                {[
                  {
                    name: "Business Sedan",
                    price: 45,
                    capacity: 3,
                    features: ["WiFi", "Water"],
                  },
                  {
                    name: "Executive SUV",
                    price: 75,
                    capacity: 6,
                    features: ["Leather", "Refreshments"],
                  },
                  {
                    name: "Limousine",
                    price: 120,
                    capacity: 8,
                    features: ["VIP", "Champagne"],
                  },
                ].map((vehicle) => (
                  <motion.div
                    key={vehicle.name}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:border-white/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium">
                          {vehicle.name}
                        </h4>
                        <p className="text-white/50 text-sm">
                          Up to {vehicle.capacity} passengers
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">
                          £{vehicle.price}
                        </p>
                        <p className="text-white/40 text-xs">per ride</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Passenger Details */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-medium text-white">
                Passenger Details
              </h3>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/50 transition-colors"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/50 transition-colors"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/50 transition-colors"
                  placeholder="+44 20 1234 5678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Special Requests
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/50 transition-colors resize-none h-20"
                  placeholder="Any special requirements?"
                />
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-6 flex gap-3">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1 px-6 py-3 rounded-xl border border-white/20 text-white hover:bg-white/5 transition-colors"
              >
                Back
              </button>
            )}
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="flex-1 px-6 py-3 rounded-xl bg-white text-black font-medium hover:bg-gray-200 transition-colors"
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                className="flex-1 px-6 py-3 rounded-xl bg-white text-black font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                Confirm Booking
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// ============ FAQ ITEM ============
function FAQItem({ question, answer, isOpen, toggle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="border-b border-white/10"
    >
      <button
        onClick={toggle}
        className="w-full py-6 flex items-center justify-between text-left text-white hover:text-white/80 transition-colors"
      >
        <span className="text-lg font-medium">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="text-white/70 leading-relaxed pb-6">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============ MAIN APP ============
export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isDark, setIsDark] = useDarkMode();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(null);

  // Use framer-motion's useScroll
  const { scrollY } = useScroll();

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);

  const faqs = [
    {
      question: "How do I book a ride?",
      answer:
        "Simply click 'Book Now' and fill out the form with your details. Our team will confirm your booking within 30 minutes.",
    },
    {
      question: "What vehicles are available?",
      answer:
        "We offer a fleet of luxury sedans, SUVs, and limousines. All are meticulously maintained and driven by professional chauffeurs.",
    },
    {
      question: "Do you offer airport transfers?",
      answer:
        "Yes, we specialise in airport transfers. We track your flight and adjust for delays, so you're always met on time.",
    },
    {
      question: "Is there a cancellation policy?",
      answer:
        "You can cancel for free up to 2 hours before your scheduled pickup. Later cancellations may incur a small fee.",
    },
  ];

  const toggleFAQ = (index) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  return (
    <div className={`min-h-screen ${isDark ? "dark" : ""}`}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
          * { font-family: 'Inter', sans-serif; }
          body { background: #000; color: #fff; margin: 0; overflow-x: hidden; }
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: #000; }
          ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
          ::-webkit-scrollbar-thumb:hover { background: #444; }
          .dark body { background: #000; }
        `}
      </style>

      {/* ========== THEME TOGGLE ========== */}
      <button
        onClick={() => setIsDark(!isDark)}
        className="fixed bottom-8 left-8 z-50 p-3 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all duration-300 shadow-lg hover:scale-110"
        aria-label="Toggle theme"
      >
        {isDark ? "☀️" : "🌙"}
      </button>

      {/* ========== SOUND TOGGLE ========== */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="fixed bottom-8 right-8 z-50 p-3 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all duration-300 shadow-lg hover:scale-110"
        aria-label="Toggle sound"
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5" />
        ) : (
          <Volume2 className="w-5 h-5" />
        )}
      </button>

      {/* ========== BOOKING MODAL ========== */}
      <AnimatePresence>
        {bookingOpen && (
          <BookingForm
            isOpen={bookingOpen}
            onClose={() => setBookingOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ========== HERO SECTION ========== */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="absolute inset-0"
        >
          <video
            autoPlay
            muted={isMuted}
            loop
            playsInline
            className="h-full w-full object-cover"
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
        </motion.div>

        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/60" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-white/10 blur-3xl rounded-full" />

        <div className="relative z-20 h-full flex flex-col">
          {/* HEADER */}
          <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full"
          >
            <div className="max-w-7xl mx-auto px-8 py-7 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center backdrop-blur-md bg-white/10"
                >
                  <span className="text-white font-semibold text-sm">WC</span>
                </motion.div>
                <h1 className="text-2xl font-semibold tracking-wide text-white">
                  Western Cars
                </h1>
              </div>

              <nav className="hidden md:flex items-center gap-10">
                {["Story", "Rates", "Benefits", "FAQ"].map((item) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    whileHover={{ y: -2 }}
                    className="text-white/90 hover:text-white transition-colors text-sm tracking-wide font-medium"
                  >
                    {item}
                  </motion.a>
                ))}
              </nav>

              <div className="hidden md:flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setBookingOpen(true)}
                  className="px-5 py-2.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-colors text-sm font-medium"
                >
                  Reserve Ride
                </motion.button>
              </div>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-white"
              >
                {mobileMenuOpen ? (
                  <X className="w-7 h-7" />
                ) : (
                  <Menu className="w-7 h-7" />
                )}
              </button>
            </div>

            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="md:hidden px-6"
                >
                  <div className="bg-white/10 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                    <nav className="flex flex-col gap-6">
                      {["Story", "Rates", "Benefits", "FAQ"].map((item) => (
                        <a
                          key={item}
                          href={`#${item.toLowerCase()}`}
                          className="text-white/90 hover:text-white transition-colors text-lg"
                        >
                          {item}
                        </a>
                      ))}
                      <button
                        onClick={() => {
                          setBookingOpen(true);
                          setMobileMenuOpen(false);
                        }}
                        className="mt-2 px-5 py-3 rounded-full bg-white text-black font-medium hover:bg-gray-200 transition-colors"
                      >
                        Reserve Ride
                      </button>
                    </nav>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.header>

          {/* HERO CONTENT */}
          <main className="flex-1 flex items-center justify-center">
            <div className="max-w-6xl mx-auto px-6 text-center -mt-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/10 backdrop-blur-md mb-8"
              >
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-xs tracking-[0.25em] uppercase text-white/80 font-semibold">
                  Private Taxi Hire
                </span>
              </motion.div>

              <div className="space-y-0 leading-none tracking-[-0.06em]">
                <motion.h1
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-6xl sm:text-7xl md:text-8xl lg:text-[9rem] font-medium text-white/70"
                >
                  Premium.
                </motion.h1>
                <motion.h1
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-6xl sm:text-7xl md:text-8xl lg:text-[9rem] font-medium text-white -mt-5 md:-mt-8"
                >
                  Accessible.
                </motion.h1>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-lg md:text-xl text-white/75 max-w-2xl mx-auto leading-relaxed"
              >
                Luxury airport transfers and executive private travel designed
                for comfort, elegance, and seamless journeys.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-10 flex flex-wrap items-center justify-center gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group px-7 py-3.5 rounded-full bg-white text-black font-medium hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-2xl"
                >
                  Discover
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setBookingOpen(true)}
                  className="px-7 py-3.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-colors font-medium"
                >
                  Book Now
                </motion.button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-20 flex flex-wrap items-center justify-center gap-10 text-white/70"
              >
                <motion.div whileHover={{ scale: 1.1 }}>
                  <h3 className="text-2xl font-semibold text-white">24/7</h3>
                  <p className="text-sm mt-1">Luxury Service</p>
                </motion.div>
                <div className="w-px h-10 bg-white/20 hidden sm:block" />
                <motion.div whileHover={{ scale: 1.1 }}>
                  <h3 className="text-2xl font-semibold text-white">500+</h3>
                  <p className="text-sm mt-1">Premium Transfers</p>
                </motion.div>
                <div className="w-px h-10 bg-white/20 hidden sm:block" />
                <motion.div whileHover={{ scale: 1.1 }}>
                  <h3 className="text-2xl font-semibold text-white">VIP</h3>
                  <p className="text-sm mt-1">Executive Experience</p>
                </motion.div>
              </motion.div>
            </div>
          </main>
        </div>
      </section>

      {/* ========== STORY SECTION ========== */}
      <motion.section
        id="story"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="py-24 bg-black/95"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-sm tracking-[0.2em] uppercase text-white/50 mb-4 block">
                Our Story
              </span>
              <h2 className="text-4xl sm:text-5xl font-medium mb-6">
                More Than a Ride
              </h2>
              <p className="text-white/70 text-lg leading-relaxed mb-6">
                Western Cars was born from a simple idea: travel should be
                effortless, elegant, and personal. We combine premium vehicles
                with exceptional service to create journeys that are as
                memorable as the destinations.
              </p>
              <p className="text-white/70 text-lg leading-relaxed">
                Our fleet is meticulously maintained, our chauffeurs are
                professionally trained, and every ride is tailored to your
                needs. Whether it's a quick airport transfer or a full day of
                executive travel, we deliver a seamless experience.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <ThreeScene scrollY={scrollY} />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ========== RATES SECTION ========== */}
      <motion.section
        id="rates"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="py-24 bg-black"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm tracking-[0.2em] uppercase text-white/50">
              Transparent Pricing
            </span>
            <h2 className="text-4xl sm:text-5xl font-medium mt-2">
              Choose Your Ride
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Business Sedan",
                price: "£45",
                features: [
                  "Up to 3 passengers",
                  "Professional chauffeur",
                  "Free WiFi",
                  "Bottled water",
                ],
              },
              {
                name: "Executive SUV",
                price: "£75",
                features: [
                  "Up to 6 passengers",
                  "Spacious interior",
                  "Leather seats",
                  "Refreshments",
                ],
              },
              {
                name: "Limousine",
                price: "£120",
                features: [
                  "Up to 8 passengers",
                  "VIP treatment",
                  "Champagne service",
                  "Entertainment system",
                ],
              },
            ].map((plan, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8"
              >
                <h3 className="text-xl font-semibold text-white">
                  {plan.name}
                </h3>
                <p className="text-4xl font-light mt-4 text-white">
                  {plan.price}{" "}
                  <span className="text-sm text-white/50">/ ride</span>
                </p>
                <ul className="mt-6 space-y-3 text-white/70">
                  {plan.features.map((feat, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
                      {feat}
                    </motion.li>
                  ))}
                </ul>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setBookingOpen(true)}
                  className="mt-8 w-full py-3 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-colors"
                >
                  Select
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ========== BENEFITS SECTION ========== */}
      <motion.section
        id="benefits"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="py-24 bg-black/95"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm tracking-[0.2em] uppercase text-white/50">
              Why Choose Us
            </span>
            <h2 className="text-4xl sm:text-5xl font-medium mt-2">
              Elevate Your Journey
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "🚗",
                title: "Premium Fleet",
                desc: "Latest luxury models with advanced features.",
              },
              {
                icon: "👔",
                title: "Professional Chauffeurs",
                desc: "Trained, courteous, and discreet.",
              },
              {
                icon: "⏱️",
                title: "On-Time Guarantee",
                desc: "We track your schedule and adjust.",
              },
              {
                icon: "✨",
                title: "Personalized Service",
                desc: "Tailored to your preferences.",
              },
            ].map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center"
              >
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-white/70 text-sm">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ========== FAQ SECTION ========== */}
      <motion.section
        id="faq"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="py-24 bg-black"
      >
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-sm tracking-[0.2em] uppercase text-white/50">
              FAQ
            </span>
            <h2 className="text-4xl sm:text-5xl font-medium mt-2">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={faqOpen === index}
                toggle={() => toggleFAQ(index)}
              />
            ))}
          </div>
        </div>
      </motion.section>

      {/* ========== FOOTER ========== */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="py-16 bg-black/95 border-t border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center bg-white/10">
                <span className="text-white font-semibold text-sm">WC</span>
              </div>
              <h1 className="text-xl font-semibold tracking-wide text-white">
                Western Cars
              </h1>
            </div>
            <p className="text-white/50 text-sm">
              Luxury rides, delivered with care.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.8 }}
          >
            <h4 className="text-white font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2 text-white/50 text-sm">
              <li>
                <a href="#story" className="hover:text-white transition-colors">
                  Story
                </a>
              </li>
              <li>
                <a href="#rates" className="hover:text-white transition-colors">
                  Rates
                </a>
              </li>
              <li>
                <a
                  href="#benefits"
                  className="hover:text-white transition-colors"
                >
                  Benefits
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <h4 className="text-white font-medium mb-4">Contact</h4>
            <ul className="space-y-2 text-white/50 text-sm">
              <li>hello@westerncars.com</li>
              <li>+44 20 1234 5678</li>
              <li>London, UK</li>
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <h4 className="text-white font-medium mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-white/50 hover:text-white transition-colors"
              >
                Instagram
              </a>
              <a
                href="#"
                className="text-white/50 hover:text-white transition-colors"
              >
                Twitter
              </a>
            </div>
          </motion.div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-8 pt-8 border-t border-white/10 text-center text-white/40 text-sm">
          &copy; 2026 Western Cars. All rights reserved.
        </div>
      </motion.footer>
    </div>
  );
}
