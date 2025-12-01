$(document).ready(function () {

    // Create ARIA live region once
    let $ariaLive = $('#ribbon-aria-live');
    if ($ariaLive.length === 0) {
        $ariaLive = $('<div id="ribbon-aria-live" aria-live="polite" aria-atomic="true"></div>')
            .css({
                position: 'absolute',
                width: '1px',
                height: '1px',
                overflow: 'hidden',
                opacity: 0,
                pointerEvents: "none"
            })
        $('body').append($ariaLive);
    }

    const isTouch = isTouchEnvironment();

    // ---------- TEMPLATE ELEMENTS ----------
    const tooltipTemplate = $(`
        <div class="tooltip" role="tooltip" aria-hidden="true" hidden="hidden">
            <div class="tooltip-text"></div>
            <div class="btn-cont"><a class="goto-btn"></a></div>
        </div>
    `);

    const popoverTemplate = $(`
        <div class="popover" role="dialog" aria-modal="false" aria-hidden="true" hidden="hidden">
            <div class="popover-text"></div>
            <div class="btn-cont">
                <a class="goto-btn"></a>
                <button class="close-btn">Close</button>
            </div>
        </div>
    `);

    // ---------- INITIALIZE LINKS ----------
    $('.hovered-ribbon a').each(function () {
        const $link = $(this);
        const id = $link.attr('id') || ("link" + Date.now().toString().slice(-7));
        const href = $link.attr('href');
        const text = $link.text();
        const hoveredObj = HoveredJSONData[id] || { content: "No content", width: "130px" };

        $link.attr({
            id,
            tabindex: '0',
            role: 'button',
            'aria-expanded': 'false',
            'aria-controls': `popover-${id}`
        });
        

        // Create tooltip & popover by cloning template
        const $tooltip = tooltipTemplate.clone().attr('id', `tooltip-${id}`).css("width", hoveredObj.width);
        const $popover = popoverTemplate.clone().attr('id', `popover-${id}`).css("width", hoveredObj.width);

        $tooltip.find('.tooltip-text').html(hoveredObj.content);
        $tooltip.find('.goto-btn').attr("href", href).text(text);

        $popover.find('.popover-text').html(hoveredObj.content);
        $popover.find('.goto-btn').attr("href", href).text(text);

        if (hoveredObj.auto_add_link !== true) {
            $tooltip.find('.btn-cont').remove();
            $popover.find('.goto-btn').remove();
        }

        $link.after($tooltip).after($popover);

        //Set ribbon direction only once here
        setRibbonDirection($link);
    });

    // ---------- DESKTOP EVENTS ----------
    if (!isTouch) {
        $(document).on('mouseenter focusin', '.hovered-ribbon a', function () {
            const id = this.id;
            const $tooltip = $(`#tooltip-${id}`);

            $('.tooltip').hide().attr("aria-hidden", true);

            //setRibbonDirection($(this));
            setTooltipDirection($(this));

            $tooltip.show().attr("aria-hidden", false).removeAttr("hidden");

            $ariaLive.text($tooltip.text());
            $(this).attr("aria-expanded", "true");
        });

        $(document).on('focusout', '.hovered-ribbon a', function () {
            $(`#tooltip-${this.id}`).hide().attr("aria-hidden", true);
            $(this).attr("aria-expanded", "false");
        });

        $(document).on('mouseleave', '.hovered-ribbon', function () {
            const linkId = $(this).data("link-id");
            $(this)
                .hide()
                .attr("aria-hidden", "true")
                .attr("hidden", "hidden");
        
            $(`#${linkId}`).attr("aria-expanded", "false");
        });
                
    }
    // ---------- TOUCH EVENTS ----------
    else {
        $(document).on('click', '.hovered-ribbon a', function (e) {
            e.preventDefault();
            const id = this.id;
            const $popover = $(`#popover-${id}`);

            $('.popover').hide().attr("aria-hidden", true);
            $('.hovered-ribbon a').attr("aria-expanded", "false");

            if (!$popover.is(':visible')) {
                //setRibbonDirection($(this));
                setPoptipDirection($(this));

                $popover.show().attr("aria-hidden", false).removeAttr("hidden");
                $(this).attr("aria-expanded", "true");

                const btn = $popover.find(".goto-btn")[0] || $popover.find(".close-btn")[0];
                btn.focus();

                $ariaLive.text($popover.text());
            }
        });

        $(document).on('click', '.popover .close-btn', function () {
            const $pop = $(this).closest('.popover');
            $pop.hide().attr("aria-hidden", true);

            const relatedLink = $(`a[aria-controls="${$pop.attr('id')}"]`);
            relatedLink.attr("aria-expanded", "false").focus();
        });
    }
});


$(document).on("keydown", function (e) {
    if (e.key !== "Escape") return;

    // Close all popovers
    $(".popover:visible").each(function () {
        const $pop = $(this);
        const popId = $pop.attr("id");
        const linkId = popId.replace("popover-", "");
        const $link = $("#" + linkId);

        // Hide popover
        $pop.hide().attr("aria-hidden", "true").attr("hidden", "hidden");

        // Restore tabindex inside popover
        $pop.find("[tabindex]").attr("tabindex", "-1");

        // Update link aria and focus
        $link.attr("aria-expanded", "false").focus();
    });

    // Close all visible tooltips
    $(".tooltip.show").each(function () {
        $(this).removeClass("show").attr("aria-hidden", "true").attr("hidden", "hidden");
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

    $link.addClass("hovered-link");

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
    var availableRight = containerRect.right - linkRect.right;
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