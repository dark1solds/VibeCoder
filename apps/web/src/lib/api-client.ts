const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const GRAPHQL_URL = `${API_URL}/graphql`;

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string; extensions?: any }>;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async graphql<T>(query: string, variables?: Record<string, any>): Promise<T> {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ query, variables }),
    });

    const result: GraphQLResponse<T> = await response.json();

    if (result.errors && result.errors.length > 0) {
      throw new Error(result.errors[0].message);
    }

    if (!result.data) {
      throw new Error('No data returned from API');
    }

    return result.data;
  }

  async rest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  async uploadFile(endpoint: string, file: File, additionalData?: Record<string, any>) {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const headers: HeadersInit = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();

// GraphQL Queries
export const queries = {
  // Auth
  me: `
    query Me {
      me {
        id
        email
        username
        role
        profile {
          displayName
          avatarUrl
          bio
          githubUrl
          twitterUrl
          websiteUrl
        }
      }
    }
  `,

  // Listings
  getListings: `
    query GetListings($filter: ListingFilter, $pagination: Pagination) {
      getListings(filter: $filter, pagination: $pagination) {
        edges {
          node {
            id
            title
            slug
            description
            status
            creator {
              id
              username
              profile {
                displayName
                avatarUrl
              }
            }
            category {
              id
              name
              slug
            }
            techStack {
              technology {
                name
              }
            }
            pricing {
              type
              price {
                amount
                currency
              }
            }
            stats {
              viewsCount
              purchasesCount
              ratingAverage
              ratingCount
            }
            createdAt
          }
          cursor
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          endCursor
        }
        totalCount
      }
    }
  `,

  getListing: `
    query GetListing($id: ID!) {
      getListing(id: $id) {
        id
        title
        slug
        description
        status
        creator {
          id
          username
          profile {
            displayName
            avatarUrl
            bio
          }
        }
        category {
          id
          name
          slug
        }
        techStack {
          technology {
            name
          }
        }
        aiMetadata {
          modelName
          provider
          generationDate
        }
        pricing {
          type
          price {
            amount
            currency
          }
        }
        license {
          type
          customText
          restrictions
        }
        stats {
          viewsCount
          purchasesCount
          ratingAverage
          ratingCount
        }
        files {
          id
          filename
          language
          sizeBytes
          isMain
          content
        }
        createdAt
        publishedAt
      }
    }
  `,

  searchListings: `
    query SearchListings($query: String!, $semanticSearch: Boolean) {
      searchListings(query: $query, semanticSearch: $semanticSearch) {
        id
        title
        slug
        description
        creator {
          username
        }
        pricing {
          price {
            amount
            currency
          }
        }
        stats {
          ratingAverage
          purchasesCount
        }
      }
    }
  `,

  myListings: `
    query MyListings {
      myListings {
        id
        title
        slug
        status
        pricing {
          price {
            amount
            currency
          }
        }
        stats {
          viewsCount
          purchasesCount
          ratingAverage
        }
        createdAt
      }
    }
  `,

  // Purchases
  myPurchases: `
    query MyPurchases {
      myPurchases {
        id
        amountCents
        currency
        status
        purchasedAt
        listing {
          id
          title
          slug
          creatorUsername
        }
      }
    }
  `,

  hasPurchased: `
    query HasPurchased($listingId: ID!) {
      hasPurchased(listingId: $listingId)
    }
  `,

  // Reviews
  listingReviews: `
    query ListingReviews($listingId: ID!, $limit: Int, $offset: Int) {
      listingReviews(listingId: $listingId, limit: $limit, offset: $offset) {
        id
        rating
        comment
        createdAt
        user {
          id
          username
        }
      }
    }
  `,

  // Search
  search: `
    query Search($input: SearchInput!) {
      search(input: $input) {
        id
        title
        slug
        description
        priceCents
        currency
        ratingAverage
        purchasesCount
        creatorUsername
        category
        technologies
        relevanceScore
      }
    }
  `,
};

// GraphQL Mutations
export const mutations = {
  // Auth
  login: `
    mutation Login($loginInput: LoginInput!) {
      login(loginInput: $loginInput) {
        accessToken
        refreshToken
        user {
          id
          email
          username
          role
          profile {
            displayName
            avatarUrl
          }
        }
      }
    }
  `,

  register: `
    mutation Register($input: RegisterInput!) {
      register(input: $input) {
        accessToken
        refreshToken
        user {
          id
          email
          username
          role
        }
      }
    }
  `,

  logout: `
    mutation Logout {
      logout
    }
  `,

  // Listings
  createListing: `
    mutation CreateListing($input: CreateListingInput!) {
      createListing(input: $input) {
        id
        title
        slug
        status
      }
    }
  `,

  updateListing: `
    mutation UpdateListing($id: ID!, $input: UpdateListingInput!) {
      updateListing(id: $id, input: $input) {
        id
        title
        slug
        status
      }
    }
  `,

  publishListing: `
    mutation PublishListing($id: ID!) {
      publishListing(id: $id) {
        id
        status
        publishedAt
      }
    }
  `,

  deleteListing: `
    mutation DeleteListing($id: ID!) {
      deleteListing(id: $id)
    }
  `,

  // Payments
  initializePurchase: `
    mutation InitializePurchase($input: InitializePurchaseInput!) {
      initializePurchase(input: $input) {
        purchaseId
        clientSecret
        status
      }
    }
  `,

  requestRefund: `
    mutation RequestRefund($purchaseId: ID!) {
      requestRefund(purchaseId: $purchaseId)
    }
  `,

  // Reviews
  createReview: `
    mutation CreateReview($input: CreateReviewInput!) {
      createReview(input: $input) {
        id
        rating
        comment
        createdAt
      }
    }
  `,

  // Profile
  updateProfile: `
    mutation UpdateProfile($input: UpdateProfileInput!) {
      updateProfile(input: $input) {
        id
        profile {
          displayName
          bio
          avatarUrl
        }
      }
    }
  `,
};
