$(document).ready(function () {
    // Create ARIA live region if it doesn't exist
    var $ariaLive = $('#ribbon-aria-live');
    if ($ariaLive.length === 0) {
        $ariaLive = $('<div id="ribbon-aria-live" aria-live="polite" aria-atomic="true"></div>')
            .css({
                position: 'absolute',
                width: '1px',
                height: '1px',
                overflow: 'hidden',
                clip: 'rect(0 0 0 0)'
            });
        $('body').append($ariaLive);
    }

    //var isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    var isTouch = isTouchEnvironment();
    //debugLog("isTouch: " + isTouch);
    //debugLog("isTouch1: " + ('ontouchstart' in window));
    //debugLog("isTouch2: " + (navigator.maxTouchPoints > 0));
    $('.hovered-ribbon a').each(function () {
        var $link = $(this);
        var id = $link.attr('id');
        if (!id) {
            id = "link" + (Date.now().toString().slice(-7));
        }
        var href = $link.attr('href');
        var text = $link.text();
        var hoveredObj = HoveredJSONData[id] || {
            content: "No content",
            width: "130px"
        };

        $link.attr('tabindex', "0");
        $link.attr('role', "button");
        try {
            // Tooltip (desktop)
            var $tooltip = $('<div class="tooltip" role="tooltip"></div>')
                .attr("id", "tooltip-" + id)
                .css("width", hoveredObj.width);
            var $tooltipText = $('<div class="tooltip-text"></div>').html(hoveredObj.content);
            var $tooltipGoBtn = $(`<a class="goto-btn" tabindex="-1">${text}</a>`).attr("href", href);
            if (hoveredObj.auto_add_link == true) {
                $tooltip.append($tooltipText, $('<div class="btn-cont"></div>').append($tooltipGoBtn));
            } else {
                $tooltip.append($tooltipText);
            }

            // Popover (touch)
            var $popover = $('<div class="popover" role="dialog" aria-modal="false" aria-hidden="true" hidden="hidden"></div>')
                .attr("id", "popover-" + id)
                .css("width", hoveredObj.width);
            var $popText = $('<div class="popover-text"></div>').html(hoveredObj.content);
            var $closeBtn = $('<button class="close-btn" tabindex="-1">Close</button>');
            var $popoverGoBtn = $(`<a class="goto-btn">${text}</a>`).attr("href", href).attr("tabindex", "-1");
            if (hoveredObj.auto_add_link == true) {
                $popover.append($popText, $('<div class="btn-cont"></div>').append($popoverGoBtn, $closeBtn));
            } else {
                $popover.append($popText, $('<div class="btn-cont"></div>').append($closeBtn));
            }

            // Append tooltip and popover
            if($link.closest(".hovered-ribbon") && $link.closest(".hovered-ribbon").length>0){
                $link.closest(".hovered-ribbon").append($tooltip);
                $link.closest(".hovered-ribbon").append($popover);
            }
            //$link.parent().append($tooltip, $popover);
        } catch (err) {
            console.error("Ribbon update error:", err);
            //debugLog("Ribbon update error: " + (err && err.message ? err.message : String(err)));
        } finally {
            // Optional: Code that always executes, regardless of whether an error occurred or was caught
        }
        // Set ARIA
        $link.attr({
            "aria-labelledby": "tooltip-" + id,
            "aria-controls": "popover-" + id,
            "aria-expanded": "false"
        })

        $link.addClass("hovered-link");

        // --- DESKTOP: Tooltip ---
        if (!isTouch) {
            $link.on('mouseenter focus', function () {
                setTooltipDirection($(this));
                $tooltip.addClass('show').attr("aria-hidden", "false").removeAttr("hidden");
                var plainText = $('<div>').html(hoveredObj.content).text();
                $ariaLive.text(plainText);
                $link.attr("aria-expanded", "true");
            });

            $link.on('blur', function () {
                $tooltip.removeClass('show').attr("aria-hidden", "true").attr("hidden", "hidden");
                $link.attr("aria-expanded", "false");
            });

            $tooltip.on('mouseleave blur', function () {
                $tooltip.removeClass('show').attr("aria-hidden", "true").attr("hidden", "hidden");
                $link.attr("aria-expanded", "false");
            });
            if (hoveredObj.auto_add_link == true && $tooltipGoBtn != undefined) {
                $tooltipGoBtn.on('click', function () {
                    // Navigation if needed
                    $tooltip.removeClass('show').attr("aria-hidden", "true").attr("hidden", "hidden");
                    $link.attr("aria-expanded", "false");
                });
            }
        }

        // --- TOUCH: Popover ---
        if (isTouch) {
            $link.on('click', function (e) {
                e.preventDefault();
                var isVisible = $popover.is(':visible');

                // Hide all other popovers/tooltips
                $('.popover').hide().attr("aria-hidden", "true").attr("hidden", "hidden");
                $('.tooltip').removeClass('show').attr("aria-hidden", "true").attr("hidden", "hidden");
                $('.hovered-ribbon a').attr("aria-expanded", "false");

                if (!isVisible) {
                    setPoptipDirection($(this))
                    $popover.show().attr("aria-hidden", "false").removeAttr("hidden");
                    $(this).attr("aria-expanded", "true");
                    if ($tooltipGoBtn != undefined) {
                        $popoverGoBtn.removeAttr("tabindex");
                        $popoverGoBtn.focus();
                    } else {
                        $closeBtn.removeAttr("tabindex");
                        $closeBtn.focus();
                    }
                    var plainText = $('<div>').html(hoveredObj.content).text();
                    $ariaLive.text(plainText);
                }
            });
            if (hoveredObj.auto_add_link == true && $tooltipGoBtn != undefined) {
                $popoverGoBtn.on('click', function () {
                    $popover.hide().attr("aria-hidden", "true").attr("hidden", "hidden");
                    $popoverGoBtn.attr("tabindex", "-1");
                    $closeBtn.attr("tabindex", "-1");
                    $link.attr("aria-expanded", "false");
                });
            }

            $closeBtn.on('click', function () {
                $popover.hide().attr("aria-hidden", "true").attr("hidden", "hidden");
                if ($tooltipGoBtn != undefined) {
                    $popoverGoBtn.attr("tabindex", "-1");
                }
                $closeBtn.attr("tabindex", "-1");
                $link.attr("aria-expanded", "false").focus();
            });
        }

        // ESC to close
        $(document).on('keydown', function (e) {
            if (e.key === "Escape") {
                if ($popover.is(':visible')) {
                    $popover.hide().attr("aria-hidden", "true").attr("hidden", "hidden");
                    $popoverGoBtn.attr("tabindex", "-1");
                    $closeBtn.attr("tabindex", "-1");
                    $link.attr("aria-expanded", "false").focus();
                }
                if ($tooltip.is(':visible')) {
                    $tooltip.removeClass('show').attr("aria-hidden", "true").attr("hidden", "hidden");
                }
            }
        });

        // Set ribbon direction
        setRibbonDirection($link);
    });
});

