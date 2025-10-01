/**
 * Product Behavior Swap Script v3.0
 * COMPREHENSIVE NAVIGATION PREVENTION
 *
 * Investigates and blocks ALL potential navigation triggers when clicking product images
 *
 * @version 3.0.0
 * @author Agricoma Child Theme
 */

(function($) {
    'use strict';

    // Immediate console log to verify script loading
    console.log('🚀 Product Swap Script v3.0 Loading - COMPREHENSIVE VERSION');
    console.log('📊 Product Swap Variables:', window.productSwapVars);

    // Configuration
    var config = {
        productType: '11', // Target product type
        enableDebug: false,
        animationDuration: 300,
        enableVisualIndicators: true,
        eventNamespace: '.productSwapV3',
        preventionMethods: ['click', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'dblclick'],
        logAllEvents: true
    };

    // Update config from PHP variables
    if (window.productSwapVars) {
        config.enableDebug = productSwapVars.enable_debug || productSwapVars.force_debug;
        config.productType = productSwapVars.product_type || '11';
        console.log('✅ Product Swap Variables Loaded');
        console.log('  - Debug Mode:', config.enableDebug);
        console.log('  - Product Type:', config.productType);
        console.log('  - Quick View Enabled:', productSwapVars.quickview_enabled);
    } else {
        console.error('❌ Product Swap Variables NOT FOUND!');
    }

    // Enhanced event logging
    function debugLog(message, data) {
        if (config.enableDebug && window.console) {
            console.log('🔍 [Product Swap v3]', message, data || '');
        }
    }

    // Global event logging
    function logEvent(eventName, element, details) {
        if (config.logAllEvents && config.enableDebug) {
            console.log('⚡ [EVENT]', eventName, {
                element: element.tagName + '.' + element.className,
                href: element.href,
                details: details || {}
            });
        }
    }

    // Navigation monitoring
    var navigationBlocked = false;
    var blockedNavigationCount = 0;

    // Block navigation temporarily with enhanced tracking (no visual indicators)
    function blockNavigationTemporarily($element, reason) {
        if (navigationBlocked) {
            debugLog('Navigation already blocked, skipping');
            return;
        }

        navigationBlocked = true;
        blockedNavigationCount++;

        debugLog('Navigation BLOCKED', {
            reason: reason,
            count: blockedNavigationCount,
            element: $element[0].tagName + '.' + $element[0].className
        });

        // Store original href
        var originalHref = $element.attr('href');
        $element.data('original-href', originalHref);

        // Remove href to prevent browser navigation
        $element.attr('href', 'javascript:void(0);');

        // Unblock after delay
        setTimeout(function() {
            if (navigationBlocked) {
                debugLog('Navigation UNBLOCKED');
                navigationBlocked = false;

                // Restore original href if still needed
                if ($element.data('original-href')) {
                    $element.attr('href', $element.data('original-href'));
                }
            }
        }, 3000); // Longer blocking period
    }

    // Monitor URL changes
    var originalPushState = history.pushState;
    var originalReplaceState = history.replaceState;
    var currentUrl = window.location.href;

    function monitorUrlChange() {
        if (window.location.href !== currentUrl) {
            debugLog('URL CHANGE DETECTED', {
                from: currentUrl,
                to: window.location.href,
                blocked: navigationBlocked
            });

            if (navigationBlocked) {
                debugLog('BLOCKING URL CHANGE - stopping navigation');
                history.replaceState({}, '', currentUrl);
                return false;
            }

            currentUrl = window.location.href;
        }
    }

    // Override history methods to monitor changes
    history.pushState = function() {
        if (navigationBlocked) {
            debugLog('BLOCKED pushState call');
            return false;
        }
        return originalPushState.apply(this, arguments);
    };

    history.replaceState = function() {
        if (navigationBlocked) {
            debugLog('BLOCKED replaceState call');
            return false;
        }
        var result = originalReplaceState.apply(this, arguments);
        monitorUrlChange();
        return result;
    };

    // Monitor popstate (back/forward buttons)
    window.addEventListener('popstate', function(e) {
        debugLog('POPSTATE detected', {
            url: window.location.href,
            blocked: navigationBlocked
        });
        monitorUrlChange();
    });

    // Enhanced event prevention handler for both image and title clicks
    function handleProductClickEvent(e) {
        var eventType = e.type;
        var $element = $(e.currentTarget);
        var elementType = $element.hasClass('product-link') ? 'product_image' :
                         $element.hasClass('product-name') || $element.closest('.product-name').length ? 'product_title' : 'unknown';

        logEvent(eventType + '_on_' + elementType, e.currentTarget, {
            preventDefaultCalled: true,
            stopPropagationCalled: true,
            stopImmediatePropagationCalled: true,
            navigationBlocked: navigationBlocked
        });

        debugLog('Product ' + elementType + ' event intercepted', {
            eventType: eventType,
            element: e.currentTarget.tagName + '.' + e.currentTarget.className,
            href: e.currentTarget.href,
            text: e.currentTarget.textContent ? e.currentTarget.textContent.substring(0, 50) + '...' : 'No text'
        });

        // Only handle the first event (usually click)
        if (eventType === 'click' && !navigationBlocked) {
            // Prevent ALL default behaviors
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            // Block navigation immediately
            blockNavigationTemporarily($element, elementType + '_click');

            var $productInner = $element.closest('.product-inner');
            var productId = $productInner.data('id');

            debugLog('Processing product ' + elementType + ' click', {
                productId: productId,
                hasProductInner: $productInner.length > 0
            });

            if (!productId) {
                console.error('No product ID found');
                return false;
            }

            // Visual feedback
            showClickFeedback($element, 'quickview');

            // Trigger quick view with enhanced fallbacks
            triggerQuickViewWithEnhancedFallbacks(productId, $productInner);

            return false;
        } else if (navigationBlocked) {
            // Block all other events while navigation is blocked
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        }
    }

    // Enhanced quick view trigger with comprehensive fallbacks
    function triggerQuickViewWithEnhancedFallbacks(productId, $productInner) {
        debugLog('ATTEMPTING ENHANCED QUICK VIEW TRIGGER', productId);

        // Method 1: Direct function call with error handling
        if (typeof window.ninetheme_quickview_open === 'function') {
            debugLog('Method 1: Direct ninetheme_quickview_open function');
            try {
                window.ninetheme_quickview_open(productId);
                debugLog('✅ Method 1 SUCCEEDED');
                monitorQuickViewSuccess();
                return;
            } catch (error) {
                debugLog('❌ Method 1 FAILED', error.message);
            }
        }

        // Method 2: jQuery plugin with isolated execution
        if (typeof $.fn.quickview === 'function') {
            debugLog('Method 2: jQuery quickview plugin');
            try {
                // Create isolated execution context
                var $isolatedContainer = $('<div>').css('position', 'absolute').css('left', '-9999px');
                $('body').append($isolatedContainer);

                var $isolatedButton = $productInner.find('.ninetheme-quickview-btn').clone();
                $isolatedContainer.append($isolatedButton);

                setTimeout(function() {
                    $isolatedButton.quickview();
                    debugLog('✅ Method 2 SUCCEEDED (isolated)');
                    monitorQuickViewSuccess();
                }, 50);
                return;
            } catch (error) {
                debugLog('❌ Method 2 FAILED', error.message);
                $isolatedContainer.remove();
            }
        }

        // Method 3: Alternative function names
        var alternativeFunctions = ['openQuickView', 'quickview_open', 'openQuickViewModal', 'showQuickView'];
        for (var i = 0; i < alternativeFunctions.length; i++) {
            var funcName = alternativeFunctions[i];
            if (typeof window[funcName] === 'function') {
                debugLog('Method 3: Using alternative function', funcName);
                try {
                    window[funcName](productId);
                    debugLog('✅ Method 3 SUCCEEDED', funcName);
                    monitorQuickViewSuccess();
                    return;
                } catch (error) {
                    debugLog('❌ Method 3 FAILED', funcName, error.message);
                }
            }
        }

        // Method 4: Direct button trigger with maximum isolation
        var $quickViewBtn = $productInner.find('.ninetheme-quickview-btn');
        if ($quickViewBtn.length > 0) {
            debugLog('Method 4: Ultra-isolated button trigger');

            try {
                // Create completely isolated button
                var $ghostButton = $quickViewBtn.clone();
                $ghostButton.css({
                    'position': 'absolute',
                    'left': '-10000px',
                    'top': '-10000px',
                    'visibility': 'hidden',
                    'z-index': '-1'
                });

                // Copy all data attributes
                $ghostButton.attr('data-id', productId);

                $('body').append($ghostButton);

                setTimeout(function() {
                    debugLog('Triggering ghost button click');

                    // Create and dispatch a completely new click event
                    var clickEvent = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    });

                    $ghostButton[0].dispatchEvent(clickEvent);

                    setTimeout(function() {
                        $ghostButton.remove();
                        debugLog('Ghost button removed');
                    }, 500);

                    debugLog('✅ Method 4 SUCCEEDED (ghost button)');
                    monitorQuickViewSuccess();
                }, 100);
                return;
            } catch (error) {
                debugLog('❌ Method 4 FAILED', error.message);
            }
        }

        // Method 5: Custom quick view modal (last resort)
        debugLog('Method 5: Custom quick view fallback');
        showEnhancedCustomQuickView(productId, $productInner);
    }

    // Monitor quick view success
    function monitorQuickViewSuccess() {
        debugLog('Quick view trigger successful - monitoring for modal');

        // Monitor for modal appearance
        var checkCount = 0;
        var modalCheckInterval = setInterval(function() {
            checkCount++;

            // Look for any potential quick view modal
            var $modal = $('.quick-view-modal, .ninetheme-quickview-popup, .modal[style*="block"], .quickview:visible, .product-quick-view:visible').first();

            if ($modal.length > 0) {
                debugLog('✅ Quick view modal DETECTED', $modal[0]);
                clearInterval(modalCheckInterval);

                // Monitor modal to ensure it stays open
                monitorModalStability($modal);
            } else if (checkCount > 20) { // 2 seconds timeout
                debugLog('⚠️ Quick view modal NOT detected after 2 seconds');
                clearInterval(modalCheckInterval);
                showErrorMessage('Quick view may not have opened properly');
            }
        }, 100);
    }

    // Monitor modal stability to prevent unexpected closing
    function monitorModalStability($modal) {
        debugLog('Monitoring modal stability');

        var modalCheckCount = 0;
        var stabilityInterval = setInterval(function() {
            modalCheckCount++;

            if (!$modal.is(':visible') || $modal.css('display') === 'none') {
                debugLog('⚠️ Modal disappeared unexpectedly');
                clearInterval(stabilityInterval);
                return;
            }

            if (modalCheckCount > 30) { // Monitor for 3 seconds
                debugLog('✅ Modal stable for 3 seconds - monitoring complete');
                clearInterval(stabilityInterval);
            }
        }, 100);
    }

    // Enhanced custom quick view modal
    function showEnhancedCustomQuickView(productId, $productInner) {
        debugLog('SHOWING ENHANCED CUSTOM QUICK VIEW', productId);

        // Create overlay with maximum z-index
        var $overlay = $('<div class="custom-quick-view-overlay-v3"></div>');
        var $modal = $('<div class="custom-quick-view-modal-v3"></div>');

        // Overlay styling with maximum priority
        $overlay.css({
            'position': 'fixed',
            'top': 0,
            'left': 0,
            'right': 0,
            'bottom': 0,
            'background': 'rgba(0,0,0,0.9)',
            'z-index': 9999999, // Maximum z-index
            'display': 'flex',
            'align-items': 'center',
            'justify-content': 'center',
            'cursor': 'pointer'
        });

        // Modal styling
        $modal.css({
            'background': 'white',
            'padding': '40px',
            'border-radius': '16px',
            'max-width': '1000px',
            'width': '95%',
            'max-height': '90vh',
            'overflow-y': 'auto',
            'position': 'relative',
            'cursor': 'default',
            'box-shadow': '0 25px 80px rgba(0,0,0,0.4)'
        });

        $overlay.append($modal);
        $('body').append($overlay);

        // Show loading
        $modal.html(`
            <div style="text-align: center; padding: 60px 20px;">
                <div style="font-size: 32px; margin-bottom: 20px;">⏳</div>
                <div style="font-size: 20px; font-weight: 600; margin-bottom: 10px;">Loading Product Details</div>
                <div style="color: #666;">Please wait...</div>
            </div>
        `);

        // Prevent any navigation while loading
        var currentUrl = window.location.href;

        // Load content via AJAX
        $.ajax({
            url: productSwapVars.ajaxurl,
            type: 'POST',
            data: {
                action: 'get_product_content',
                product_id: productId,
                nonce: productSwapVars.nonce
            },
            success: function(response) {
                if (response && response.success && response.data) {
                    $modal.html(response.data);
                    debugLog('✅ Custom quick view content loaded successfully');

                    // Ensure URL hasn't changed
                    if (window.location.href !== currentUrl) {
                        debugLog('⚠️ URL changed during loading - restoring');
                        history.replaceState({}, '', currentUrl);
                    }
                } else {
                    $modal.html(`
                        <div style="text-align: center; padding: 40px 20px;">
                            <h3>Product Details</h3>
                            <p>Unable to load full product details.</p>
                            <div style="margin-top: 30px;">
                                <a href="${response.data ? response.data.url : '#'}"
                                   class="button"
                                   style="display: inline-block; background: #0073aa; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                                    View Full Product Page
                                </a>
                            </div>
                            <button onclick="this.closest('.custom-quick-view-overlay-v3').remove()"
                                    style="display: block; margin: 20px auto 0; background: #666; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                                Close
                            </button>
                        </div>
                    `);
                }
            },
            error: function() {
                $modal.html(`
                    <div style="text-align: center; padding: 40px 20px;">
                        <h3>Loading Error</h3>
                        <p>Could not load product details.</p>
                        <button onclick="this.closest('.custom-quick-view-overlay-v3').remove()"
                                style="background: #0073aa; color: white; border: none; padding: 15px 30px; border-radius: 8px; cursor: pointer; margin-top: 20px; font-weight: 600;">
                            Close
                        </button>
                    </div>
                `);
            }
        });

        // Enhanced close handlers
        $overlay.on('click', function(e) {
            if (e.target === $overlay[0]) {
                debugLog('Overlay clicked - closing modal');
                $overlay.remove();
            }
        });

        $(document).on('keyup.swapV3', function(e) {
            if (e.key === 'Escape') {
                debugLog('Escape pressed - closing modal');
                $overlay.remove();
            }
        });

        // Ensure URL hasn't changed when modal closes
        $overlay.on('click', function() {
            setTimeout(function() {
                if (window.location.href !== currentUrl) {
                    debugLog('⚠️ URL changed during modal - restoring');
                    history.replaceState({}, '', currentUrl);
                }
            }, 100);
        });
    }

    // Click feedback animation
    function showClickFeedback($element, type) {
        var feedback = $('<div class="click-feedback-v3"></div>');
        var color = type === 'quickview' ? '#0073aa' : '#22c55e';

        feedback.css({
            'position': 'absolute',
            'top': '50%',
            'left': '50%',
            'width': '30px',
            'height': '30px',
            'border': '3px solid ' + color,
            'border-radius': '50%',
            'transform': 'translate(-50%, -50%)',
            'pointer-events': 'none',
            'z-index': 100000
        });

        $element.css('position', 'relative').append(feedback);

        feedback.animate({
            'width': '80px',
            'height': '80px',
            'opacity': 0
        }, 500, function() {
            $(this).remove();
        });
    }

    // Error message display (now just console logging - no popups)
    function showErrorMessage(message) {
        // Only log to console now - no visual popups
        debugLog('ERROR: ' + message);
        console.error('Product Swap Error:', message);
    }

    // Main initialization function
    function initProductBehaviorSwapV3() {
        debugLog('🚀 INITIALIZING PRODUCT BEHAVIOR SWAP v3.0');

        // Check if we should run
        if (!productSwapVars) {
            debugLog('Product swap variables not available, skipping initialization');
            return;
        }

        // Remove ALL existing event handlers
        $(document).off(config.eventNamespace);

        // Apply comprehensive event prevention to product links AND product titles
        config.preventionMethods.forEach(function(eventType) {
            // Product links (images)
            $(document).on(eventType + config.eventNamespace, '.product-link', handleProductClickEvent);

            // Product titles (and links within product titles)
            $(document).on(eventType + config.eventNamespace, '.product-name', handleProductClickEvent);
            $(document).on(eventType + config.eventNamespace, '.product-name a', handleProductClickEvent);

            debugLog('Event prevention attached for', eventType, '(image + title)');
        });

        // Also handle quick view button clicks (direct navigation)
        $(document).on('click' + config.eventNamespace, '.ninetheme-quickview-btn', function(e) {
            debugLog('Quick view button clicked - should navigate directly');

            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            var $button = $(e.currentTarget);
            var productId = $button.data('id');
            var $productInner = $button.closest('.product-inner');

            // Try multiple sources for product URL
            var productUrl = $productInner.find('.product-link').attr('href') ||
                           $productInner.find('.product-name a').attr('href') ||
                           $productInner.find('h6.product-name a').attr('href') ||
                           $productInner.find('h2.product-name a').attr('href') ||
                           $productInner.find('a[href*="product"]').attr('href');

            if (productUrl) {
                debugLog('NAVIGATING to product page', productUrl);
                showClickFeedback($button, 'navigation');
                window.location.href = productUrl;
            } else {
                debugLog('No product URL found - silent navigation failure');
                // Silently fail - no error message to user
            }

            return false;
        });

        debugLog('✅ Event handlers attached successfully');

        // Add visual indicators
        if (config.enableVisualIndicators) {
            $('.product-inner.type-' + config.productType).addClass('behavior-swapped-v3');
        }

        debugLog('🎉 INITIALIZATION COMPLETE');
    }

    // DOM ready
    $(document).ready(function() {
        debugLog('DOM ready - starting comprehensive initialization');
        initProductBehaviorSwapV3();

        // Auto-diagnosis in debug mode
        if (config.enableDebug) {
            setTimeout(function() {
                runComprehensiveDiagnosis();
            }, 1000);
        }
    });

    // Comprehensive diagnosis function
    function runComprehensiveDiagnosis() {
        console.group('🔍 COMPREHENSIVE PRODUCT SWAP DIAGNOSIS v3.0');

        console.log('📋 Configuration:');
        console.log('  - Product Type Target:', config.productType);
        console.log('  - Debug Mode:', config.enableDebug);
        console.log('  - Event Prevention Methods:', config.preventionMethods);
        console.log('  - Navigation Blocked:', navigationBlocked);

        console.log('🌐 Environment:');
        console.log('  - Current URL:', window.location.href);
        console.log('  - Product Swap Vars:', window.productSwapVars);

        console.log('🔍 DOM Analysis:');
        console.log('  - Total Products:', $('.product-inner').length);
        console.log('  - Type 11 Products:', $('.product-inner.type-11').length);
        console.log('  - Product Links:', $('.product-link').length);
        console.log('  - Product Names/Titles:', $('.product-name').length);
        console.log('  - Product Title Links:', $('.product-name a').length);
        console.log('  - Quick View Buttons:', $('.ninetheme-quickview-btn').length);

        console.log('⚡ Event Listeners Analysis:');
        var $sampleLink = $('.product-link').first();
        if ($sampleLink.length) {
            var events = $._data($sampleLink[0], 'events');
            console.log('  - Events on sample product link:', events ? Object.keys(events) : 'None');
        }

        console.log('🔧 Available Functions:');
        console.log('  - ninetheme_quickview_open:', typeof window.ninetheme_quickview_open);
        console.log('  - openQuickView:', typeof window.openQuickView);
        console.log('  - $.fn.quickview:', typeof $.fn.quickview);

        console.log('🛡️ Navigation Protection:');
        console.log('  - History.pushState overridden:', typeof originalPushState !== 'undefined');
        console.log('  - History.replaceState overridden:', typeof originalReplaceState !== 'undefined');
        console.log('  - Popstate listener attached:', true);

        console.groupEnd();

        // Visual debugging
        if (config.enableDebug) {
            $('.product-inner.type-11').css('border', '3px solid #ff6b6b');
            debugLog('Visual debug borders added to Type 11 products');
        }
    }

    // Global diagnosis function
    window.diagnoseProductSwapV3 = runComprehensiveDiagnosis;

    // Monitor dynamic content
    $(document).on('DOMNodeInserted', function(e) {
        if ($(e.target).hasClass('product-inner')) {
            debugLog('Dynamic product detected - reinitializing');
            setTimeout(initProductBehaviorSwapV3, 100);
        }
    });

    // Handle AJAX content
    $(document).on('ajaxComplete', function(event, xhr, settings) {
        if (settings.url && (settings.url.indexOf('wc-ajax') !== -1 || settings.url.indexOf('product') !== -1)) {
            debugLog('AJAX content detected - reinitializing');
            setTimeout(initProductBehaviorSwapV3, 500);
        }
    });

    // Make functions globally accessible
    window.productSwapDebugV3 = {
        diagnose: runComprehensiveDiagnosis,
        config: config,
        init: initProductBehaviorSwapV3,
        triggerQuickView: triggerQuickViewWithEnhancedFallbacks,
        blockNavigation: function() { blockNavigationTemporarily($('.product-link').first(), 'manual'); },
        unblockNavigation: function() { navigationBlocked = false; }
    };

    debugLog('🎯 Product Swap Script v3.0 FULLY LOADED AND READY');

})(jQuery);