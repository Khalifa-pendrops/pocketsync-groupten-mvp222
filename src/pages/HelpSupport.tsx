import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { hasSearchTerm, matchesAnySearchTerm } from '../utils/search';
import './HelpSupport.css';

interface HelpTopic {
  title: string;
  body: string;
}

interface HelpCategory {
  id: string;
  title: string;
  desc: string;
  icon: string;
  topics: HelpTopic[];
}

interface HelpSearchResult {
  id: string;
  type: 'category' | 'topic' | 'faq';
  title: string;
  snippet: string;
  category?: HelpCategory;
  topicIndex?: number;
  faqQuestion?: string;
}

const categories: HelpCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    desc: 'New to PocketSync? Start here.',
    icon: '🚀',
    topics: [
      {
        title: 'Create and verify your account',
        body: 'Sign up with your email, verify via OTP, then complete onboarding with your BVN and phone number to unlock the dashboard.',
      },
      {
        title: 'Link your first bank account',
        body: 'Go to Link Accounts, choose your bank, and sign in through the connection flow. Linked accounts show up on your dashboard.',
      },
      {
        title: 'Explore the dashboard',
        body: 'Your dashboard shows balances, recent transactions, spending overview, and quick actions for statements, bills, and QR payments.',
      },
    ],
  },
  {
    id: 'account-security',
    title: 'Account & Security',
    desc: 'Manage your account and privacy.',
    icon: '🔒',
    topics: [
      {
        title: 'How we protect your data',
        body: 'PocketSync encrypts data in transit and at rest. We do not store your bank login details.',
      },
      {
        title: 'Managing linked accounts',
        body: 'Visit Link Accounts to add institutions or disconnect accounts you no longer use. Disconnected accounts stop syncing new transactions.',
      },
      {
        title: 'Session and sign-out',
        body: 'Use the profile menu to sign out on shared devices. Sessions expire automatically after a period of inactivity.',
      },
    ],
  },
  {
    id: 'payments-transfers',
    title: 'Payments & Transfers',
    desc: 'Sending and receiving money.',
    icon: '💸',
    topics: [
      {
        title: 'Transfers between your accounts',
        body: 'Open Transfer from the sidebar to move money between your linked accounts.',
      },
      {
        title: 'Sending to external banks',
        body: 'Use Transfer, then To another bank, to send money outside PocketSync. Most external transfers settle within a day.',
      },
      {
        title: 'Understanding transaction status',
        body: 'Recent transactions on the dashboard show credits and debits with timestamps. Open Transaction History for filters and full details.',
      },
    ],
  },
  {
    id: 'bills-payments',
    title: 'Bills & Payments',
    desc: 'Paying bills and subscriptions.',
    icon: '📄',
    topics: [
      {
        title: 'Paying utilities and subscriptions',
        body: 'Go to Pay Bills, choose a provider (DSTV, electricity, etc.), select a funding account, and confirm payment.',
      },
      {
        title: 'Airtime and mobile data',
        body: 'Use Pay Bills for telco top-ups. Wallet accounts like Opay or Kuda are often best for smaller, frequent airtime purchases.',
      },
      {
        title: 'QR and in-store payments',
        body: 'Open Scan QR code from the dashboard quick actions. You can try a sample merchant payment from there.',
      },
    ],
  },
];

const faqs = [
  {
    q: 'How do I link my bank account?',
    a: 'Go to Link Accounts from the navigation, select your bank from the list, and follow the secure authentication process. Your credentials are encrypted end-to-end.',
    categoryIds: ['getting-started', 'account-security'],
  },
  {
    q: 'Is my financial data secure?',
    a: 'Yes. Data is encrypted in transit and at rest. We do not store your bank login details.',
    categoryIds: ['account-security'],
  },
  {
    q: 'How long do transactions take?',
    a: 'Transfers between your PocketSync accounts are usually immediate. External bank transfers can take up to a day depending on the bank.',
    categoryIds: ['payments-transfers'],
  },
  {
    q: 'Can I cancel a payment?',
    a: 'Pending payments can be cancelled from the transaction details page. Once a payment has been processed, please contact support for assistance.',
    categoryIds: ['payments-transfers', 'bills-payments'],
  },
  {
    q: 'What fees does PocketSync charge?',
    a: 'Basic account management and transaction history are free. Transfer fees vary by destination bank and amount. See our pricing page for full details.',
    categoryIds: ['payments-transfers', 'bills-payments'],
  },
];

const CONTACT_TOPICS = [
  'General enquiry',
  'Account & security',
  'Payments & transfers',
  'Bills & payments',
  'Technical issue',
] as const;

