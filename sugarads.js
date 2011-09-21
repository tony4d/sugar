SugarAds = {
    adDivCssClassName: 'sugarad',
    adDivIdPrefix: 'sugarad-',
    adIframeIdSuffix: '-iframe',
    adDivWidthAttrib: 'data-sugar-ad_width',
    adDivHeightAttrib: 'data-sugar-ad_height',
    analytics: false,
    fifurl: '/sugarfif.html?3',
    urlRandLength: 12,
    urlRandNum: 0,
    adsData: {},
    adCreatives: {},
    adJsUrls: {},
    stitialOverlayId: 'sugarad-stitial-overlay',
    stitialHtmlElementClass: 'sugarad-stitial-open',
    stitialTimeout: 10000,
    stitialAdType: false,
    adServer: false,
    adServers: {
        ignadwrapper: {
            getUrl: function (sugar, adsToFetch) {
                var data = sugar.adsData;
                var url = 'http://wrapper.ign.com/services/ads/pagetype/'+data.pagetype+'/sizes/'+adsToFetch.toString()+'.js?callback=?';

                // Propagate specials from the query string of the page
                var currentPageUrl = document.location;
                if (currentPageUrl.search.indexOf('special') != -1) {
                    var queryParams = currentPageUrl.search.substr(1).split('&');
                    for (var i = 0, len = queryParams.length; i < len; i++) {
                        if (queryParams[i].indexOf('special') != -1) {
                            url += '&'+queryParams[i];
                        }
                    }
                }

                // Add all the data on to the url
                for (var param in data) {
                    // the pagetype is already in the url so we don't need to put it in the query string
                    if (param == 'pagetype') {
                        continue;
                    }
                    var val = data[param];
                    // values can be arrays
                    if (sugar._isArray(val)) {
                        for (var i = 0, len = val.length; i < len; i++) {
                            url += '&'+param+'='+encodeURIComponent(val[i]);
                        }
                    } else {
                        url += '&'+param+'='+encodeURIComponent(val);
                    }
                }

                // always add the referrer if there is one
                var referrer = document.referrer;
                if (referrer != '') {
                    url += '&r='+encodeURIComponent(referrer);
                }
                return url;
            },
            jsonpCallback: function (sugar, adsToRender) {
                return function (json) {
                    var stitialSize = 'prestitial';
                    // Setup the ad creatives in the ads hash
                    for (var i = 0, len = json.length; i < len; i++) {
                        // Figure out if you have a stitial
                        if (json[i].size.substr(-7) == 'stitial') {
                            if (json[i].impressionTracker == false) {
                                // we have a real stitial ad
                                sugar.stitialAdType = stitialSize;
                                sugar.adCreatives[stitialSize] = json[i].creative;
                            } else {
                                sugar.adCreatives[stitialSize] = '';
                            }
                        } else {
                            sugar.adCreatives[json[i].size] = json[i].creative;
                        }
                    }
                    sugar._fetchAdsCallback(adsToRender);
                };
            }
        },
        dfp: {
            // TODO: setup dfp here
            getUrl: function (adsToFetch, data) {
                return 'http://example.com/ads/'+adsToFetch.toString()+'.jsonp';
            },
            jsonpCallback: function (sugar, adsToRender) {
                return function (json) {
                    // populate sugar.adCreatives with the ad creatives
                };
            }
        }
    },

    renderAds: function (adsToRender) {
        // This function expects an array of ad types, but gracefully handle a string anyway
        if (typeof adsToRender == 'string') {
            adsToRender = new Array(adsToRender);
        }

        // Time to make some $
        if (this.adServer != false) {
            this._renderAdCreatives(adsToRender);
        } else {
            this._renderAdJsUrls(adsToRender);
        }
    },

    showStitial: function () {
        // Set a style on the page's html element so we have some style control for the overlay
        // This allows you to do things like hide flash objects so they don't screw your zindex
        var htmlElement = document.getElementsByTagName('html')[0];
        var stitialOverlayElement = document.getElementById(this.stitialOverlayId);
        htmlElement.className = this.stitialHtmlElementClass;
        stitialOverlayElement.style.display = 'block'; // display the overlay

        // Set the timeout for the stitial
        this.stitialSetTimeout = setTimeout(
            (function(sugar) {
                return function() { sugar.hideStitial(); };
            })(this),
            this.stitialTimeout
        );
    },

    hideStitial: function () {
        // Clear the timer in case the overlay was manually closed
        clearTimeout(this.stitialSetTimeout);

        // Now we need to remove the special style for the page
        var htmlElement = document.getElementsByTagName('html')[0];
        var stitialOverlayElement = document.getElementById(this.stitialOverlayId);
        htmlElement.className = '';
        stitialOverlayElement.style.display = 'none'; // Hide the overlay

        // Fire page ads now
        this.renderAdsDelayedByStitial();
    },

    renderAdsDelayedByStitial: function () {
        // this is a callback function that will be defined in the case of a stitial
    },

    setFifDim: function (frameElement,w,h) {
        if (typeof w == 'number') frameElement.fifwidth = w;
        if (typeof h == 'number') frameElement.fifheight = h;
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
        this._stylizeAdContainer(frameWindow);
    },

    _stylizeAdContainer: function (frameWindow) {
        var frameElement = frameWindow.frameElement;

        // if there is no content make sure we don't show it at all
        // Note, this eliminates page layout bouncing caused by vertical padding or margin on the div
        if (frameElement.fifwidth == 0
            && frameElement.fifheight == 0
            && frameElement.parentNode.style.display != 'none') {
            frameElement.parentNode.style.display = 'none';
        } else {
            // Set dimensions on the iframe and then the div. This is required for client-side ad refreshes
            // We avoid page layout bouncing when the iframe is destroyed and replaced
            // Note, order is important, do the iframe before the div to avoid any bouncing
            frameElement.style.cssText += ';width:'+frameElement.fifwidth+'px;height:'+frameElement.fifheight+'px;';
            // Note that we actually change the display property here too just in case it is hidden right now
            frameElement.parentNode.style.cssText = 'width:'+frameElement.fifwidth+'px;height:auto;display:block;';
        }
    },

    _flushAndPlaceAds: function (adTypes) {
        for (var i = 0, len = adTypes.length; i < len; i++) {
            var adType = adTypes[i];


            if (this.adServer == false && !(adType in this.adJsUrls)) {
                this._warn('Failed to render sugar ad. No ad js url has been defined for ad type "'+adType+'".');
                continue;
            }
            if (this.adServer != false && !(adType in this.adCreatives)) {
                this._warn('Failed to render sugar ad. No ad creative has been defined for ad type "'+adType+'".');
                continue;
            }
            // fire away
            this._createAndAppendFriendlyIframe(adType);
        }
    },

    // Create an iframe in the given element with the specified values
    _createAndAppendFriendlyIframe: function (adType) {
        var adDivDomId = this.adDivIdPrefix+adType;
        var adContainer = document.getElementById(adDivDomId);
        if (typeof adContainer == 'undefined' || adContainer == null) {
            this._warn('Failed to render sugar ad. No dom element with id "'+adDivDomId+'" exists.');
            return false;
        }

        // avoid page bounce by saving the previous iframe height
        var adContainerIframe = document.getElementById(adDivDomId+this.adIframeIdSuffix);
        if (typeof adContainerIframe != 'undefined' && adContainerIframe != null
            && typeof adContainerIframe.fifheight != 'undefined' && adContainerIframe.fifheight != null) {
            adContainer.style.height = adContainerIframe.fifheight+'px';
        }

        // Clear the ad container element contents
        adContainer.innerHTML = '';

        // If we fetched an ad creative and there is no ad then we should not create a new iframe at all
        if (this.adServer != false && this.adCreatives[adType] == '') {
            // make sure to remove the ad from the hash so it is not used again though
            delete this.adCreatives[adType];
            return;
        }

        // create iframe
        var adIframeId = adDivDomId+this.adIframeIdSuffix;
        var iframe = document.createElement('iframe');
        iframe.id = adIframeId;
        iframe.name = adIframeId;
        iframe.src = this.fifurl;
        iframe.style.border = '0px';
        iframe.width = 0;
        iframe.height = 0;
        iframe.scrolling = 'no';
        iframe.seamless = 'seamless'; // this is forward looking html5
        iframe.fifwidth = adContainer.getAttribute(this.adDivWidthAttrib);
        iframe.fifheight = adContainer.getAttribute(this.adDivHeightAttrib);
        iframe.adtype = adType;
        if (this.adServer != false) {
            iframe.adcreative = this.adCreatives[adType];
            // remove ad from the hash so it is not used again
            delete this.adCreatives[adType];
        } else {
            iframe.adjsurl = this.adJsUrls[adType];
        }
        // of course IE needs non-standard styling
        if (navigator.userAgent.indexOf("MSIE") != -1) {
            iframe.frameBorder = '0';
            iframe.allowTransparency = 'true';
        }
        // Append the iframe into ad container div
        adContainer.appendChild(iframe);
    },

    _renderAdCreatives: function (adsToRender) {
        var adsToFetch = [];
        // We're only gonna fetch ads we don't have already
        for (var i = 0, len = adsToRender.length; i < len; i++) {
            if (!(adsToRender[i] in this.adCreatives)) {
                adsToFetch.push(adsToRender[i]);
            }
        }

        // Only fetch ads if we have some to fetch
        if (adsToFetch.length > 0) {
            this._jsonp(
                this.adServers[this.adServer].getUrl(this, adsToFetch),
                this.adServers[this.adServer].jsonpCallback(this, adsToRender)
            );
        } else {
            this._fetchAdsCallback(adsToRender);
        }
    },

    _renderAdJsUrls: function (adsToRender) {
        this._randomizeAdJsUrls();
        this._flushAndPlaceAds(adsToRender);
    },

    _fetchAdsCallback: function(adsToRender) {
        if (this.stitialAdType != false) {
            // When there is a stitial, first setup a callback that will render
            // all other ads when the stitial is hidden
            var delayedAdsToRender = [];
            for (var i = 0, len = adsToRender.length; i < len; i++) {
                var adToRender = adsToRender[i];
                // we're creating an array of ads to render not including the stitial
                if (adToRender != this.stitialAdType) {
                    delayedAdsToRender.push(adToRender);
                }
            }
            this.renderAdsDelayedByStitial = (function (sugar) {
                return function () { sugar._flushAndPlaceAds(delayedAdsToRender); };
            })(this);

            // now, just flush and place the stitial ad
            this._flushAndPlaceAds([this.stitialAdType]);
            // make sure the stitial doesn't run again
            this.stitialAdType = false;

            // and finally show the stitial
            this.showStitial();
        } else {
            // if no stitial ad to show just render all ads
            this._flushAndPlaceAds(adsToRender);
        }
    },

    _randomizeAdJsUrls: function () {
        if (this.urlRandNum == 0) {
            this.urlRandNum = Math.floor(Math.random()*Math.pow(10, this.urlRandLength));
        } else {
            this.urlRandNum++;
        }
        var randQsKey = 'sugar-rand';
        var newQsKeyValue = randQsKey + '=' + this.urlRandNum;
        var searchRegexp = new RegExp(randQsKey + '=\\d{' + this.urlRandLength + '}', 'g');

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

    _jsonp: function(url, callback) {
        // do some validation on the input
        if (url.indexOf('=?') == -1) {
            this._warn('The sugar jsonp url must specify the callback function in the query string i.e. callback=?');
            return;
        }
        if (typeof callback != 'function') {
            this._warn('The sugar jsonp callback must be a function');
            return;
        }
        var randFunctionName = 'jsonp'+Math.floor(Math.random()*10000000000);

        // Setup the callback function that will be called when the external script executes
        // Note the function ends up cleaning itself up since we just need to call the real callback
        window[randFunctionName] = function(json) {
            callback(json);
            // ie doesn't allow deleting props on thw window object
            try {
                delete window[randFunctionName];
            } catch(e) {
                window[randFunctionName] = undefined;
            }
        };

        // Fetch the external script and get the json
        var jsonp = document.createElement('script');
        jsonp.src = url.split('=?').join('='+randFunctionName);
        document.getElementsByTagName('head')[0].appendChild(jsonp);
    },

    _isArray: function (o) {
      return Object.prototype.toString.call(o) === '[object Array]';
    },

    _warn: function (msg) {
        if (window.console && console.warn) {
            console.warn(msg);
        }
    }
}