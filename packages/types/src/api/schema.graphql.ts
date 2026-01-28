export const schema = `
  type User {
    id: ID!
    email: String!
    username: String!
    role: UserRole!
    profile: UserProfile!
    listings: [Listing!]!
    purchases: [Purchase!]!
    reputation: ReputationScore!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type UserProfile {
    displayName: String
    bio: String
    avatarUrl: String
    githubUrl: String
    twitterUrl: String
    websiteUrl: String
  }

  type ReputationScore {
    rating: Float!
    totalReviews: Int!
    successfulSales: Int!
    responseTime: Int! # in hours
  }

  enum UserRole {
    USER
    CREATOR
    ADMIN
  }

  type Listing {
    id: ID!
    title: String!
    slug: String!
    description: String!
    creator: User!
    category: Category!
    techStack: [Technology!]!
    aiMetadata: AIMetadata!
    pricing: PricingModel!
    files: [CodeFile!]!
    demo: DemoInfo
    stats: ListingStats!
    reviews: [Review!]!
    versions: [Version!]!
    license: License!
    status: ListingStatus!
    createdAt: DateTime!
    updatedAt: DateTime!
    publishedAt: DateTime
  }

  type Category {
    id: ID!
    name: String!
    slug: String!
    description: String
  }

  type Technology {
    id: ID!
    name: String!
    category: String!
    logoUrl: String
  }

  type AIMetadata {
    model: String!
    provider: String!
    promptHistory: [PromptEntry!]!
    generationDate: DateTime!
    tokenUsage: Int
    temperature: Float
  }

  type PromptEntry {
    prompt: String!
    response: String!
    timestamp: DateTime!
  }

  type PricingModel {
    type: PricingType!
    price: Money!
    subscription: SubscriptionDetails
    usageBased: UsageBasedDetails
  }

  type Money {
    amount: Int!
    currency: String!
  }

  type SubscriptionDetails {
    interval: SubscriptionInterval!
    trialPeriodDays: Int
  }

  enum SubscriptionInterval {
    MONTH
    YEAR
  }

  type UsageBasedDetails {
    unit: String!
    rate: Float!
    includedUnits: Int
  }

  type CodeFile {
    id: ID!
    filename: String!
    language: String!
    size: Int!
    contentHash: String!
    downloadUrl: String!
    isMain: Boolean!
    createdAt: DateTime!
  }

  type DemoInfo {
    url: String!
    type: DemoType!
    config: JSON
  }

  enum DemoType {
    IFRAME
    WEBCONTAINER
    SCREENSHOT
  }

  type ListingStats {
    viewsCount: Int!
    purchasesCount: Int!
    ratingAverage: Float!
    ratingCount: Int!
    lastViewed: DateTime
  }

  type Review {
    id: ID!
    listing: Listing!
    user: User!
    purchase: Purchase!
    rating: Int!
    comment: String
    createdAt: DateTime!
  }

  type Version {
    id: ID!
    listing: Listing!
    version: String!
    changelog: String
    createdAt: DateTime!
  }

  type License {
    type: LicenseType!
    customText: String
    restrictions: [String!]
  }

  enum LicenseType {
    MIT
    APACHE_2_0
    GPL_3_0
    BSD_3
    PROPRIETARY
  }

  type Purchase {
    id: ID!
    buyer: User!
    listing: Listing!
    version: Version!
    amount: Money!
    stripePaymentIntentId: String
    status: PurchaseStatus!
    purchasedAt: DateTime!
  }

  enum PurchaseStatus {
    PENDING
    COMPLETED
    FAILED
    REFUNDED
  }

  enum ListingStatus {
    DRAFT
    PUBLISHED
    ARCHIVED
    REMOVED
  }

  enum PricingType {
    ONE_TIME
    SUBSCRIPTION
    USAGE_BASED
    FREE
  }

  # Custom scalar types
  scalar DateTime
  scalar JSON

  type Query {
    listing(id: ID!): Listing
    listings(filter: ListingFilter, pagination: Pagination): ListingConnection!
    searchListings(query: String!, semanticSearch: Boolean): [Listing!]!
    user(id: ID!): User
    me: User
    myPurchases: [Purchase!]!
    myListings: [Listing!]!
  }

  type Mutation {
    # Auth
    login(email: String!, password: String!): AuthResponse!
    register(input: RegisterInput!): AuthResponse!
    logout: Boolean!
    refreshToken(refreshToken: String!): AuthResponse!

    # Listings
    createListing(input: CreateListingInput!): Listing!
    updateListing(id: ID!, input: UpdateListingInput!): Listing!
    deleteListing(id: ID!): Boolean!
    publishListing(id: ID!): Listing!

    # Purchases
    purchaseListing(listingId: ID!, paymentMethodId: String!): Purchase!
    createRefund(purchaseId: String!, reason: String!): Boolean!

    # Reviews
    createReview(listingId: ID!, rating: Int!, comment: String): Review!

    # Sandbox
    executeSandbox(listingId: ID!, input: ExecutionInput!): ExecutionResult!
  }

  type AuthResponse {
    user: User!
    accessToken: String!
    refreshToken: String!
  }

  input ListingFilter {
    category: String
    techStack: [String!]
    pricingType: PricingType
    creator: String
    status: ListingStatus
    minPrice: Int
    maxPrice: Int
    rating: Int
  }

  input Pagination {
    first: Int
    after: String
    last: Int
    before: String
  }

  input CreateListingInput {
    title: String!
    description: String!
    category: String!
    techStack: [String!]!
    aiMetadata: AIMetadataInput!
    pricing: PricingModelInput!
    license: LicenseInput!
    files: [CodeFileInput!]!
    demo: DemoInfoInput
  }

  input UpdateListingInput {
    title: String
    description: String
    category: String
    techStack: [String!]
    pricing: PricingModelInput
    demo: DemoInfoInput
  }

  input AIMetadataInput {
    model: String!
    provider: String!
    promptHistory: [PromptEntryInput!]!
    generationDate: DateTime!
    tokenUsage: Int
    temperature: Float
  }

  input PromptEntryInput {
    prompt: String!
    response: String!
    timestamp: DateTime!
  }

  input PricingModelInput {
    type: PricingType!
    price: MoneyInput!
    subscription: SubscriptionDetailsInput
    usageBased: UsageBasedDetailsInput
  }

  input MoneyInput {
    amount: Int!
    currency: String!
  }

  input SubscriptionDetailsInput {
    interval: SubscriptionInterval!
    trialPeriodDays: Int
  }

  input UsageBasedDetailsInput {
    unit: String!
    rate: Float!
    includedUnits: Int
  }

  input LicenseInput {
    type: LicenseType!
    customText: String
    restrictions: [String!]
  }

  input CodeFileInput {
    filename: String!
    language: String!
    content: String!
    isMain: Boolean
  }

  input DemoInfoInput {
    url: String!
    type: DemoType!
    config: JSON
  }

  input RegisterInput {
    email: String!
    username: String!
    password: String!
    displayName: String
    bio: String
  }

  input ExecutionInput {
    fileId: String
    input: JSON
    timeout: Int
    memoryLimit: Int
  }

  type ExecutionResult {
    success: Boolean!
    output: String
    error: String
    executionTime: Int!
    memoryUsed: Int!
    exitCode: Int!
    logs: [String!]!
  }

  type ListingConnection {
    edges: [ListingEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type ListingEdge {
    node: Listing!
    cursor: String!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }
`;
