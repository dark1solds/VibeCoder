// --- Entities ---
export const UserRole = {
  USER: "USER",
  CREATOR: "CREATOR",
  ADMIN: "ADMIN",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const ListingStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
  REMOVED: "REMOVED",
} as const;
export type ListingStatus = (typeof ListingStatus)[keyof typeof ListingStatus];

export const PricingType = {
  ONE_TIME: "ONE_TIME",
  SUBSCRIPTION: "SUBSCRIPTION",
  USAGE_BASED: "USAGE_BASED",
  FREE: "FREE",
} as const;
export type PricingType = (typeof PricingType)[keyof typeof PricingType];

export const LicenseType = {
  MIT: "mit",
  APACHE_2_0: "apache_2_0",
  GPL_3_0: "gpl_3_0",
  BSD_3: "bsd_3",
  PROPRIETARY: "proprietary",
} as const;
export type LicenseType = (typeof LicenseType)[keyof typeof LicenseType];

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  profile: UserProfile;
  listings: Listing[];
  purchases: Purchase[];
  reputation: ReputationScore;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
}

export interface ReputationScore {
  rating: number;
  totalReviews: number;
  successfulSales: number;
  responseTime: number; // hours
}

export interface Listing {
  id: string;
  title: string;
  slug: string;
  description: string;
  creator: User;
  category: Category;
  techStack: Technology[];
  aiMetadata: AIMetadata;
  pricing: PricingModel;
  files: CodeFile[];
  demo?: DemoInfo;
  stats: ListingStats;
  reviews: Review[];
  versions: Version[];
  license: License;
  status: ListingStatus;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Technology {
  id: string;
  name: string;
  category: string;
  logoUrl?: string;
}

export interface AIMetadata {
  model: string;
  provider: string;
  promptHistory: PromptEntry[];
  generationDate: Date;
  tokenUsage?: number;
  temperature?: number;
}

export interface PromptEntry {
  prompt: string;
  response: string;
  timestamp: Date;
}

export interface PricingModel {
  type: PricingType;
  price: Money;
  subscription?: SubscriptionDetails;
  usageBased?: UsageBasedDetails;
}

export interface Money {
  amount: number;
  currency: string;
}

export interface SubscriptionDetails {
  interval: "month" | "year";
  trialPeriodDays?: number;
}

export interface UsageBasedDetails {
  unit: string;
  rate: number;
  includedUnits?: number;
}

export interface CodeFile {
  id: string;
  filename: string;
  language: string;
  size: number;
  contentHash: string;
  downloadUrl: string;
  isMain: boolean;
  createdAt: Date;
}

export interface DemoInfo {
  url: string;
  type: "iframe" | "webcontainer" | "screenshot";
  config?: Record<string, unknown>;
}

export interface ListingStats {
  viewsCount: number;
  purchasesCount: number;
  ratingAverage: number;
  ratingCount: number;
  lastViewed?: Date;
}

export interface Review {
  id: string;
  listing: Listing;
  user: User;
  purchase: Purchase;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface Version {
  id: string;
  listing: Listing;
  version: string;
  changelog?: string;
  createdAt: Date;
}

export interface License {
  type: LicenseType;
  customText?: string;
  restrictions?: string[];
}

export interface Purchase {
  id: string;
  buyer: User;
  listing: Listing;
  version: Version;
  amount: Money;
  stripePaymentIntentId?: string;
  status: PurchaseStatus;
  purchasedAt: Date;
}

export const PurchaseStatus = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;
export type PurchaseStatus = (typeof PurchaseStatus)[keyof typeof PurchaseStatus];

// --- DTOs ---

export interface CreateListingInput {
  title: string;
  description: string;
  category: string;
  techStack: string[];
  aiMetadata: {
    model: string;
    provider: string;
    promptHistory: Array<{
      prompt: string;
      response: string;
    }>;
    generationDate: Date;
    tokenUsage?: number;
    temperature?: number;
  };
  pricing: {
    type: PricingType;
    price: {
      amount: number;
      currency: string;
    };
    subscription?: {
      interval: "month" | "year";
      trialPeriodDays?: number;
    };
    usageBased?: {
      unit: string;
      rate: number;
      includedUnits?: number;
    };
  };
  license: {
    type: LicenseType;
    customText?: string;
    restrictions?: string[];
  };
  files: Array<{
    filename: string;
    language: string;
    content: string;
    isMain?: boolean;
  }>;
  demo?: {
    url: string;
    type: "iframe" | "webcontainer" | "screenshot";
    config?: Record<string, unknown>;
  };
}

export interface UpdateListingInput {
  title?: string;
  description?: string;
  category?: string;
  techStack?: string[];
  pricing?: {
    type?: PricingType;
    price?: {
      amount?: number;
      currency?: string;
    };
    subscription?: {
      interval?: "month" | "year";
      trialPeriodDays?: number;
    };
    usageBased?: {
      unit?: string;
      rate?: number;
      includedUnits?: number;
    };
  };
  demo?: {
    url?: string;
    type?: "iframe" | "webcontainer" | "screenshot";
    config?: Record<string, unknown>;
  };
}

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
  displayName?: string;
  bio?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    role: UserRole;
    profile: {
      displayName?: string;
      bio?: string;
      avatarUrl?: string;
    };
  };
  accessToken: string;
  refreshToken: string;
}

