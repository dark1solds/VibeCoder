export enum UserRole {
  USER = "USER",
  CREATOR = "CREATOR",
  ADMIN = "ADMIN",
}

export enum ListingStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
  REMOVED = "REMOVED",
}

export enum PricingType {
  ONE_TIME = "ONE_TIME",
  SUBSCRIPTION = "SUBSCRIPTION",
  USAGE_BASED = "USAGE_BASED",
  FREE = "FREE",
}

export enum LicenseType {
  MIT = "mit",
  APACHE_2_0 = "apache_2_0",
  GPL_3_0 = "gpl_3_0",
  BSD_3 = "bsd_3",
  PROPRIETARY = "proprietary",
}

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

export enum PurchaseStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
}
