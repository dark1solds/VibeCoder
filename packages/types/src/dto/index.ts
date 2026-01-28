import {
  ListingStatus,
  PricingType,
  UserRole,
  PurchaseStatus,
  LicenseType,
} from "../entities";

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
