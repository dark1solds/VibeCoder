export interface APIClient {
  // Auth
  auth: {
    login(email: string, password: string): Promise<any>;
    register(data: any): Promise<any>;
    logout(): Promise<void>;
    refreshToken(): Promise<string>;
  };

  // Listings
  listings: {
    get(id: string): Promise<any>;
    list(filter?: any): Promise<any>;
    create(input: any): Promise<any>;
    update(id: string, input: any): Promise<any>;
    search(query: string, options?: any): Promise<any[]>;
  };

  // Purchases
  purchases: {
    create(listingId: string, paymentMethodId: string): Promise<any>;
    list(): Promise<any[]>;
    download(purchaseId: string): Promise<Blob>;
  };

  // Sandbox
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
  timeout?: number; // milliseconds
  memoryLimit?: number; // MB
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
