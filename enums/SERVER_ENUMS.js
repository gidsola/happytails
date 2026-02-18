/**
 * Enumerations and constants for the server.
 */

import { join } from 'path';


/**
 * Function that returns the path to the main index HTML file.
 * @returns {string} The absolute path to index.html
 */
const INDEX_HTML = () => join(process.cwd(), 'frontend/dist', 'index.html');

const STATIC_ASSETS = () => join(process.cwd(), 'frontend/dist')

export { INDEX_HTML, STATIC_ASSETS };