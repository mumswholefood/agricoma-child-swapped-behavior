# Agricoma Child Theme - Swapped Behavior

A child theme for the Agricoma WordPress theme that swaps the default product click behaviors to provide a more intuitive shopping experience.

## What It Does

**Default Behavior:**
- Product image click → Navigate to product page
- Quick view button → Open quick view modal

**With This Child Theme:**
- Product image click → Open quick view modal
- Quick view button → Navigate to product page

This gives users a faster way to preview products while still providing easy access to full product details.

## Requirements

- WordPress 5.0+
- WooCommerce 3.0+
- Agricoma Parent Theme 1.1.6+
- PHP 7.4+

## Installation

1. **Upload the Theme**
   - Place the entire `agricoma-child-swapped-behavior` folder in `/wp-content/themes/`
   - OR upload the ZIP file via WordPress admin → Appearance → Themes → Add New → Upload Theme

2. **Activate the Theme**
   - Go to WordPress admin → Appearance → Themes
   - Activate "Agricoma Child - Swapped Behavior"

3. **Configure Parent Theme**
   - Ensure Agricoma parent theme is installed and activated
   - Set product layout to "Type 11" in Agricoma Theme Options
   - Enable Quick View in Theme Options → Shop → Quick View Settings

## Features

### 🔄 Behavior Swapping
- **Smart Detection**: Only affects Product Type 11 layout
- **AJAX Compatible**: Works with shop filters, pagination, and infinite scroll
- **Mobile Responsive**: Optimized for all device sizes

### 🎨 Visual Enhancements
- **Hover Indicators**: Shows "Quick View" hint on product image hover
- **Click Feedback**: Visual animations when actions are triggered
- **Loading States**: Indicates when actions are processing

### ♿ Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Focus Indicators**: Clear visual focus states
- **Reduced Motion**: Respects user's motion preferences

### 🛡️ Safety Features
- **Update Safe**: No parent theme files modified
- **Error Handling**: Graceful fallbacks if quick view isn't available
- **Debug Mode**: Optional console logging for troubleshooting

## Configuration

### Enable Debug Mode
Add this to your child theme's `functions.php`:

```php
// Enable debug logging
add_action('wp_enqueue_scripts', function() {
    wp_localize_script('product-behavior-swap', 'productSwapVars', array(
        'enable_debug' => true,
        // ... other vars
    ));
});
```

### Customize Visual Indicators
You can modify the hover text by editing the CSS in `style.css`:

```css
.product-inner.behavior-swapped .product-link::after {
    content: "Your custom text";
}
```

### Disable Visual Indicators
Add this to your child theme's `functions.php`:

```php
add_action('wp_enqueue_scripts', function() {
    wp_localize_script('product-behavior-swap', 'productSwapVars', array(
        'enable_visual_indicators' => false,
        // ... other vars
    ));
});
```

## Theme Options

This child theme respects all Agricoma theme settings. Make sure to configure:

1. **Product Layout**: Set to "Type 11" in Theme Options
2. **Quick View**: Enable in Shop settings
3. **Shop Columns**: Configure as desired (1-5 columns supported)

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Troubleshooting

### Behavior Not Working
1. Verify you're using Product Type 11 layout
2. Check that Quick View is enabled in theme settings
3. Clear browser and plugin caches
4. Check browser console for JavaScript errors

### Quick View Not Opening
1. Ensure Quick View is enabled in Agricoma Theme Options
2. Check for plugin conflicts (try disabling other plugins)
3. Verify parent theme is up to date

### Mobile Issues
1. Test on actual mobile device (not just browser simulation)
2. Check that touch events are working properly
3. Ensure no mobile-specific CSS conflicts

### Performance Issues
1. Enable script minification if using a caching plugin
2. Optimize images in product galleries
3. Consider server-side caching for AJAX requests

## Frequently Asked Questions

**Q: Does this affect SEO?**
A: No, this is purely behavioral JavaScript and doesn't change page structure or content.

**Q: Will this break when I update the parent theme?**
A: No, this child theme is designed to be update-safe and uses WordPress best practices.

**Q: Can I use this with other product types?**
A: Currently, it's designed specifically for Type 11, but you can modify the JavaScript to support other types.

**Q: Does this work with page builders?**
A: Yes, it works with standard WooCommerce shop pages regardless of page builder.

**Q: Can I customize the animations?**
A: Yes, all animations are defined in the CSS and can be easily customized.

## File Structure

```
agricoma-child-swapped-behavior/
├── functions.php          # Theme setup and script loading
├── style.css             # Child theme styles and enhancements
├── js/
│   └── product-swap.js   # Main behavior swap logic
└── README.md             # This documentation
```

## Customization

### Adding New Behaviors
To modify or extend the behavior swapping, edit `js/product-swap.js`:

```javascript
// Example: Add new behavior for another element
$(document).on('click.productSwap', '.your-element', function(e) {
    e.preventDefault();
    // Your custom logic here
});
```

### Styling Changes
Modify `style.css` to customize the appearance:

```css
/* Example: Change hover indicator color */
.product-inner.behavior-swapped .product-link::after {
    background: #your-color;
}
```

## Version History

**1.0.0** - Initial release
- Product image → Quick view
- Quick view button → Product page
- Mobile responsive design
- Accessibility features
- Visual feedback animations

## Support

For support, please:

1. Check the troubleshooting section above
2. Verify you have the latest versions of WordPress, WooCommerce, and Agricoma
3. Create a backup before making changes
4. Test in a staging environment first

## License

This child theme is licensed under the GNU General Public License v3.0, the same license as the parent Agricoma theme.

## Credits

- Based on Agricoma theme by Ninetheme
- Behavior swap functionality by Custom Implementation
- Icons and visual elements from parent theme