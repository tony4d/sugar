# What is Sugar?

Sugar is a flexible and powerful client-side display ad solution that allows you to take control of the ads in your web pages.

## Control
1. Sugar allows you to render display ads during page load, at different dom events, and even after onload. Since sugar uses friendly iframes for ad containers you do not need to worry about ads that contain document.write over-writing your pages after onload. Now you can monetize rich ajax applications.

## Performance
1. As noted under control, since ad rendering can be completely decoupled from the page rendering you are able to defer ad loads so that users get to the content in your web pages first. The key is the friendly iframe containers that give the ultimate flexibility to load ads asynchronously in your web pages.

2. In ad server mode, sugar is able to make a single http request to fetch all ads at once. For example, if you have a web page with 3 display ads then sugar will eliminate 2 client side calls to the ad server. Effectively, ad serving becomes O(1) vs traditional O(n).

3. Ad load performance analytics is built in. As a configurable option you can send ad performance data into google analytics.

## Flexibility
1. Using a simple configuration sugar can work with either traditional js embeds for each ad or in ad server mode using jsonp where a single http request fetches all ads at once.

2. Sugar is extensible so you can easily define your ad server if it's not supported. Currently sugar supports these ad servers out of the box: IGN proprietary Ad Wrapper (Google's DFP is planned and in development now).


# Enabling sugar in your web pages

* First, add sugarfif.html to the root of your domain(s) where you serve your html pages. Note, you should set cache control max-age to a very high value for this document. You do not want clients downloading this more than once. If you're using apache here is a sample configuration that would work well (this means clients will cache this in their browser for 1 year, effectively forever):

```
<Files sugarfif.html>
  Header set Cache-Control max-age=31536000
</Files>
```

* Include the js library

```html
<script src="sugarads.js"></script>
```

* If you want to use traditional js embeds for O(n) ad serving you need to set the adServer property to false and define your js ad urls:

```html
<script>
SugarAds.adServer = false;
SugarAds.adJsUrls['728x90'] = "http:\/\/example.com\/ad.js?size=728x90&var1=val1&var2=val2";
SugarAds.adJsUrls['300x250'] = "http:\/\/example.com\/ad.js?size=300x250&var1=val1&var2=val2";
</script>
```

* If you want to use ad server mode and fetch all ads using jsonp for O(1) ad serving you need to set the adServer property to the appropriate supported ad server:

```html
<script>
SugarAds.adServer = 'ignadwrapper';
</script>
```

* Place ad divs in your page where the ads should render

```html
<div id="sugarad-728x90" class="sugarad" data-sugar-ad_width="728" data-sugar-ad_height="90"></div>
<div id="sugarad-300x250" class="sugarad" data-sugar-ad_width="300" data-sugar-ad_height="250"></div>
```

* Now you can render and refresh the ads at anytime

```html
<script>
// Render both ads
SugarAds.renderAds(["728x90","300x250"]);
// Render just one ad
SugarAds.renderAds(["728x90"]);
// For just one ad, a string is fine too
SugarAds.renderAds("728x90");

// Render all ads at the domcontentready event (using jquery here)
jQuery(document).ready(function(){SugarAds.renderAds();});
// onload event is fine too, have no fear of document.write it is not a problem
jQuery(window).load(function(){SugarAds.renderAds();});
</script>
```

# Planned Features

1. Google DFP ad server support (very soon).
2. Support asynchronous javascript library downloading. This includes completely changing the api interfaces to queue up calls similar to how google analytics works.
3. Data and analysis on how sugar.js impacts ad impressions, user engagement, bounce rate, etc
4. Better and more optimized analytics (maybe we can abstract analytics to support more systems beyond google analytics)

# License

(The MIT License)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.