/**
 * Unit tests for API key validation functions
 *
 * Tests:
 * - getEmbeddingProvider() - Auto-detect provider from model
 * - needsEmbeddingApiKey() - Check if API key is needed
 */

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { getEmbeddingProvider, needsEmbeddingApiKey } from "../../src/config.js";

describe("Config API Key Validation", () => {
	// Save original env vars
	const originalEnv: Record<string, string | undefined> = {};
	
	beforeEach(() => {
		// Save env vars
		originalEnv.CLAUDEMEM_MODEL = process.env.CLAUDEMEM_MODEL;
		originalEnv.OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
		originalEnv.VOYAGE_API_KEY = process.env.VOYAGE_API_KEY;
	});

	afterEach(() => {
		// Restore env vars
		if (originalEnv.CLAUDEMEM_MODEL !== undefined) {
			process.env.CLAUDEMEM_MODEL = originalEnv.CLAUDEMEM_MODEL;
		} else {
			delete process.env.CLAUDEMEM_MODEL;
		}
		if (originalEnv.OPENROUTER_API_KEY !== undefined) {
			process.env.OPENROUTER_API_KEY = originalEnv.OPENROUTER_API_KEY;
		} else {
			delete process.env.OPENROUTER_API_KEY;
		}
		if (originalEnv.VOYAGE_API_KEY !== undefined) {
			process.env.VOYAGE_API_KEY = originalEnv.VOYAGE_API_KEY;
		} else {
			delete process.env.VOYAGE_API_KEY;
		}
	});

	describe("getEmbeddingProvider", () => {
		test("detects ollama provider from model prefix", () => {
			process.env.CLAUDEMEM_MODEL = "ollama/nomic-embed-text";
			const provider = getEmbeddingProvider();
			expect(provider).toBe("ollama");
		});

		test("detects lmstudio provider from model prefix", () => {
			process.env.CLAUDEMEM_MODEL = "lmstudio/text-embedding";
			const provider = getEmbeddingProvider();
			expect(provider).toBe("lmstudio");
		});

		test("detects local provider from model prefix", () => {
			process.env.CLAUDEMEM_MODEL = "local/all-minilm";
			const provider = getEmbeddingProvider();
			expect(provider).toBe("local");
		});

		test("detects voyage provider from model prefix", () => {
			process.env.CLAUDEMEM_MODEL = "voyage-code-3";
			const provider = getEmbeddingProvider();
			expect(provider).toBe("voyage");
		});

		test("defaults to openrouter for unprefixed models", () => {
			process.env.CLAUDEMEM_MODEL = "qwen/qwen3-embedding-8b";
			const provider = getEmbeddingProvider();
			expect(provider).toBe("openrouter");
		});
	});

	describe("needsEmbeddingApiKey", () => {
		test("returns false for ollama provider (no API key needed)", () => {
			process.env.CLAUDEMEM_MODEL = "ollama/nomic-embed-text";
			delete process.env.OPENROUTER_API_KEY;
			const needs = needsEmbeddingApiKey();
			expect(needs).toBe(false);
		});

		test("returns false for lmstudio provider (no API key needed)", () => {
			process.env.CLAUDEMEM_MODEL = "lmstudio/text-embedding";
			delete process.env.OPENROUTER_API_KEY;
			const needs = needsEmbeddingApiKey();
			expect(needs).toBe(false);
		});

		test("returns false for local provider (no API key needed)", () => {
			process.env.CLAUDEMEM_MODEL = "local/all-minilm";
			delete process.env.OPENROUTER_API_KEY;
			const needs = needsEmbeddingApiKey();
			expect(needs).toBe(false);
		});

		test("returns false for voyage provider when API key is set", () => {
			process.env.CLAUDEMEM_MODEL = "voyage-code-3";
			process.env.VOYAGE_API_KEY = "test-key";
			const needs = needsEmbeddingApiKey();
			expect(needs).toBe(false);
		});

		test("returns true for voyage provider when API key is missing", () => {
			process.env.CLAUDEMEM_MODEL = "voyage-code-3";
			delete process.env.VOYAGE_API_KEY;
			const needs = needsEmbeddingApiKey();
			expect(needs).toBe(true);
		});

		test("returns false for openrouter when API key is set", () => {
			process.env.CLAUDEMEM_MODEL = "qwen/qwen3-embedding-8b";
			process.env.OPENROUTER_API_KEY = "test-key";
			const needs = needsEmbeddingApiKey();
			expect(needs).toBe(false);
		});

		test("returns true for openrouter when API key is missing", () => {
			process.env.CLAUDEMEM_MODEL = "qwen/qwen3-embedding-8b";
			delete process.env.OPENROUTER_API_KEY;
			const needs = needsEmbeddingApiKey();
			expect(needs).toBe(true);
		});
	});
});
