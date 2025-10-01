<?php
/**
 * Child Theme Functions
 * Swap product image click and quick view button behaviors
 *
 * @package Agricoma Child - Swapped Behavior
 * @version 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Theme setup
 */
function agricoma_child_setup() {
    // Add theme support features if needed
    add_theme_support('woocommerce');
}
add_action('after_setup_theme', 'agricoma_child_setup');

/**
 * Enqueue parent and child theme stylesheets
 */
function agricoma_child_enqueue_styles() {
    // Enqueue parent theme stylesheet
    wp_enqueue_style(
        'agricoma-parent-style',
        get_template_directory_uri() . '/style.css',
        array(),
        wp_get_theme(get_template())->get('Version')
    );

    // Enqueue child theme stylesheet
    wp_enqueue_style(
        'agricoma-child-style',
        get_stylesheet_directory_uri() . '/style.css',
        array('agricoma-parent-style'),
        '3.0.0'
    );

    // Enqueue enhanced v3 CSS for product swap
    wp_enqueue_style(
        'product-swap-v3-style',
        get_stylesheet_directory_uri() . '/css/product-swap-v3.css',
        array('agricoma-child-style'),
        '3.0.0'
    );
}
add_action('wp_enqueue_scripts', 'agricoma_child_enqueue_styles');

/**
 * Enqueue our custom behavior swap script
 */
function swap_product_click_behaviors() {
    // Always load the script so we can test on all pages
    wp_enqueue_script(
        'product-behavior-swap',
        get_stylesheet_directory_uri() . '/js/product-swap.js',
        array('jquery'),
        '3.0.0',
        true
    );

    // Get parent theme settings (ensure parent theme functions are loaded)
    $enable_debug = defined('WP_DEBUG') && WP_DEBUG;
    $product_type = '11'; // Default to Type 11 since that's what we're targeting
    $quickview_enabled = '0';

    try {
        if (function_exists('ninetheme_settings')) {
            $product_type = ninetheme_settings('shop_product_type', '11');
            $quickview_enabled = ninetheme_settings('quick_view_visibility', '0');

            // Log successful theme function detection
            if ($enable_debug) {
                error_log('Product Swap: Parent theme functions loaded successfully');
            }
        } else {
            // Parent theme functions not available
            if ($enable_debug) {
                error_log('Product Swap: Parent theme functions not available, using defaults');
            }
        }
    } catch (Exception $e) {
        // Handle any errors in theme function detection
        if ($enable_debug) {
            error_log('Product Swap: Error detecting theme functions - ' . $e->getMessage());
        }
    }

    // Pass theme variables to script with error handling
    try {
        $script_vars = array(
            'quickview_enabled' => $quickview_enabled,
            'product_type' => $product_type,
            'ajaxurl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('product_swap_nonce'),
            'enable_debug' => $enable_debug || isset($_GET['debug_swap']),
            'theme_version' => '3.0.0',
            'script_version' => '3.0.0',
            'comprehensive_mode' => true,
            'is_debug_mode' => $enable_debug,
            'current_page_type' => function_exists('get_current_screen') ? (get_current_screen() ? get_current_screen()->id : 'unknown') : 'admin_screen_unavailable',
            'is_admin' => is_admin(),
            'is_front_page' => is_front_page(),
            'is_shop' => function_exists('is_shop') ? is_shop() : false,
            'is_product_category' => function_exists('is_product_category') ? is_product_category() : false,
            'current_url' => home_url($_SERVER['REQUEST_URI']),
            'force_debug' => isset($_GET['debug_swap']),
            'parent_theme_detected' => function_exists('ninetheme_settings'),
            'woocommerce_active' => class_exists('WooCommerce')
        );

        wp_localize_script('product-behavior-swap', 'productSwapVars', $script_vars);

        if ($enable_debug) {
            error_log('Product Swap: Script variables localized successfully');
        }
    } catch (Exception $e) {
        // Fallback if localization fails
        if ($enable_debug) {
            error_log('Product Swap: Error localizing script variables - ' . $e->getMessage());
        }

        // Minimal fallback variables
        wp_localize_script('product-behavior-swap', 'productSwapVars', array(
            'product_type' => '11',
            'enable_debug' => $enable_debug,
            'ajaxurl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('product_swap_nonce'),
            'parent_theme_detected' => false,
            'error_fallback' => true
        ));
    }

    // Force debug mode with URL parameter ?debug_swap=1
    if (isset($_GET['debug_swap'])) {
        error_log('Product Swap Debug Mode Forced via URL');
    }
}
add_action('wp_enqueue_scripts', 'swap_product_click_behaviors');

