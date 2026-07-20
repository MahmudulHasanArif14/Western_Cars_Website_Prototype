import { motion } from "framer-motion";

interface RatesProps {
  setBookingOpen: (value: boolean) => void;
}

export default function Rates({ setBookingOpen }: RatesProps) {
  const plans = [
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
  ];

  return (
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
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8"
            >
              <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
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
  );
}