// One debounce timer for all events
var ribbonUpdateTimer;

// Debounced update
function debounceRibbonUpdate(eventType) {
    //debugLog(eventType);
    clearTimeout(ribbonUpdateTimer);
    ribbonUpdateTimer = setTimeout(() => {
        updateRibbons(eventType);
    }, 300);
}
//Always listen for orientation changes (important for iPad)
window.addEventListener("orientationchange", () =>
    debounceRibbonUpdate("orientationchange")
);

//If visualViewport supports resize → prefer it
if (window.visualViewport && typeof window.visualViewport.addEventListener === "function") {
    window.visualViewport.addEventListener("resize", () =>
        debounceRibbonUpdate("visualViewport")
    );

} else {
    //Fallback for non-WebKit or older browsers
    window.addEventListener("resize", () =>
        debounceRibbonUpdate("resize")
    );
}

// Update ribbons
function updateRibbons(eventType) {
    $('.hovered-ribbon a').each(function () {
        setRibbonDirection($(this));
        //$(this).append(`<span>${eventType}</span>`);
    });
}

function setRibbonDirection($link) {
    // Default: place tooltip on right side (ribbon pointing left)
    var directionClass = 'ribbon-right';
    var tooltipDirection = 'tooltip-left';
    var popoverDirection = 'popover-left';

    // Find nearest container that defines visible area
    var $container = $link.closest('p,li ,ul, ol, div, section, .page-container, [role="doc-pagebreak"], body').first();
    if ($container.length === 0) $container = $(window);

    var containerRect = $container[0].getBoundingClientRect();
    var linkRect = $link[0].getBoundingClientRect();

    var $tooltip = $link.siblings('.tooltip');
    var $popover = $link.siblings('.popover');
    var tooltipWidth = $tooltip.outerWidth() || 130;

    var cutoffPadding = 5;
    // Compute available space inside container
   // var availableRight = containerRect.right - linkRect.right;
    var availableLeft = linkRect.left - containerRect.left;

    // Flip to left side only if not enough space on the right
    if (availableLeft < (tooltipWidth + cutoffPadding)) {
        directionClass = 'ribbon-left';
        tooltipDirection = 'tooltip-right';
        popoverDirection = 'popover-right';
    }
    // Apply classes
    $link.parent().removeClass('ribbon-left ribbon-right').addClass(directionClass);
    $tooltip.removeClass('tooltip-left tooltip-right').addClass(tooltipDirection);
    $popover.removeClass('popover-left popover-right').addClass(popoverDirection);   
}

