import { FAQItem } from '@/screens/Home/FAQItem';

const FAQS = [
    {
        question: "Do I need to file taxes if I'm self-employed?",
        answer: "Yes. If you earn income from freelancing, online business, or any self-employment"
    },
    {
        question: "What's my Tax Identification Number (TIN) and how do I get one?",
        answer: "Your TIN is a unique number issued by FIRS. Here's how to register..."
    },
    {
        question: "When is the tax filing deadline for 2026?",
        answer: "Individual tax returns must be filed by March 31, 2026. Here's what you need to know.."
    }
];

export function FAQSection() {
    return (
        <div className="mt-16 pb-20" data-animate>
            <div className="flex items-center justify-between mb-7">
                <div className="flex items-center h-12">
                    <h2 className="text-5 font-medium text-neutral-800 tracking-[-0.02em] font-[family-name:var(--font-merriweather)]">Common Tax Questions</h2>
                </div>
                <button className="h-12 px-5 border border-neutral-200 bg-white text-neutral-800 font-semibold rounded-xl whitespace-nowrap text-2">
                    Talk to an accountant
                </button>
            </div>

            <div className="flex flex-col gap-2">
                {FAQS.map((faq, index) => (
                    <FAQItem key={index} {...faq} />
                ))}
            </div>
        </div>
    );
}
