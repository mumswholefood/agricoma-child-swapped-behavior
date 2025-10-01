# Agricoma Child Theme - Agent Guidelines

## Build/Lint/Test Commands
- **Test**: Enable debug mode with `?debug_swap=1` URL parameter
- **Debug**: Run `diagnoseProductSwapV3()` in browser console
- **Validate**: Check browser console for script loading and event logs

## Code Style Guidelines

### PHP (functions.php)
- Use WordPress coding standards with proper docblocks
- Always include security checks: `if (!defined('ABSPATH')) exit;`
- Use `wp_enqueue_script/style` with proper dependencies
- Implement error handling with try/catch blocks
- Use `wp_localize_script` for passing data to JavaScript

### JavaScript (product-swap.js)
- Use strict mode and jQuery wrapper: `(function($) { 'use strict'; })(jQuery);`
- Comprehensive event prevention: `preventDefault()`, `stopPropagation()`, `stopImmediatePropagation()`
- Enhanced debug logging with `debugLog()` function
- Use config object for centralized settings
- Implement fallback mechanisms for all critical functions

### CSS (style.css, product-swap-v3.css)
- Use BEM-style naming: `.behavior-swapped-v3 .product-link`
- Include accessibility: `@media (prefers-reduced-motion: reduce)`, `@media (prefers-contrast: high)`
- Mobile-first responsive design with proper breakpoints
- Smooth transitions: `transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`
- Focus states for keyboard navigation

### Naming Conventions
- PHP functions: `snake_case` with theme prefix: `agricoma_child_setup()`
- JavaScript variables: `camelCase` with descriptive names
- CSS classes: `kebab-case` with version suffixes: `behavior-swapped-v3`
- File names: descriptive with version numbers: `product-swap-v3.css`

### Error Handling
- Graceful fallbacks for all theme function dependencies
- Console-only error messages (no user-facing alerts)
- Comprehensive debug logging when enabled
- AJAX error handling with user-friendly fallbacks