function setTooltipDirection($link){
    var $container = $link.closest('p,li ,ul, ol, div, section, .page-container, [role="doc-pagebreak"], body').first();
    if ($container.length === 0) $container = $(window);
    var $tooltip = $link.siblings('.tooltip');
    var tooltipHeight = $tooltip.outerHeight() || 120;
    var tooltipPanelPos = "pos-center";
    var tooltipPosMargin = tooltipHeight / 2;

    var winHeight = document.documentElement.clientHeight;
    var linkRect = $link[0].getBoundingClientRect();

    var linkTopPos = linkRect.top;
    //$link.append("<span>lt:"  + linkTopPos + "</span>");
    var linkBottomPos = (winHeight - linkRect.top - 45);

    if (linkTopPos > -10 && linkTopPos < winHeight) {
        if (linkTopPos < tooltipPosMargin) {
            tooltipPanelPos = "pos-top";
        } else if (linkBottomPos < tooltipPosMargin) {
            tooltipPanelPos = "pos-bottom";
        }
    }    
    $tooltip.removeClass('pos-center pos-top pos-bottom').addClass(tooltipPanelPos);
}

function setPoptipDirection($link){
    var $container = $link.closest('p,li ,ul, ol, div, section, .page-container, [role="doc-pagebreak"], body').first();
    if ($container.length === 0) $container = $(window);
    var $popover = $link.siblings('.popover');
    var popoverHeight = $popover.outerHeight() || 120;
    var popoverPanelPos = "pos-center";
    var popoverPosMargin = popoverHeight / 2;

    var winHeight = document.documentElement.clientHeight;
    var linkRect = $link[0].getBoundingClientRect();
    
    var linkTopPos = linkRect.top;
    var linkBottomPos = (winHeight - linkRect.top - 45);

    if (linkTopPos > -10 && linkTopPos < winHeight) {
        if (linkTopPos < popoverPosMargin) {
            popoverPanelPos = "pos-top";
        } else if (linkBottomPos < popoverPosMargin) {
            popoverPanelPos = "pos-bottom";
        }
    } 
    $popover.removeClass('pos-center pos-top pos-bottom').addClass(popoverPanelPos);
}

function debugLog(message) {
    //<div id="logMessages" style="font-size: 12px; color: #222; background: #f4f4f4; padding: 8px; margin: 10px 0; border: 1px solid #ccc; max-height: 200px; overflow-y: auto;"></div>
    var logDiv = document.getElementById('logMessages');
    if (!logDiv) return; // Exit if div not found

    // Format message
    var time = new Date().toLocaleTimeString();
    var formatted = `[${time}] ${message}`;

    // Create a new log entry
    var p = document.createElement('div');
    p.textContent = formatted;

    // Append it
    logDiv.appendChild(p);

    // Keep it scrolled to bottom
    logDiv.scrollTop = logDiv.scrollHeight;
}

function isTouchEnvironment() {
    var isTouchEnv = navigator.maxTouchPoints > 0;
    //debugLog("touch1: " + touch)
    //debugLog("navigator.userAgent: " + navigator.userAgent)
    if (navigator.userAgent.includes('Macintosh') && !navigator.userAgent.includes('Mobile')) {
        isTouchEnv = false;
    }
    /*
    const logDiv = document.getElementById('logmessages');
    if (logDiv) {
        logDiv.innerText += `maxTouchPoints: ${navigator.maxTouchPoints}\n`;
        logDiv.innerText += `UserAgent: ${navigator.userAgent}\n`;
        logDiv.innerText += `Final isTouch: ${isTouchEnv}\n`;
    }
    */

    return isTouchEnv;
}