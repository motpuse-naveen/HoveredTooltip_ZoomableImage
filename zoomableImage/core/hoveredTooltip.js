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

    // Initialize ribbons
    $('.hovered-ribbon a').each(function() {
        var $link = $(this);
        var id = $link.attr('id');
        var $linkhref = $link.attr('href');
        var $linktext = $link.text();
        var hoveredObj = HoveredJSONData[id] || {content: "No content", width: "130px"};

        // Tooltip
        var $tooltip = $('<div class="tooltip" role="tooltip"></div>')
            .attr("id", "tooltip-" + id)
            .css("width", hoveredObj.width);
        var $tooltipText = $('<div class="tooltip-text"></div>').html(hoveredObj.content);
        var $tooltipGoBtn = $(`<a class="goto-btn">${$linktext}</a>`).attr("href", $linkhref);
        var $tooltipGoBtnCnt = $('<div class="btn-cont"></div>').append($tooltipGoBtn);
        $tooltip.append($tooltipText, $tooltipGoBtnCnt);

        // Popover
        var $popover = $('<div class="popover" role="dialog" aria-modal="false" aria-hidden="true"></div>')
            .attr("id", "popover-" + id)
            .css("width", hoveredObj.width);
        var $popText = $('<div class="popover-text"></div>').html(hoveredObj.content);
        var $popoverGoBtn = $(`<a class="goto-btn">${$linktext}</a>`).attr("href", $linkhref);
        var $closeBtn = $('<button class="close-btn">Close</button>');
        var $BtnCnt = $('<div class="btn-cont"></div>').append($popoverGoBtn, $closeBtn);
        $popover.append($popText, $BtnCnt);

        // Set ARIA attributes on link
        $link.attr({
            "aria-describedby": "tooltip-" + id,
            "aria-haspopup": "true",
            "aria-controls": "popover-" + id,
            "aria-expanded": "false"
        });
        $link.addClass("hovered-link")

        // Append tooltip and popover
        $link.parent().append($tooltip, $popover);

        // Call direction function once on init
        setRibbonDirection($link);

        // Tooltip: announce on hover/focus
        $link.on('mouseenter focus', function() {
            $ariaLive.text(hoveredObj.content);
        });

        if (isTouch) {
            $link.on('touchstart click', function(e) {
                e.preventDefault();  // prevent default link navigation
        
                var isVisible = $popover.is(':visible');
        
                // Hide all other popovers/tooltips
                $('.popover').hide().attr("aria-hidden", "true");
                $('.tooltip').hide();
                $('.hovered-ribbon a').attr("aria-expanded", "false");
        
                if (!isVisible) {
                    $popover.show().attr("aria-hidden", "false");
                    $link.attr("aria-expanded", "true");
                    $popoverGoBtn.focus();
                    $ariaLive.text(hoveredObj.content);
                }
            });
        }
        
                

        // Go To button navigates
        
        $tooltipGoBtn.on('click', function() {
            //window.location.href = $link.attr('href');
        });
        $popoverGoBtn.on('click', function() {
            //window.location.href = $link.attr('href');
            $popover.hide().attr("aria-hidden", "true");
            $link.attr("aria-expanded", "false").focus();
        });
        

        // Close popover
        $closeBtn.on('click', function() {
            $popover.hide().attr("aria-hidden", "true");
            $link.attr("aria-expanded", "false").focus();
        });

        // ESC to close popover (return focus only to active link)
        $(document).on('keydown', function(e) {
            if (e.key === "Escape" && $popover.is(':visible')) {
                $popover.hide().attr("aria-hidden", "true");
                $link.attr("aria-expanded", "false").focus();
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
        }, 100); // debounce
    });

});

// Function to set ribbon-left/ribbon-right dynamically
function setRibbonDirection($link) {
    var offset = $link.offset();
    var linkWidth = $link.outerWidth();
    var viewportWidth = $(window).width();
    // Update tooltip/popover arrow classes
    var $tooltip = $link.siblings('.tooltip');
    var $popover = $link.siblings('.popover');
    var directionClass = 'ribbon-left';
    //if ((offset.left + linkWidth + 20) > viewportWidth / 2) {
    if ((offset.left) > ($tooltip.width() + 20)) {
        directionClass = 'ribbon-right';
    }

    // Update parent class
    $link.parent().removeClass('ribbon-left ribbon-right').addClass(directionClass);



    if (directionClass === 'ribbon-left') {
        $tooltip.removeClass('tooltip-right').addClass('tooltip-left');
        $popover.removeClass('popover-right').addClass('popover-left');
    } else {
        $tooltip.removeClass('tooltip-left').addClass('tooltip-right');
        $popover.removeClass('popover-left').addClass('popover-right');
    }
}
