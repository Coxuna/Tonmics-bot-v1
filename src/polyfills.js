// src/polyfills.js
import { Buffer } from 'buffer';

if (typeof window !== 'undefined') {
  if (!window.Buffer) {
    window.Buffer = Buffer;
  }

  // Only define global if it doesn't already exist
  if (typeof global === 'undefined') {
    window.global = window;
  }
}
