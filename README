# Sugar is ad delivery that doesn't suck

## Enabling sugar in your web pages

Include the js library

```html
<script src="sugarads.js"></script>
```

Define your js ad urls

```html
<script>
SugarAds.adJsUrls['728x90'] = ""http:\/\/example.com\/ad.js?size=728x90&var1=val1&var2=val2";
SugarAds.adJsUrls['300x250'] = "http:\/\/example.com\/ad.js?size=300x250&var1=val1&var2=val2";
<script>
```

Place ad div in your page where the ads should render

```html
<div id="sugarad-728x90" class="sugarad" data-sugar-ad_width="728" data-sugar-ad_height="90"></div>
<div id="sugarad-300x250" class="sugarad" data-sugar-ad_width="300" data-sugar-ad_height="250"></div>
```
Now you can render and refresh the ads at anytime

```html
<script>
<!-- Render both ads -->
SugarAds.renderAds(["728x90","300x250"]);
<!-- Or, pass nothing and all ads will render -->
SugarAds.renderAds();

<!-- Render just one -->
SugarAds.renderAds(["728x90"]);
<!-- Fir just one ad a string is ok too -->
SugarAds.renderAds("728x90");

<!-- Render all ads at the domcontentready event (using jquery here) -->
jQuery(document).ready(function(){SugarAds.renderAds();});
</script>