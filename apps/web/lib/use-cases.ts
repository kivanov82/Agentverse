export type UseCaseId = 'seo' | 'landing-page' | 'app-prototype' | 'ecommerce' | 'solidity-audit';

export interface QuestionStep {
  id: string;
  question: string;
  type: 'text' | 'textarea' | 'url' | 'file-upload' | 'checkbox-group' | 'radio' | 'audit-depth';
  placeholder?: string;
  options?: { label: string; value: string }[];
  /** For audit-depth: bundle presets mapping a choice to a list of skill folder ids. */
  bundles?: { id: string; label: string; description: string; skills: string[] }[];
  /** For audit-depth: which agent's skills to fetch prices from (via GET /api/agents/:id/skills). */
  skillsAgentId?: string;
  required: boolean;
}

/** Common final step — asked after use-case-specific questions */
export const GITHUB_STEP: QuestionStep = {
  id: 'github',
  question: 'Where should we save your project?',
  type: 'radio',
  options: [
    { label: 'Create a repository on my GitHub', value: 'own' },
    { label: "I don't have GitHub — create one for me", value: 'shipwithai' },
  ],
  required: true,
};

export interface UseCaseConfig {
  id: UseCaseId;
  label: string;
  tagline: string;
  icon: string; // Lucide icon name
  agents: string[];
  questions: QuestionStep[];
  pmBriefTemplate: (answers: Record<string, string | string[] | null>) => string;
  /** When true, the wizard skips the GITHUB_STEP — use for flows that read an existing repo instead of creating one. */
  skipGithubStep?: boolean;
}

