/**
 * Enumerations and constants for the server.
 */

import { join, resolve } from 'path';
const __dirname = resolve();


/**
 * Function that returns the path to the main index HTML file.
 * @returns {string} The absolute path to index.html
 */
const INDEX_HTML = () => join(__dirname, 'frontend', 'dist', 'index.html');
// console.log('Index HTML path:', INDEX_HTML());

const STATIC_ASSETS = () => join(__dirname, 'frontend', 'dist');
// console.log('Static assets path:', STATIC_ASSETS());

export { INDEX_HTML, STATIC_ASSETS };