function buildHelpSearchResults(term: string): HelpSearchResult[] {
  if (!hasSearchTerm(term)) {
    return [];
  }

  const results: HelpSearchResult[] = [];

  categories.forEach((category) => {
    if (matchesAnySearchTerm(term, category.title, category.desc)) {
      results.push({
        id: `category-${category.id}`,
        type: 'category',
        title: category.title,
        snippet: category.desc,
        category,
      });
    }

    category.topics.forEach((topic, topicIndex) => {
      if (matchesAnySearchTerm(term, topic.title, topic.body, category.title)) {
        results.push({
          id: `topic-${category.id}-${topicIndex}`,
          type: 'topic',
          title: topic.title,
          snippet: `${category.title} · ${topic.body}`,
          category,
          topicIndex,
        });
      }
    });
  });

  faqs.forEach((faq) => {
    const relatedCategories = faq.categoryIds
      .map((id) => categories.find((category) => category.id === id)?.title ?? '')
      .join(' ');

    if (matchesAnySearchTerm(term, faq.q, faq.a, relatedCategories)) {
      results.push({
        id: `faq-${faq.q}`,
        type: 'faq',
        title: faq.q,
        snippet: faq.a,
        faqQuestion: faq.q,
      });
    }
  });

  return results;
}

function generateTicketId(): string {
  const suffix = Math.floor(10000 + Math.random() * 90000);
  return `PS-${suffix}`;
}

