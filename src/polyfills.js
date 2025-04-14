// Create a new file: src/polyfills.js
import { Buffer } from 'buffer';
window.Buffer = Buffer;
global = window;