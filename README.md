# bootstrap-2.3.2-tooltip-fix
Bootstrap 2.3.2 Tooltip widget positioning fixes and improvements

Completely reworked positioning mechanism of tooltips. Now tooltips does not overflow out of window and keeps their position during window scroll or resize.

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

Now, it is possible to manually trigger recalculation of tooltip, for example, on parent div scroll or on target element move events

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
