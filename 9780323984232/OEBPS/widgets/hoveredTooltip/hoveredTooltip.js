$(document).ready(function() {
    // Check if the ARIA live region exists; if not, create it
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

    $('.hovered-ribbon a').each(function() {
        var $link = $(this);
        var id = $link.attr('id');
        var hoveredObj = HoveredJSONData[id] || {content: "No content", width: "auto"};

        // Tooltip
        var $tooltip = $('<div class="tooltip" role="tooltip"></div>')
            .attr("id", "tooltip-" + id)
            .css("max-width", hoveredObj.width)
            .html(hoveredObj.content);

        // Popover
        var $popover = $('<div class="popover" role="dialog" aria-modal="false" aria-hidden="true"></div>')
            .attr("id", "popover-" + id)
            .css("max-width", hoveredObj.width);

        var $popText = $('<div class="popover-text"></div>').html(hoveredObj.content);
        var $goBtn = $('<button class="goto-btn">Go To</button>');
        var $closeBtn = $('<button class="close-btn">Close</button>');

        $popover.append($popText, $goBtn, $closeBtn);

        // Set ARIA attributes on link
        $link.attr({
            "aria-describedby": "tooltip-" + id,
            "aria-haspopup": "true",
            "aria-controls": "popover-" + id,
            "aria-expanded": "false"
        });

        // Append tooltip and popover
        $link.parent().append($tooltip, $popover);

        // Desktop: tooltip hover/focus
        $link.on('mouseenter focus', function() {
            $ariaLive.text(hoveredObj.content); // announce tooltip
        });

        // Touch: click toggles popover
        $link.on('click keydown', function(e) {
            var isTouch = window.matchMedia("(hover: none)").matches;

            if (isTouch && (e.type === "click" || (e.type === "keydown" && (e.key === "Enter" || e.key === " ")))) {
                e.preventDefault();
                var isVisible = $popover.is(':visible');

                // Hide all popovers first
                $('.popover').hide().attr("aria-hidden", "true");
                $('.hovered-ribbon a').attr("aria-expanded", "false");

                if (!isVisible) {
                    $popover.show().attr("aria-hidden", "false");
                    $link.attr("aria-expanded", "true");
                    $goBtn.focus();

                    // ARIA announcement
                    $ariaLive.text(hoveredObj.content);
                }
            }
        });

        // "Go To" button navigates
        $goBtn.on('click', function() {
            window.location.href = $link.attr('href');
        });

        // Close popover
        $closeBtn.on('click', function() {
            $popover.hide().attr("aria-hidden", "true");
            $link.attr("aria-expanded", "false").focus();
        });

        // ESC to close
        $(document).on('keydown', function(e) {
            if (e.key === "Escape") {
                $('.popover').hide().attr("aria-hidden", "true");
                $('.hovered-ribbon a').attr("aria-expanded", "false").focus();
            }
        });
    });
});
