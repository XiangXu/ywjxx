---
layout: post
title:  Target="_blank" - the most underestimated vulnerability ever
date:   2021-02-13 22:40
image:  computer_network.jpg
tags:   [Fundation, HTML, Security]
---

People using `target = '_blank'` links usually have no idea about this curious face: **The page we're linking to gains partial access to linking page via window.opener object**.

The newly opened tab can then change the **window.opener.location** to some phishing page. Users trust the page that is already opened, they won't get suspicious.

Example:

1. Create a fake "viral" page with cute cat pictures, jokes or whatever, get it shared on Facebook (which is known for opening links via _blank).
2. Create a "phishing" website at https://fakewebsite/facebook.com/page.html for example.
3. Put this code on your "viral" page `window.opener.location = 'https://fakewebsite/facebook.com/page.html';`, which redirects the Facebook tab to your phishing page, asking the user to re-enter her Facebook password.

## How to fix?

```javascript
rel="noopener noreferrer"

var newWnd = window.open();
newWnd.opener = null;
```