/**
 * AJAX handler for getting product permalink
 */
function get_product_permalink_ajax() {
    check_ajax_referer('product_swap_nonce', 'nonce');

    $product_id = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0;

    if ($product_id > 0) {
        $product = wc_get_product($product_id);
        if ($product) {
            wp_send_json_success(array('url' => $product->get_permalink()));
        }
    }

    wp_send_json_error('Product not found');
}
add_action('wp_ajax_get_product_permalink', 'get_product_permalink_ajax');
add_action('wp_ajax_nopriv_get_product_permalink', 'get_product_permalink_ajax');

/**
 * AJAX handler for getting product content for custom quick view
 */
function get_product_content_ajax() {
    check_ajax_referer('product_swap_nonce', 'nonce');

    $product_id = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0;

    if ($product_id > 0) {
        $product = wc_get_product($product_id);
        if ($product) {
            // Get product content
            $content = '<div class="custom-quick-view-content">';

            // Product title
            $content .= '<h2>' . esc_html($product->get_name()) . '</h2>';

            // Product image
            $image_id = $product->get_image_id();
            if ($image_id) {
                $content .= wp_get_attachment_image($image_id, 'large', false, array('class' => 'product-image'));
            }

            // Product price
            $content .= '<div class="product-price">' . $product->get_price_html() . '</div>';

            // Product description (short)
            $content .= '<div class="product-description">' . wpautop(wp_kses_post($product->get_short_description())) . '</div>';

            // Product meta
            $content .= '<div class="product-meta">';
            if ($product->get_sku()) {
                $content .= '<p><strong>SKU:</strong> ' . esc_html($product->get_sku()) . '</p>';
            }
            $content .= '<p><strong>Categories:</strong> ' . wc_get_product_category_list($product_id, ', ') . '</p>';
            $content .= '</div>';

            // Add to cart button
            if ($product->is_in_stock()) {
                $content .= '<div class="add-to-cart-wrapper">';
                $content .= '<a href="' . esc_url($product->get_permalink()) . '" class="button">View Full Product Details</a>';
                $content .= '</div>';
            }

            $content .= '</div>';

            wp_send_json_success($content);
        }
    }

    wp_send_json_error('Product not found');
}
add_action('wp_ajax_get_product_content', 'get_product_content_ajax');
add_action('wp_ajax_nopriv_get_product_content', 'get_product_content_ajax');

/**
 * Optional: Add admin notice to confirm functionality is active
 */
function agricoma_child_admin_notice() {
    $screen = get_current_screen();
    if ($screen && in_array($screen->base, array('themes', 'dashboard'))) {
        $theme_active = true;
        $parent_theme = wp_get_theme(get_template());
        $child_theme = wp_get_theme();

        ?>
        <div class="notice notice-success is-dismissible">
            <p><strong><?php _e('✅ Agricoma Child Theme v3.0 Active', 'agricoma-child'); ?></strong></p>
            <p>
                <?php
                printf(
                    __('Parent theme: %s | Child theme: %s', 'agricoma-child'),
                    esc_html($parent_theme->get('Name')),
                    esc_html($child_theme->get('Name'))
                );
                ?>
            </p>
            <p><?php _e('🔄 Product click behavior swap is enabled! Product images trigger Quick View, Quick View buttons navigate to product pages.', 'agricoma-child'); ?></p>
            <p><em><?php _e('This affects Product Type 11 layout. Add ?debug_swap=1 to any URL for debugging.', 'agricoma-child'); ?></em></p>
        </div>
        <?php
    }
}
add_action('admin_notices', 'agricoma_child_admin_notice');

/**
 * Add theme information for WordPress
 */
function agricoma_child_theme_info() {
    add_action('admin_head', function() {
        ?>
        <style>
        .theme-info .theme-name {
            font-weight: bold;
        }
        .theme-info .theme-description {
            color: #666;
            font-size: 12px;
        }
        </style>
        <?php
    });
}
add_action('after_setup_theme', 'agricoma_child_theme_info');