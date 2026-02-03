/**
 * Feature Detection Rules - Capability detection rules based on file patterns and keywords
 */

export const FEATURE_RULES = [
  // ───────────── DevOps / Infra ─────────────
  {
    capability: 'Containerization',
    signals: { files: ['Dockerfile', 'docker-compose.yml'] }
  },
  {
    capability: 'CI/CD Automation',
    signals: {
      paths: ['.github/workflows/', '.gitlab-ci.yml', '.circleci/']
    }
  },
  {
    capability: 'Infrastructure as Code',
    signals: { extensions: ['.tf'], files: ['kustomization.yaml'] }
  },
  {
    capability: 'Kubernetes Orchestration',
    signals: { keywords: ['kubernetes', 'helm', 'k8s'] }
  },

  // ───────────── Frontend ─────────────
  {
    capability: 'Frontend Application',
    signals: { files: ['package.json', 'vite.config.js', 'next.config.js'] }
  },
  {
    capability: 'Frontend Performance Optimization',
    signals: { keywords: ['react-window', 'react-virtualized', 'lazyload'] }
  },
  {
    capability: 'Static Site Generation',
    signals: { keywords: ['gatsby', 'next export', 'astro'] }
  },

  // ───────────── Backend / Systems ─────────────
  {
    capability: 'Backend API Development',
    signals: { files: ['requirements.txt', 'pom.xml', 'go.mod'] }
  },
  {
    capability: 'Authentication & Authorization',
    signals: { keywords: ['jwt', 'oauth', 'passport', 'auth'] }
  },
  {
    capability: 'Caching & Performance',
    signals: { keywords: ['redis', 'memcached', 'cache'] }
  },
  {
    capability: 'Asynchronous Processing',
    signals: { keywords: ['queue', 'rabbitmq', 'kafka', 'bull'] }
  },

  // ───────────── Databases ─────────────
  {
    capability: 'Relational Database Usage',
    signals: { keywords: ['postgres', 'mysql', 'sqlite'] }
  },
  {
    capability: 'NoSQL Database Usage',
    signals: { keywords: ['mongodb', 'cassandra', 'dynamodb'] }
  },

  // ───────────── ML / AI ─────────────
  {
    capability: 'ML Model Training',
    signals: { files: ['training.py'], keywords: ['scikit-learn', 'xgboost'] }
  },
  {
    capability: 'Deep Learning',
    signals: { keywords: ['torch', 'tensorflow', 'keras'] }
  },
  {
    capability: 'NLP / LLM Systems',
    signals: { keywords: ['transformers', 'langchain', 'openai', 'llama'] }
  },
  {
    capability: 'Data Analysis & Visualization',
    signals: { keywords: ['pandas', 'matplotlib', 'seaborn'] }
  },

  // ───────────── Media / Streaming ─────────────
  {
    capability: 'Video Streaming',
    signals: { keywords: ['ffmpeg', 'webrtc', 'hls', 'm3u8'] }
  },
  {
    capability: 'Real-time Communication',
    signals: { keywords: ['socket.io', 'websocket', 'rtc'] }
  },

  // ───────────── Testing / Quality ─────────────
  {
    capability: 'Automated Testing',
    signals: { keywords: ['jest', 'pytest', 'mocha', 'cypress'] }
  },
  {
    capability: 'Code Quality & Linting',
    signals: { keywords: ['eslint', 'prettier', 'flake8'] }
  }
];
