# bootstrap-2.3.2-tooltip-fix
Bootstrap 2.3.2 Tooltip: fixed widget positioning

Completely reworked positioning mechanism of tooltips. Tooltips no longer overflow out of the window, and keep their position during window scrolling and resizing.

### Installation

Plugin was tested with jQuery 1.11.1.

JS part of this jQuery widget is completely independent.
You don't need to include old Bootstrap Tooltip plugin.

BUT the CSS file contains only fixes of original Bootstrap styles and Bootstrap 2.3.2 CSS library is required.

In order to make this work, style and script files must be included after jQuery and Bootstrap files.

```html
<html>
  <head>
    <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/2.3.2/css/bootstrap.min.css">
    <!-- after Bootstrap files -->
    <link rel="stylesheet" type="text/css" href="bootstrap-2.3.2-tooltip-fix.css">
  </head>
  <body>
    <script src="https://code.jquery.com/jquery-1.11.1.min.js"></script>

    <!-- there can be another original Bootstrap JS libs -->

    <script src="bootstrap-tooltip.js"></script>
  </body>
</html>
```

### Bootstrap Popover

JS file includes definition of original Bootstrap Popover plugin.
This is needed to make Bootstrap Popover plugin work on the base of new Tooltip plugin.

Nothing was changed, it's just a copy of original plugin.

### Full list of changes:
- no more overflow out of window/document;
- added default placement functions, which change placement to opposite if tooltip does not fit;
- added recalculation of position on window scroll and resize;
- fixed bugs for IE8 support;
- added `reposition` method for manual triggering of position recalculation;
- added "*-edge" styles for tooltip arrow.

### Compatibility

Some methods inside widget was deleted or replaced with new ones, but the public API was not changed.

Deleted methods:
- `applyPlacement` (replaced with `applyPosition`, signature was changed too);
- `getPosition` (`getElementRect` function added instead);
- `replaceArrow` (replaced with `moveArrow`).

Completely new methods:
- `inner` - just like the `arrow` returns tooltip-inner element;
- `getPlacementFunction` - returns placement function or default one;
- `topPlacement`, `leftPlacement`, `rightPlacement`, `bottomPlacement` - default placement functions;
- `reposition` - trigger recalculation of tooltip position;

### `recalculation` method

Now, it is possible to manually trigger recalculation of tooltip position, for example, on parent div scroll or on target element move events

```js
$(document).on('input', '#slider', function () {
  $('#slider_target')
    .css('margin-left', this.value + 'px')
    .tooltip('reposition');
})
```

![Slider example](https://i.imgur.com/LiE58U9.gif)

### Quick preview

![Scroll example](https://i.imgur.com/0awPdES.gif)

You can [try it yourself on exaple page](https://drankuser.github.io/bootstrap-2.3.2-tooltip-fix/)
