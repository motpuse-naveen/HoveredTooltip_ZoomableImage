$(document).ready(function() {
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

    var isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    $('.hovered-ribbon a').each(function() {
        var $link = $(this);
        var id = $link.attr('id');
        var href = $link.attr('href');
        var text = $link.text();
        var hoveredObj = HoveredJSONData[id] || { content: "No content", width: "130px" };

        // Tooltip (desktop)
        var $tooltip = $('<div class="tooltip" role="tooltip"></div>')
            .attr("id", "tooltip-" + id)
            .css("width", hoveredObj.width);
        var $tooltipText = $('<div class="tooltip-text"></div>').html(hoveredObj.content);
        var $tooltipGoBtn = $(`<a class="goto-btn" tabindex="-1">${text}</a>`).attr("href", href);
        $tooltip.append($tooltipText, $('<div class="btn-cont"></div>').append($tooltipGoBtn));

        // Popover (touch)
        var $popover = $('<div class="popover" role="dialog" aria-modal="false" aria-hidden="true" hidden="hidden"></div>')
            .attr("id", "popover-" + id)
            .css("width", hoveredObj.width);
        var $popText = $('<div class="popover-text"></div>').html(hoveredObj.content);
        var $popoverGoBtn = $(`<a class="goto-btn">${text}</a>`).attr("href", href).attr("tabindex", "-1");
        var $closeBtn = $('<button class="close-btn" tabindex="-1">Close</button>');
        $popover.append($popText, $('<div class="btn-cont"></div>').append($popoverGoBtn, $closeBtn));

        // Append tooltip and popover
        $link.parent().append($tooltip, $popover);

        // Set ARIA
        $link.attr({
            "aria-labelledby": "tooltip-" + id,
            "aria-controls": "popover-" + id,
            "aria-expanded": "false"
        }).addClass("hovered-link");

        // Set ribbon direction
        setRibbonDirection($link);

        // --- DESKTOP: Tooltip ---
        if (!isTouch) {
            
            $link.on('mouseenter focus', function() {
                $tooltip.addClass('show').attr("aria-hidden", "false").removeAttr("hidden");
                var plainText = $('<div>').html(hoveredObj.content).text();
                $ariaLive.text(plainText);
                $link.attr("aria-expanded", "true");
            });

            $link.on('blur', function() {
                $tooltip.removeClass('show').attr("aria-hidden", "true").attr("hidden", "hidden");
                $link.attr("aria-expanded", "false");
            });

            $tooltip.on('mouseleave blur', function() {
                $tooltip.removeClass('show').attr("aria-hidden", "true").attr("hidden", "hidden");
                $link.attr("aria-expanded", "false");
            });

            $tooltipGoBtn.on('click', function() {
                // Navigation if needed
                $tooltip.removeClass('show').attr("aria-hidden", "true").attr("hidden", "hidden");
                $link.attr("aria-expanded", "false");
            });            
        }

        // --- TOUCH: Popover ---
        if (isTouch) {
            $link.on('click', function(e) {
                e.preventDefault();
                var isVisible = $popover.is(':visible');

                // Hide all other popovers/tooltips
                $('.popover').hide().attr("aria-hidden", "true").attr("hidden", "hidden");
                $('.tooltip').removeClass('show').attr("aria-hidden", "true").attr("hidden", "hidden");
                $('.hovered-ribbon a').attr("aria-expanded", "false");

                if (!isVisible) {
                    $popover.show().attr("aria-hidden", "false").removeAttr("hidden");
                    $popoverGoBtn.removeAttr("tabindex");
                    $closeBtn.removeAttr("tabindex");
                    $link.attr("aria-expanded", "true");
                    $popoverGoBtn.focus();

                    var plainText = $('<div>').html(hoveredObj.content).text();
                    $ariaLive.text(plainText);
                }
            });

            $popoverGoBtn.on('click', function() {
                $popover.hide().attr("aria-hidden", "true").attr("hidden", "hidden");
                $popoverGoBtn.attr("tabindex", "-1");
                $closeBtn.attr("tabindex", "-1");
                $link.attr("aria-expanded", "false");
            });

            $closeBtn.on('click', function() {
                $popover.hide().attr("aria-hidden", "true").attr("hidden", "hidden");
                $popoverGoBtn.attr("tabindex", "-1");
                $closeBtn.attr("tabindex", "-1");
                $link.attr("aria-expanded", "false").focus();
            });
        }

        // ESC to close
        $(document).on('keydown', function(e) {
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
    });

    // Update ribbon directions on resize/orientation change
    let resizeTimeout;
    $(window).on('resize orientationchange', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            $('.hovered-ribbon a').each(function() {
                setRibbonDirection($(this));
            });
        }, 100);
    });
});

// Set tooltip/popover direction
function setRibbonDirection($link) {
    var offset = $link.offset();
    var viewportWidth = $(window).width();
    var $tooltip = $link.siblings('.tooltip');
    var $popover = $link.siblings('.popover');
    var directionClass = (offset.left > ($tooltip.width() + 20)) ? 'ribbon-right' : 'ribbon-left';

    $link.parent().removeClass('ribbon-left ribbon-right').addClass(directionClass);

    if (directionClass === 'ribbon-left') {
        $tooltip.removeClass('tooltip-right').addClass('tooltip-left');
        $popover.removeClass('popover-right').addClass('popover-left');
    } else {
        $tooltip.removeClass('tooltip-left').addClass('tooltip-right');
        $popover.removeClass('popover-left').addClass('popover-right');
    }
}