export const USE_CASES: Record<UseCaseId, UseCaseConfig> = {
  seo: {
    id: 'seo',
    label: 'SEO Optimization',
    tagline: 'Help my site get found on Google',
    icon: 'Search',
    agents: ['pm', 'marketing', 'tech-writer', 'ux-analyst', 'seo-specialist'],
    questions: [
      {
        id: 'url',
        question: "What's your website URL?",
        type: 'url',
        placeholder: 'https://mysite.com',
        required: true,
      },
      {
        id: 'business',
        question: 'In a few sentences, what does your business do?',
        type: 'textarea',
        placeholder: 'We sell handmade candles online...',
        required: true,
      },
      {
        id: 'competitors',
        question: 'Who are your main competitors? (optional)',
        type: 'textarea',
        placeholder: 'e.g. candleco.com, scentify.io',
        required: false,
      },
    ],
    pmBriefTemplate: (a) =>
      `SEO Optimization project.\n\nWebsite: ${a.url}\nBusiness: ${a.business}${a.competitors ? `\nCompetitors: ${a.competitors}` : ''}\n\nGoal: Audit the site, identify SEO issues, research keywords, analyze competitors, and produce an actionable optimization plan with content recommendations.`,
  },

  'landing-page': {
    id: 'landing-page',
    label: 'Business Landing Page',
    tagline: 'Launch my business online',
    icon: 'Globe',
    agents: ['pm', 'ui-designer', 'ui-developer', 'backend-developer', 'marketing', 'seo-specialist', 'payment-integration', 'deployer', 'code-reviewer'],
    questions: [
      {
        id: 'business',
        question: "What's your business about?",
        type: 'textarea',
        placeholder: 'Describe your business, product, or service...',
        required: true,
      },
      {
        id: 'design',
        question: 'Do you have a design or reference? (optional)',
        type: 'file-upload',
        placeholder: 'Upload a screenshot, Figma export, or reference image',
        required: false,
      },
      {
        id: 'integrations',
        question: 'What tools do you need on your site?',
        type: 'checkbox-group',
        options: [
          { label: 'Stripe Payments', value: 'stripe' },
          { label: 'Google Analytics', value: 'ga' },
          { label: 'Hotjar Heatmaps', value: 'hotjar' },
          { label: 'WhatsApp Business', value: 'whatsapp' },
          { label: 'Social Media Links', value: 'social' },
          { label: 'Affiliate Codes', value: 'affiliate' },
        ],
        required: false,
      },
    ],
    pmBriefTemplate: (a) => {
      const integrations = Array.isArray(a.integrations) ? a.integrations.join(', ') : 'none selected';
      return `Business Landing Page project.\n\nBusiness: ${a.business}\nDesign reference: ${a.design ? 'Provided by user' : 'None — design from scratch'}\nIntegrations: ${integrations}\n\nGoal: Design and build a professional landing page with the requested integrations, optimized for conversions and SEO.`;
    },
  },

  'app-prototype': {
    id: 'app-prototype',
    label: 'App Prototype',
    tagline: 'Show me what my app idea looks like',
    icon: 'Smartphone',
    agents: ['pm', 'ux-analyst', 'ui-designer', 'ui-developer', 'mobile-developer', 'deployer', 'code-reviewer'],
    questions: [
      {
        id: 'idea',
        question: 'Describe your app idea',
        type: 'textarea',
        placeholder: 'An app that helps pet owners find nearby vets...',
        required: true,
      },
      {
        id: 'audience',
        question: 'Who is it for?',
        type: 'text',
        placeholder: 'e.g. busy parents, small business owners, students',
        required: true,
      },
      {
        id: 'features',
        question: 'What are the 3 main things users can do?',
        type: 'textarea',
        placeholder: '1. Browse nearby services\n2. Book appointments\n3. Leave reviews',
        required: true,
      },
    ],
    pmBriefTemplate: (a) =>
      `App Prototype project.\n\nIdea: ${a.idea}\nTarget audience: ${a.audience}\nCore features:\n${a.features}\n\nGoal: Create an interactive, mobile-first web prototype with 3-5 core screens and realistic data. Must be shareable via link for user testing.`,
  },

  ecommerce: {
    id: 'ecommerce',
    label: 'E-commerce Store',
    tagline: 'Set up my online store',
    icon: 'ShoppingCart',
    agents: ['pm', 'ui-designer', 'ui-developer', 'backend-developer', 'marketing', 'e-commerce-specialist', 'payment-integration', 'seo-specialist', 'deployer', 'code-reviewer'],
    questions: [
      {
        id: 'products',
        question: 'What do you sell?',
        type: 'textarea',
        placeholder: 'Handmade jewelry, vintage clothing, digital art...',
        required: true,
      },
      {
        id: 'count',
        question: 'How many products do you have?',
        type: 'text',
        placeholder: 'e.g. 10, 50, 200+',
        required: true,
      },
      {
        id: 'photos',
        question: 'Do you have product photos?',
        type: 'radio',
        options: [
          { label: 'Yes, I have photos ready', value: 'yes' },
          { label: 'Some, but not all', value: 'some' },
          { label: 'No, I need help with that', value: 'no' },
        ],
        required: true,
      },
    ],
    pmBriefTemplate: (a) =>
      `E-commerce Store Setup project.\n\nProducts: ${a.products}\nCatalog size: ${a.count} products\nProduct photos: ${a.photos}\n\nGoal: Set up a complete online store with product catalog, payment processing, shipping configuration, and SEO optimization. Ready to accept orders.`,
  },

  'solidity-audit': {
    id: 'solidity-audit',
    label: 'Solidity Audit',
    tagline: 'Audit my smart contracts before launch',
    icon: 'ShieldCheck',
    agents: ['pm', 'solidity-auditor'],
    skipGithubStep: true,
    questions: [
      {
        id: 'repoUrl',
        question: "What's the GitHub repo with your contracts?",
        type: 'url',
        placeholder: 'https://github.com/your-org/your-contracts',
        required: true,
      },
      {
        id: 'scope',
        question: 'Anything specific you want us to focus on? (optional)',
        type: 'textarea',
        placeholder: 'e.g. the staking contract, the upgrade path, access control...',
        required: false,
      },
      {
        id: 'brandUrl',
        question: 'Your website URL — so we can match your brand on the report. (optional)',
        type: 'url',
        placeholder: 'https://your-project.com',
        required: false,
      },
      {
        id: 'selectedAuditSkills',
        question: 'How deep should we audit?',
        type: 'audit-depth',
        required: true,
        skillsAgentId: 'solidity-auditor',
        bundles: [
          {
            id: 'feynman-only',
            label: 'Quick pass',
            description: 'Feynman — business-logic sweep',
            skills: ['feynman-auditor'],
          },
          {
            id: 'feynman-nemesis',
            label: 'Standard',
            description: 'Feynman + Nemesis adversarial loop',
            skills: ['feynman-auditor', 'nemesis-auditor'],
          },
          {
            id: 'full',
            label: 'Full audit',
            description: 'All three: Feynman, Nemesis, State-Inconsistency',
            skills: ['feynman-auditor', 'nemesis-auditor', 'state-inconsistency-auditor'],
          },
        ],
      },
    ],
    pmBriefTemplate: (a) => {
      const scope = a.scope ? `\nFocus areas: ${a.scope}` : '\nFocus areas: full contract surface';
      const brand = a.brandUrl ? `\nBrand URL (for report styling): ${a.brandUrl}` : '';
      const selected = Array.isArray(a.selectedAuditSkills) ? a.selectedAuditSkills : [];
      const skillLabels: Record<string, string> = {
        'feynman-auditor': 'Feynman',
        'nemesis-auditor': 'Nemesis',
        'state-inconsistency-auditor': 'State-Inconsistency',
      };
      const methodologyList = selected.map((id) => skillLabels[id] ?? id).join(' → ') || 'Feynman → Nemesis → State-Inconsistency';
      return `Solidity Security Audit.

Target repo: ${a.repoUrl}${scope}${brand}
Selected methodologies: ${methodologyList}

This is a solo-specialist engagement: you (PM) and the Solidity Auditor only — no other agents. Hand off to solidity-auditor immediately with the target repo URL and scope. The auditor runs the selected methodologies (${methodologyList}) and returns a structured audit report with severity-rated findings and a Go/No-Go recommendation.`;
    },
  },

};

export const USE_CASE_LIST = Object.values(USE_CASES);
