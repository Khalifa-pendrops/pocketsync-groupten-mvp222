import { useState } from 'react';
import './HelpSupport.css';

const categories = [
  { title: 'Getting Started', desc: 'New to PocketSync? Start here.', icon: '🚀' },
  { title: 'Account & Security', desc: 'Manage your account and privacy.', icon: '🔒' },
  { title: 'Payments & Transfers', desc: 'Sending and receiving money.', icon: '💸' },
  { title: 'Bills & Payments', desc: 'Paying bills and subscriptions.', icon: '📄' },
];

const faqs = [
  { q: 'How do I link my bank account?', a: 'Go to Link Accounts from the navigation, select your bank from the list, and follow the secure authentication process. Your credentials are encrypted end-to-end.' },
  { q: 'Is my financial data secure?', a: 'Yes. PocketSync uses 256-bit encryption for all data in transit and at rest. We never store your bank credentials, and all connections use OAuth 2.0 protocols.' },
  { q: 'How long do transactions take?', a: 'Transfers between PocketSync users are instant. External bank transfers typically take 1-24 hours depending on the recipient bank and transaction time.' },
  { q: 'Can I cancel a payment?', a: 'Pending payments can be cancelled from the transaction details page. Once a payment has been processed, please contact support for assistance.' },
  { q: 'What fees does PocketSync charge?', a: 'Basic account management and transaction history are free. Transfer fees vary by destination bank and amount. See our pricing page for full details.' },
];

const HelpSupport = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <div className="help-support-container">
      <header className="help-support-header">
        <h1>Help and support</h1>
        <p>Get assistance and view FAQs.</p>
      </header>

      <div className="help-search">
        <span className="help-search-icon">🔍</span>
        <input type="text" placeholder="Search for help..." />
      </div>

      <div className="help-category-grid">
        {categories.map((cat) => (
          <div key={cat.title} className="help-category-card">
            <div className="help-cat-icon">{cat.icon}</div>
            <p className="help-cat-title">{cat.title}</p>
            <p className="help-cat-desc">{cat.desc}</p>
          </div>
        ))}
      </div>

      <section className="faq-section">
        <h2>Frequently Asked Questions</h2>
        {faqs.map((faq, i) => (
          <div key={i} className={`faq-item${openIndex === i ? ' open' : ''}`}>
            <button className="faq-question" onClick={() => toggleFaq(i)}>
              {faq.q}
              <span className="faq-chevron">▼</span>
            </button>
            {openIndex === i && (
              <div className="faq-answer">{faq.a}</div>
            )}
          </div>
        ))}
      </section>

      <section className="contact-section">
        <h2>Still need help?</h2>
        <p>Our support team is available 24/7 to assist you with any questions or issues.</p>
        <button className="contact-btn">Contact Support</button>
      </section>
    </div>
  );
};

export default HelpSupport;
