import { describe, expect, it } from 'vitest';
import { validateImageFile } from './imageUpload';

describe('validateImageFile', () => {
  it('rejects unsupported files', () => {
    expect(() => validateImageFile(new File(['x'], 'note.txt', { type: 'text/plain' }))).toThrow('Choose a JPEG, PNG, or WebP image');
  });

  it('rejects images larger than 5 MB', () => {
    expect(() => validateImageFile(new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.jpg', { type: 'image/jpeg' }))).toThrow('5 MB');
  });
});
