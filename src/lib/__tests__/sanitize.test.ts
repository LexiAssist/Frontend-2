/**
 * Tests for input sanitization utilities
 */

import {
  sanitizeHTML,
  sanitizeInput,
  validateFile,
  sanitizeURL,
  sanitizeMarkdown,
} from '../sanitize';

describe('sanitizeHTML', () => {
  it('should allow safe HTML tags', () => {
    const input = '<p>Hello <strong>world</strong></p>';
    const result = sanitizeHTML(input);
    expect(result).toContain('<p>');
    expect(result).toContain('<strong>');
  });

  it('should remove script tags', () => {
    const input = '<p>Hello</p><script>alert("XSS")</script>';
    const result = sanitizeHTML(input);
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('alert');
  });

  it('should remove onclick handlers', () => {
    const input = '<p onclick="alert(\'XSS\')">Click me</p>';
    const result = sanitizeHTML(input);
    expect(result).not.toContain('onclick');
  });

  it('should allow safe links', () => {
    const input = '<a href="https://example.com">Link</a>';
    const result = sanitizeHTML(input);
    expect(result).toContain('<a');
    expect(result).toContain('href');
  });

  it('should remove javascript: protocol from links', () => {
    const input = '<a href="javascript:alert(\'XSS\')">Link</a>';
    const result = sanitizeHTML(input);
    expect(result).not.toContain('javascript:');
  });
});

describe('sanitizeInput', () => {
  it('should remove angle brackets', () => {
    const input = 'Hello <script>alert("XSS")</script>';
    const result = sanitizeInput(input);
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
  });

  it('should remove javascript: protocol', () => {
    const input = 'javascript:alert("XSS")';
    const result = sanitizeInput(input);
    expect(result).not.toContain('javascript:');
  });

  it('should trim whitespace', () => {
    const input = '  Hello World  ';
    const result = sanitizeInput(input);
    expect(result).toBe('Hello World');
  });

  it('should handle empty input', () => {
    const result = sanitizeInput('');
    expect(result).toBe('');
  });
});

describe('validateFile', () => {
  it('should accept valid PDF file', () => {
    const file = new File(['content'], 'document.pdf', { type: 'application/pdf' });
    const result = validateFile(file);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should reject file exceeding size limit', () => {
    const file = new File(['content'], 'large.pdf', { type: 'application/pdf' });
    const result = validateFile(file, { maxSizeBytes: 1 });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('size exceeds');
  });

  it('should reject invalid MIME type', () => {
    const file = new File(['content'], 'image.jpg', { type: 'image/jpeg' });
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('not allowed');
  });

  it('should reject invalid file extension', () => {
    const file = new File(['content'], 'document.exe', { type: 'application/pdf' });
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('extension');
  });

  it('should accept DOCX files', () => {
    const file = new File(['content'], 'document.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    const result = validateFile(file);
    expect(result.valid).toBe(true);
  });

  it('should accept custom file size limit', () => {
    const file = new File(['content'], 'small.pdf', { type: 'application/pdf' });
    const result = validateFile(file, { maxSizeBytes: 100 });
    expect(result.valid).toBe(true);
  });
});

describe('sanitizeURL', () => {
  it('should allow valid HTTPS URLs', () => {
    const url = 'https://example.com/path';
    const result = sanitizeURL(url);
    expect(result).toBe(url);
  });

  it('should allow valid HTTP URLs', () => {
    const url = 'http://example.com/path';
    const result = sanitizeURL(url);
    expect(result).toBe(url);
  });

  it('should block javascript: protocol', () => {
    const url = 'javascript:alert("XSS")';
    const result = sanitizeURL(url);
    expect(result).toBe('');
  });

  it('should block data: protocol', () => {
    const url = 'data:text/html,<script>alert("XSS")</script>';
    const result = sanitizeURL(url);
    expect(result).toBe('');
  });

  it('should block vbscript: protocol', () => {
    const url = 'vbscript:msgbox("XSS")';
    const result = sanitizeURL(url);
    expect(result).toBe('');
  });

  it('should handle empty URL', () => {
    const result = sanitizeURL('');
    expect(result).toBe('');
  });

  it('should trim whitespace', () => {
    const url = '  https://example.com  ';
    const result = sanitizeURL(url);
    expect(result).toBe('https://example.com');
  });
});

describe('sanitizeMarkdown', () => {
  it('should allow markdown-safe HTML tags', () => {
    const input = '# Heading\n\n<p>Paragraph with <strong>bold</strong></p>';
    const result = sanitizeMarkdown(input);
    expect(result).toContain('<p>');
    expect(result).toContain('<strong>');
  });

  it('should remove script tags from markdown', () => {
    const input = '# Heading\n\n<script>alert("XSS")</script>';
    const result = sanitizeMarkdown(input);
    expect(result).not.toContain('<script>');
  });

  it('should allow code blocks', () => {
    const input = '<pre><code>const x = 1;</code></pre>';
    const result = sanitizeMarkdown(input);
    expect(result).toContain('<pre>');
    expect(result).toContain('<code>');
  });

  it('should handle empty markdown', () => {
    const result = sanitizeMarkdown('');
    expect(result).toBe('');
  });
});
