import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Categories
  const categories = [
    { name: 'Components', slug: 'components', description: 'Reusable UI components and widgets' },
    { name: 'APIs', slug: 'apis', description: 'Backend APIs and services' },
    { name: 'Tools', slug: 'tools', description: 'Developer tools and utilities' },
    { name: 'Templates', slug: 'templates', description: 'Project templates and boilerplates' },
    { name: 'Libraries', slug: 'libraries', description: 'Code libraries and packages' },
    { name: 'Scripts', slug: 'scripts', description: 'Automation scripts and helpers' },
    { name: 'Utilities', slug: 'utilities', description: 'Helper functions and utilities' },
    { name: 'Plugins', slug: 'plugins', description: 'Framework plugins and extensions' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }
  console.log(`✅ Created ${categories.length} categories`);

  // Create Technologies
  const techCategories: Record<string, string> = {
    'React': 'frontend',
    'Vue.js': 'frontend',
    'Angular': 'frontend',
    'Svelte': 'frontend',
    'Next.js': 'framework',
    'Nuxt.js': 'framework',
    'NestJS': 'framework',
    'Express.js': 'framework',
    'TypeScript': 'language',
    'JavaScript': 'language',
    'Python': 'language',
    'Go': 'language',
    'Rust': 'language',
    'Java': 'language',
    'C#': 'language',
    'PHP': 'language',
    'Ruby': 'language',
    'Node.js': 'runtime',
    'FastAPI': 'framework',
    'Django': 'framework',
    'Flask': 'framework',
    'Spring Boot': 'framework',
    '.NET': 'framework',
    'Laravel': 'framework',
    'Rails': 'framework',
    'PostgreSQL': 'database',
    'MySQL': 'database',
    'MongoDB': 'database',
    'Redis': 'database',
    'GraphQL': 'api',
    'REST': 'api',
    'Docker': 'devops',
    'Kubernetes': 'devops',
    'AWS': 'cloud',
    'Azure': 'cloud',
    'GCP': 'cloud',
    'Tailwind CSS': 'styling',
    'Bootstrap': 'styling',
    'Material-UI': 'styling',
    'Ant Design': 'styling',
    'Chakra UI': 'styling',
    'styled-components': 'styling',
    'Sass': 'styling',
    'Less': 'styling',
    'Webpack': 'build',
    'Vite': 'build',
    'Rollup': 'build',
    'Jest': 'testing',
    'Vitest': 'testing',
    'Cypress': 'testing',
    'Playwright': 'testing',
    'Prisma': 'orm',
    'Drizzle': 'orm',
    'TypeORM': 'orm',
    'Mongoose': 'orm',
    'Socket.io': 'realtime',
    'WebRTC': 'realtime',
    'WebSockets': 'realtime',
    'OAuth': 'auth',
    'JWT': 'auth',
    'Stripe': 'payment',
    'PayPal': 'payment',
    'Anthropic Claude': 'ai',
    'OpenAI GPT': 'ai',
    'Google Gemini': 'ai',
    'Llama': 'ai',
    'Mistral': 'ai',
  };

  for (const [techName, category] of Object.entries(techCategories)) {
    await prisma.technology.upsert({
      where: { name: techName },
      update: {},
      create: { name: techName, category },
    });
  }
  console.log(`✅ Created ${Object.keys(techCategories).length} technologies`);

  // Create a demo admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@vibecoder.dev' },
    update: {},
    create: {
      email: 'admin@vibecoder.dev',
      username: 'vibecoder_admin',
      passwordHash: '$2b$10$K1wZ/IZZxZQp7LZhQ6XQ4.LR3Jq0K0YqK5J9xW5L3P7nH8uL3Y9G.', // "password123"
      role: 'ADMIN',
      profile: {
        create: {
          displayName: 'VibeCoder Admin',
          bio: 'Platform administrator',
        },
      },
    },
  });
  console.log(`✅ Created admin user: ${adminUser.email}`);

  // Create a demo creator user
  const creatorUser = await prisma.user.upsert({
    where: { email: 'creator@vibecoder.dev' },
    update: {},
    create: {
      email: 'creator@vibecoder.dev',
      username: 'demo_creator',
      passwordHash: '$2b$10$K1wZ/IZZxZQp7LZhQ6XQ4.LR3Jq0K0YqK5J9xW5L3P7nH8uL3Y9G.', // "password123"
      role: 'CREATOR',
      profile: {
        create: {
          displayName: 'Demo Creator',
          bio: 'Creating awesome AI-generated code',
          githubUrl: 'https://github.com/demo',
        },
      },
    },
  });
  console.log(`✅ Created creator user: ${creatorUser.email}`);

  // Create a demo buyer user
  const buyerUser = await prisma.user.upsert({
    where: { email: 'buyer@vibecoder.dev' },
    update: {},
    create: {
      email: 'buyer@vibecoder.dev',
      username: 'demo_buyer',
      passwordHash: '$2b$10$K1wZ/IZZxZQp7LZhQ6XQ4.LR3Jq0K0YqK5J9xW5L3P7nH8uL3Y9G.', // "password123"
      role: 'USER',
      profile: {
        create: {
          displayName: 'Demo Buyer',
          bio: 'Looking for quality code',
        },
      },
    },
  });
  console.log(`✅ Created buyer user: ${buyerUser.email}`);

  console.log('');
  console.log('🎉 Seed complete!');
  console.log('');
  console.log('Demo accounts created:');
  console.log('------------------------');
  console.log('Admin:   admin@vibecoder.dev / password123');
  console.log('Creator: creator@vibecoder.dev / password123');
  console.log('Buyer:   buyer@vibecoder.dev / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
