import { motion } from "framer-motion";
import FAQItem from "../../ui/FAQItem";
import type { FAQ } from "../../data/faqData";

interface FAQProps {
  faqs: FAQ[];
  faqOpen: number | null;
  setFaqOpen: (index: number | null) => void;
}

export default function FAQ({ faqs, faqOpen, setFaqOpen }: FAQProps) {
  const toggleFAQ = (index: number) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  return (
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
          {faqs.map((faq: FAQ, index: number) => (
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
  );
}