export interface ListingFilter {
  category?: string;
  techStack?: string[];
  pricingType?: PricingType;
  creator?: string;
  status?: ListingStatus;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
}

export interface Pagination {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
}

export interface ListingConnection {
  edges: Array<{
    node: any;
    cursor: string;
  }>;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string;
    endCursor?: string;
  };
  totalCount: number;
}

export interface SearchOptions {
  category?: string;
  techStack?: string[];
  pricingType?: PricingType;
  semanticSearch?: boolean;
  limit?: number;
  offset?: number;
}

export interface ExecutionInput {
  fileId?: string;
  input?: Record<string, unknown>;
  timeout?: number;
  memoryLimit?: number;
}

export interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTime: number;
  memoryUsed: number;
  exitCode: number;
  logs: string[];
}

export interface PreviewEnvironment {
  id: string;
  url: string;
  status: "starting" | "ready" | "error";
  expiresAt: Date;
}

// --- API Client ---

export interface APIClient {
  auth: {
    login(email: string, password: string): Promise<any>;
    register(data: any): Promise<any>;
    logout(): Promise<void>;
    refreshToken(): Promise<string>;
  };

  listings: {
    get(id: string): Promise<any>;
    list(filter?: any): Promise<any>;
    create(input: any): Promise<any>;
    update(id: string, input: any): Promise<any>;
    search(query: string, options?: any): Promise<any[]>;
  };

  purchases: {
    create(listingId: string, paymentMethodId: string): Promise<any>;
    list(): Promise<any[]>;
    download(purchaseId: string): Promise<Blob>;
  };

  sandbox: {
    execute(request: any): Promise<any>;
    preview(listingId: string): Promise<any>;
  };
}

export interface SandboxExecutionRequest {
  listingId: string;
  fileId: string;
  runtime: RuntimeEnvironment;
  input?: Record<string, unknown>;
  timeout?: number;
  memoryLimit?: number;
}

export interface SandboxExecutionResponse {
  success: boolean;
  output?: string;
  error?: string;
  executionTime: number;
  memoryUsed: number;
  exitCode: number;
  logs: string[];
}

export interface RuntimeEnvironment {
  language: string;
  version: string;
  dependencies?: string[];
}

export interface PaymentIntent {
  amount: number;
  currency: string;
  customerId: string;
  listingId: string;
  metadata: Record<string, string>;
}

export interface PayoutRequest {
  sellerId: string;
  amount: number;
  currency: string;
  destination: string; // Stripe account ID
}
