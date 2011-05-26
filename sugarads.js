SugarAds = {

    adDivCssClassName: 'sugarad',
    adDivIdPrefix: 'sugarad-',
    adDivWidthAttrib: 'data-sugar-ad_width',
    adDivHeightAttrib: 'data-sugar-ad_height',
    analytics: true,
    fifurl: '/sugarfif.html?1',
    stitialTimeout: 10000,
    randNum: 0,
    randLength: 12,
    ads: {},
    adJsUrls: {},

    renderAds: function (adTypes) {
        var adsToRender = [];
        // Do some input validation first
        switch (this._typeOf(adTypes)) {
            case 'undefined':
                // render all ads defined in adJsUrls
                for (adType in this.adJsUrls) {
                    adsToRender.push(adType);
                }
                break;
            case 'string':
                // turn this into an array and we'll process it like that
                adTypes = new Array(adTypes);
            case 'array':
                // only dealing with the array of types we were passed
                for (var i = 0, len = adTypes.length; i < len; i++) {
                    adsToRender.push(adTypes[i]);
                }
                break;
            default:
                console.warn('renderAds() expects no argument (refresh all ad types), a string (a single ad type), or an array (one or more ad types)');
        }
        this._flushAndPlaceAds(adsToRender);
    },

    initializePrestitial: function (continueLinkId, overlayId) {
        // First set a style on the page's html element so we have some style control for the overlay
        // This allows you to do things like hide flash objects so they don't screw your zindex
        document.getElementsByTagName('html')[0].className = 'sugarad-stitial-open';

        // Set the timeout for the prestitial
        this.prestitialTimer = setTimeout(
            function() { SugarAds.hidePrestitial(overlayId); },
            this.stitialTimeout
        );
    },

    hidePrestitial: function (overlayId) {
        // Clear the timer in case the overlay was manually closed
        clearTimeout(this.prestitialTimer);

        // Remove special style for the page
        document.getElementsByTagName('html')[0].className = '';

        // Hide the prestitial overlay
        document.getElementById(overlayId).style.display = 'none';

        // Fire page ads now
        this.renderAdsDelayedByStitial();
    },

    renderAdsDelayedByStitial: function () {
        // this is a callback function to be defined by stitial code. Only it knows which ads to render
    },

    setFifDim: function (frameElement,w,h) {
         frameElement.fifwidth=w;
         frameElement.fifheight=h;
    },

    fifOnload: function (frameWindow) {
        var timerStop = new Date().getTime();
        if (this.analytics) {
            _gaq.push([
                '_trackEvent',
                'Sugar Ads',
                frameWindow.frameElement.adtype,
                frameWindow.frameElement.adjsurl,
                timerStop - frameWindow.sugarTimerStart
            ]);
        }
        // track event call
        this.stylizeAdContainer(frameWindow);
    },

    stylizeAdContainer: function (frameWindow) {
        var frameElement = frameWindow.frameElement;
        frameElement.width = frameElement.fifwidth;
        frameElement.height = frameElement.fifheight;

        // Setting dimensions on the sugar div will make certain the size stays static
        // for client-side refreshes while the iframe is destroyed and replaced, avoiding page bounce
        frameElement.parentNode.style.width = ''+frameElement.fifwidth+'px';
        frameElement.parentNode.style.height = ''+frameElement.fifheight+'px';

        // if there is no content make sure we don't show it at all
        // This helps avoid weird vertical padding issues like margin on the sugar div
        if (frameElement.fifwidth == 0 && frameElement.fifheight == 0) {
            frameElement.parentNode.style.display = 'none';
        } else {
            frameElement.parentNode.style.display = 'block';
        }
    },

    _flushAndPlaceAds: function (adTypes) {
        this._randomizeAdJsUrls();
        var iframeSrcUrl = (this.fifurl != undefined && this.fifurl != '') ? this.fifurl : '/sugarfif.html';

        for (var i = 0, len = adTypes.length; i < len; i++) {
            var adType = adTypes[i];
            if (!this.adJsUrls.hasOwnProperty(adType)) {
                console.warn('Failed to render sugar ad. No ad js url has been defined for ad type "'+adType+'".');
                continue;
            }
            // fire away
            this._createAndAppendFriendlyIframe(
                adType,
                iframeSrcUrl,
                this.adJsUrls[adType]
            );
        }
    },

    // Create an iframe in the given element with the specified values
    _createAndAppendFriendlyIframe: function (adType, iframeSrcUrl, adJsUrl) {
        var adDivDomId = this.adDivIdPrefix+adType;
        var adContainer = document.getElementById(adDivDomId);
        if (this._typeOf(adContainer) == 'null') {
            console.warn('Failed to render sugar ad. No dom element with id "'+adDivDomId+'" exists.');
            return false;
        }

        // Clear the ad container element contents
        adContainer.innerHTML = '';

        // create iframe
        var adIframeId = adDivDomId+'-iframe';
        var iframe = document.createElement('iframe');
        iframe.id = adIframeId;
        iframe.name = adIframeId;
        iframe.src = iframeSrcUrl;
        iframe.style.border = '0px';
        iframe.width = 0;
        iframe.height = 0;
        iframe.scrolling = 'no';
        iframe.seamless = 'seamless'; // this is forward looking html5
        iframe.fifwidth = adContainer.getAttribute(this.adDivWidthAttrib);
        iframe.fifheight = adContainer.getAttribute(this.adDivHeightAttrib);
        iframe.adtype = adType;
        iframe.adjsurl = adJsUrl;
        // of course IE needs non-standard styling
        if (navigator.userAgent.indexOf("MSIE") == -1) {
            iframe.frameBorder = '0';
            iframe.allowtransparency = 'true';
        }
        // Append the iframe into ad container div
        adContainer.appendChild(iframe);
    },

    _randomizeAdJsUrls: function () {
        if (this.randNum == 0) {
            this.randNum = Math.floor(Math.random()*Math.pow(10, this.randLength));
        } else {
            this.randNum++;
        }
        var randQsKey = 'sugar-rand';
        var newQsKeyValue = randQsKey + '=' + this.randNum;
        var searchRegexp = new RegExp(randQsKey + '=\\d{' + this.randLength + '}', 'g');

        for (adType in this.adJsUrls) {
            var adJsUrl = this.adJsUrls[adType];
            var randQsKeyValue = adJsUrl.match(searchRegexp)
            // Do we already have a sugar-rand in the query string?
            if (randQsKeyValue != null) {
                this.adJsUrls[adType] = adJsUrl.replace(randQsKeyValue[0], newQsKeyValue); // simple, replace it
            } else {
                // nope, we need to put the sugar-rand in this url
                var questionPos = adJsUrl.search(/\?/);
                // if we already have a query string just throw it at the beginning of it
                if (questionPos != -1) {
                    this.adJsUrls[adType] = adJsUrl.replace('?', '?' + newQsKeyValue + '&');
                } else {
                    this.adJsUrls[adType] = adJsUrl.replace(/&*$/, '&' + newQsKeyValue); // otherwise tack it on the end
                }
            }
        }
    },

    // Enhanced typeof that deals with null and arrays, even in different frames. Always returns string value
    _typeOf: function (value) {
        var s = typeof value;
        if (s === 'object') {
            if (value) {
                if (typeof value.length === 'number' &&
                        !(value.propertyIsEnumerable('length')) &&
                        typeof value.splice === 'function') {
                    s = 'array';
                }
            } else {
                s = 'null';
            }
        }
        return s;
    }
}