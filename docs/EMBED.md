# Embedding an animation in another site

Build first:

```
python3 build.py
```

Copy `dist/electrolysis.html` to your revision site (any folder). Then:

```html
<iframe src="/animations/electrolysis.html?preset=brine"
        width="100%" height="640" style="border:0;border-radius:12px"
        allow="fullscreen"></iframe>
```

Inside an iframe the page switches to embed mode automatically (no header, no design panel).

## URL parameters

| Parameter | Values | Effect |
|---|---|---|
| `preset` | `molten-pbbr2` `molten-nacl` `molten-al2o3` `brine` `cuso4-inert` `cuso4-copper` `dilute-h2so4` | Starting electrolyte |
| `mode` | `embed` / `full` | Force embed or full UI |
| `controls` | `0` | Hide the teaching panel |
| `designer` | `1` | Show the design panel in embed mode |
| `autoplay` | `0` | Start paused |
| `guide` | `steps` / `study` / `free` | Step-by-step (default), study with questions, or free-running |
| `difficulty` | `easy` / `medium` / `hard` | Study mode question difficulty |
| `electrodes` | `one` / `both` | Step mode: one electrode at a time (default) or both together |
| `power` | `1` | Start with the power switched on (free mode) |
| `labels` | `formula` `name` `both` `none` | Ion label style |
| `equations` | `auto` `always` `off` | Half-equation display |
| `predict` | `1` | "Predict the products" mode |
| `design` | JSON | Design overrides, e.g. `design={"colour.background":"#000000"}` (URL-encode it) |

Any teaching control id works as a parameter.

## Driving it from the host page (optional)

```js
const frame = document.querySelector('iframe');
frame.contentWindow.postMessage({ cmd: 'preset', id: 'cuso4-copper' }, '*');
frame.contentWindow.postMessage({ cmd: 'control', id: 'power', value: true }, '*');
frame.contentWindow.postMessage({ cmd: 'play' }, '*');      // also: pause, step, reset
frame.contentWindow.postMessage({ cmd: 'speed', value: 2 }, '*');
window.addEventListener('message', e => {
  if (e.data && e.data.source === 'science-animations') console.log(e.data);  // {event:'ready'|'control'}
});
```

## Baking in your design

1. Open the Design panel, adjust colours and sizes.
2. Press **Export design**. It downloads `electrolysis.design.js`.
3. Replace `topics/electrolysis.design.js` with that file and run `python3 build.py` again.

Everyone who opens the built file now sees your design. Viewers can still tweak locally; their changes stay in their own browser.

## Offline on the iPad

- The built file needs no internet once it is open.
- If you host the `dist/` folder over https, open it once on the iPad, then "Add to Home Screen". It works with no signal afterwards.
- Without hosting: AirDrop `dist/electrolysis.html` to the iPad, save to Files, open it in Safari (long-press, Share, Safari).
