import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import * as crypto from "crypto";

const execAsync = promisify(exec);

export interface ExecutionRequest {
  code: string;
  language: string;
  input?: string;
  timeout?: number; // milliseconds
  memoryLimit?: number; // MB
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
  memoryUsed?: number;
  exitCode: number;
}

// Supported language configurations
const LANGUAGE_CONFIGS: Record<
  string,
  { ext: string; command: (file: string) => string; needsCompile?: boolean }
> = {
  javascript: {
    ext: ".js",
    command: (file) => `node "${file}"`,
  },
  typescript: {
    ext: ".ts",
    command: (file) => `npx ts-node "${file}"`,
  },
  python: {
    ext: ".py",
    command: (file) => `python "${file}"`,
  },
  python3: {
    ext: ".py",
    command: (file) => `python3 "${file}"`,
  },
};

@Injectable()
export class ExecutorService {
  private readonly logger = new Logger(ExecutorService.name);
  private readonly tempDir: string;
  private readonly defaultTimeout: number;
  private readonly defaultMemoryLimit: number;

  constructor(private configService: ConfigService) {
    this.tempDir = path.join(os.tmpdir(), "vibecoder-sandbox");
    this.defaultTimeout = 10000; // 10 seconds
    this.defaultMemoryLimit = 128; // 128 MB
  }

  /**
   * Execute code in a sandboxed environment
   */
  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    const {
      code,
      language,
      input,
      timeout = this.defaultTimeout,
      memoryLimit = this.defaultMemoryLimit,
    } = request;

    const startTime = Date.now();

    // Validate language
    const langConfig = LANGUAGE_CONFIGS[language.toLowerCase()];
    if (!langConfig) {
      return {
        success: false,
        output: "",
        error: `Unsupported language: ${language}. Supported: ${Object.keys(LANGUAGE_CONFIGS).join(", ")}`,
        executionTime: 0,
        exitCode: 1,
      };
    }

    // Security check
    const securityCheck = this.performSecurityCheck(code, language);
    if (!securityCheck.safe) {
      return {
        success: false,
        output: "",
        error: `Security violation: ${securityCheck.reason}`,
        executionTime: 0,
        exitCode: 1,
      };
    }

    // Create temp directory and file
    const executionId = crypto.randomBytes(8).toString("hex");
    const executionDir = path.join(this.tempDir, executionId);
    const codeFile = path.join(executionDir, `main${langConfig.ext}`);

    try {
      // Create execution directory
      await fs.mkdir(executionDir, { recursive: true });

      // Write code to file
      await fs.writeFile(codeFile, code, "utf-8");

      // Write input file if provided
      if (input) {
        await fs.writeFile(path.join(executionDir, "input.txt"), input, "utf-8");
      }

      // Build command
      const command = langConfig.command(codeFile);

      // Execute with timeout
      const { stdout, stderr } = await this.executeWithTimeout(
        command,
        executionDir,
        timeout
      );

      const executionTime = Date.now() - startTime;

      return {
        success: !stderr,
        output: stdout,
        error: stderr || undefined,
        executionTime,
        exitCode: 0,
      };
    } catch (error: any) {
      const executionTime = Date.now() - startTime;

      // Handle timeout
      if (error.killed) {
        return {
          success: false,
          output: "",
          error: `Execution timed out after ${timeout}ms`,
          executionTime,
          exitCode: 124,
        };
      }

      // Handle other errors
      return {
        success: false,
        output: error.stdout || "",
        error: error.stderr || error.message,
        executionTime,
        exitCode: error.code || 1,
      };
    } finally {
      // Cleanup
      try {
        await fs.rm(executionDir, { recursive: true, force: true });
      } catch (cleanupError) {
        this.logger.warn(`Failed to cleanup execution directory: ${executionDir}`);
      }
    }
  }

  /**
   * Execute command with timeout
   */
  private async executeWithTimeout(
    command: string,
    cwd: string,
    timeout: number
  ): Promise<{ stdout: string; stderr: string }> {
    return execAsync(command, {
      cwd,
      timeout,
      maxBuffer: 1024 * 1024, // 1MB output buffer
      env: {
        ...process.env,
        NODE_ENV: "sandbox",
      },
    });
  }

  /**
   * Perform security checks on the code
   */
  private performSecurityCheck(
    code: string,
    language: string
  ): { safe: boolean; reason?: string } {
    const lowerCode = code.toLowerCase();

    // Common dangerous patterns across languages
    const dangerousPatterns = [
      { pattern: /process\.exit/i, reason: "Process termination not allowed" },
      { pattern: /child_process/i, reason: "Child process spawning not allowed" },
      { pattern: /require\s*\(\s*['"]fs['"]\s*\)/i, reason: "File system access not allowed" },
      { pattern: /import\s+.*\s+from\s+['"]fs['"]/i, reason: "File system access not allowed" },
      { pattern: /require\s*\(\s*['"]net['"]\s*\)/i, reason: "Network access not allowed" },
      { pattern: /require\s*\(\s*['"]http['"]\s*\)/i, reason: "HTTP module not allowed" },
      { pattern: /require\s*\(\s*['"]https['"]\s*\)/i, reason: "HTTPS module not allowed" },
      { pattern: /eval\s*\(/i, reason: "Eval not allowed" },
      { pattern: /Function\s*\(/i, reason: "Dynamic function creation not allowed" },
      { pattern: /import\s*\(\s*['"]/i, reason: "Dynamic imports not allowed" },
    ];

    // Language-specific patterns
    const pythonPatterns = [
      { pattern: /os\.system/i, reason: "System commands not allowed" },
      { pattern: /subprocess/i, reason: "Subprocess not allowed" },
      { pattern: /import\s+os/i, reason: "OS module not allowed" },
      { pattern: /__import__/i, reason: "Dynamic imports not allowed" },
      { pattern: /exec\s*\(/i, reason: "Exec not allowed" },
      { pattern: /open\s*\(/i, reason: "File operations not allowed" },
    ];

    // Check common patterns
    for (const { pattern, reason } of dangerousPatterns) {
      if (pattern.test(code)) {
        return { safe: false, reason };
      }
    }

    // Check Python-specific patterns
    if (language.includes("python")) {
      for (const { pattern, reason } of pythonPatterns) {
        if (pattern.test(code)) {
          return { safe: false, reason };
        }
      }
    }

    // Check code length
    if (code.length > 50000) {
      return { safe: false, reason: "Code too long (max 50KB)" };
    }

    return { safe: true };
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): string[] {
    return Object.keys(LANGUAGE_CONFIGS);
  }
}