const HelpSupport = () => {
  const [openFaqQuestion, setOpenFaqQuestion] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | null>(null);
  const [openTopicIndex, setOpenTopicIndex] = useState<number | null>(0);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactStep, setContactStep] = useState<'form' | 'success'>('form');
  const [contactTopic, setContactTopic] = useState<string>(CONTACT_TOPICS[0]);
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const faqSectionRef = useRef<HTMLElement>(null);

  const searching = hasSearchTerm(search);

  const searchResults = useMemo(() => buildHelpSearchResults(search), [search]);

  const filteredCategories = useMemo(() => {
    if (!searching) {
      return categories;
    }

    const matchingIds = new Set(
      searchResults
        .filter((result) => result.type === 'category' || result.type === 'topic')
        .map((result) => result.category?.id)
        .filter((id): id is string => Boolean(id)),
    );

    return categories.filter((category) => matchingIds.has(category.id));
  }, [searching, searchResults]);

  const filteredFaqs = useMemo(() => {
    if (!searching) {
      return faqs;
    }

    return faqs.filter((faq) =>
      searchResults.some((result) => result.type === 'faq' && result.faqQuestion === faq.q),
    );
  }, [searching, searchResults]);

  const openCategory = (category: HelpCategory, topicIndex: number | null = 0) => {
    setSelectedCategory(category);
    setOpenTopicIndex(topicIndex);
  };

  const closeCategory = () => {
    setSelectedCategory(null);
    setOpenTopicIndex(null);
  };

  const openContact = () => {
    setSelectedCategory(null);
    setContactStep('form');
    setContactTopic(CONTACT_TOPICS[0]);
    setContactMessage('');
    setTicketId('');
    setContactOpen(true);
  };

  const closeContact = () => {
    setContactOpen(false);
    setContactSubmitting(false);
  };

  const handleSearchResultClick = (result: HelpSearchResult) => {
    if (result.type === 'category' && result.category) {
      openCategory(result.category, 0);
      return;
    }

    if (result.type === 'topic' && result.category) {
      openCategory(result.category, result.topicIndex ?? 0);
      return;
    }

    if (result.type === 'faq' && result.faqQuestion) {
      setOpenFaqQuestion(result.faqQuestion);
      faqSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleContactSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!contactMessage.trim()) {
      return;
    }

    setContactSubmitting(true);
    window.setTimeout(() => {
      setTicketId(generateTicketId());
      setContactSubmitting(false);
      setContactStep('success');
    }, 1100);
  };

  useEffect(() => {
    if (!selectedCategory && !contactOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (contactOpen) {
          closeContact();
        } else {
          closeCategory();
        }
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedCategory, contactOpen]);

  return (
    <div className="help-support-container">
      <header className="help-support-header">
        <h1>Help and support</h1>
        <p>FAQs and support.</p>
      </header>

      <form
        className="help-search"
        role="search"
        onSubmit={(event) => event.preventDefault()}
      >
        <span className="help-search-icon" aria-hidden="true">
          🔍
        </span>
        <input
          type="search"
          placeholder="Search help..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search help topics, categories, and FAQs"
        />
        {searching && (
          <button
            type="button"
            className="help-search-clear"
            onClick={() => setSearch('')}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </form>

      {searching && (
        <section className="help-search-results" aria-live="polite">
          <h2>
            Search results
            <span className="help-search-count">({searchResults.length})</span>
          </h2>
          {searchResults.length === 0 ? (
            <p className="help-empty-state">
              No results for &ldquo;{search.trim()}&rdquo;.
            </p>
          ) : (
            <div className="help-search-results-list">
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  className="help-search-result-item"
                  onClick={() => handleSearchResultClick(result)}
                >
                  <span className="help-search-result-type">
                    {result.type === 'category'
                      ? 'Category'
                      : result.type === 'topic'
                        ? 'Article'
                        : 'FAQ'}
                  </span>
                  <span className="help-search-result-title">{result.title}</span>
                  <span className="help-search-result-snippet">{result.snippet}</span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      <div className="help-category-grid">
        {filteredCategories.length === 0 && searching ? (
          <p className="help-empty-state help-empty-state--grid">
            No categories match your search.
          </p>
        ) : (
          filteredCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              className="help-category-card"
              onClick={() => openCategory(category)}
            >
              <div className="help-cat-icon">{category.icon}</div>
              <p className="help-cat-title">{category.title}</p>
              <p className="help-cat-desc">{category.desc}</p>
            </button>
          ))
        )}
      </div>

      <section className="faq-section" ref={faqSectionRef}>
        <h2>Frequently Asked Questions</h2>

        {searching && filteredFaqs.length === 0 && (
          <p className="help-empty-state">No FAQs match your search.</p>
        )}
        {filteredFaqs.map((faq) => (
          <div
            key={faq.q}
            className={`faq-item${openFaqQuestion === faq.q ? ' open' : ''}`}
          >
            <button
              className="faq-question"
              type="button"
              onClick={() =>
                setOpenFaqQuestion(openFaqQuestion === faq.q ? null : faq.q)
              }
            >
              {faq.q}
              <span className="faq-chevron">▼</span>
            </button>
            {openFaqQuestion === faq.q && <div className="faq-answer">{faq.a}</div>}
          </div>
        ))}
      </section>

      <section className="contact-section">
        <h2>Still need help?</h2>
        <p>Reach out if you still need help.</p>
        <button type="button" className="contact-btn" onClick={openContact}>
          Contact Support
        </button>
      </section>

      {selectedCategory && (
        <div className="help-modal-backdrop" onClick={closeCategory}>
          <div
            className="help-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-category-title"
          >
            <div className="help-modal-header">
              <span className="help-modal-icon" aria-hidden="true">
                {selectedCategory.icon}
              </span>
              <div>
                <h3 id="help-category-title">{selectedCategory.title}</h3>
                <p className="help-modal-sub">{selectedCategory.desc}</p>
              </div>
            </div>

            <div className="help-modal-body">
              {selectedCategory.topics.map((topic, index) => (
                <div
                  key={topic.title}
                  className={`help-topic-item${openTopicIndex === index ? ' open' : ''}`}
                >
                  <button
                    type="button"
                    className="help-topic-question"
                    onClick={() => setOpenTopicIndex(openTopicIndex === index ? null : index)}
                  >
                    {topic.title}
                    <span className="faq-chevron">▼</span>
                  </button>
                  {openTopicIndex === index && (
                    <div className="help-topic-answer">{topic.body}</div>
                  )}
                </div>
              ))}
            </div>

            <div className="help-modal-actions">
              <button
                type="button"
                className="help-modal-btn help-modal-btn--ghost"
                onClick={closeCategory}
              >
                Close
              </button>
              <button
                type="button"
                className="help-modal-btn help-modal-btn--primary"
                onClick={openContact}
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      )}

      {contactOpen && (
        <div className="help-modal-backdrop" onClick={closeContact}>
          <div
            className="help-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-support-title"
          >
            {contactStep === 'form' ? (
              <form onSubmit={handleContactSubmit}>
                <h3 id="contact-support-title">Contact Support</h3>
                <p className="help-modal-sub">
                  Send us a note and we&apos;ll reply by email.
                </p>

                <label className="help-form-field">
                  <span>Topic</span>
                  <select
                    value={contactTopic}
                    onChange={(event) => setContactTopic(event.target.value)}
                  >
                    {CONTACT_TOPICS.map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="help-form-field">
                  <span>Message</span>
                  <textarea
                    value={contactMessage}
                    onChange={(event) => setContactMessage(event.target.value)}
                    placeholder="Describe your issue or question..."
                    rows={5}
                    required
                  />
                </label>

                <div className="help-modal-actions">
                  <button
                    type="button"
                    className="help-modal-btn help-modal-btn--ghost"
                    onClick={closeContact}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="help-modal-btn help-modal-btn--primary"
                    disabled={contactSubmitting || !contactMessage.trim()}
                  >
                    {contactSubmitting ? 'Sending…' : 'Send message'}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="help-contact-success">
                  <div className="help-contact-success-icon" aria-hidden="true">
                    ✓
                  </div>
                  <h3>Message sent</h3>
                  <p className="help-modal-sub">
                    Thanks. We&apos;ll get back to you by email.
                  </p>
                  <p className="help-ticket-id">
                    Ticket reference: <strong>{ticketId}</strong>
                  </p>
                </div>
                <div className="help-modal-actions">
                  <button
                    type="button"
                    className="help-modal-btn help-modal-btn--primary"
                    onClick={closeContact}
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpSupport;