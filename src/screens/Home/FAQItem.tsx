interface FAQItemProps {
    question: string;
    answer: string;
}

export function FAQItem({ question, answer }: FAQItemProps) {
    return (
        <div className="w-full bg-neutral-50 rounded-2xl p-4 cursor-pointer">
            <h4 className="text-3 font-medium text-taxable-dark mb-1.5">{question}</h4>
            <p className="text-2 text-taxable-gray font-medium leading-relaxed">{answer}</p>
        </div>
    );
}
