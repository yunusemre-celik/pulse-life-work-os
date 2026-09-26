---
name: ios-pwa-design
description: >-
  iOS Human Interface Guidelines (HIG) and PWA mobile design principles for Antigravity.
  Enforces safe-area-inset handling (notch, Dynamic Island, home bar), 44pt touch targets,
  translucent blur headers, responsive thumb zones, and iOS Safari WebKit quirks.
---

# iOS PWA & Mobile Ergonomics Design Skill

This skill guides the design, layout, and implementation of Progressive Web Apps (PWAs) and mobile web interfaces specifically tailored for iPhone (iOS Safari & Standalone PWA mode).

## 1. Safe Area Inset Rules (Notch & Dynamic Island)

iOS devices feature hardware cutouts (Notch on iPhone X-14, Dynamic Island on iPhone 14 Pro, 15, 16) and a bottom Home Indicator bar.

### Essential Viewport Meta Tag
Always ensure `viewport-fit=cover` is declared in `<head>` or Next.js `Viewport`:
```tsx
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};
```

### Safe Area CSS Variables
Never place fixed/sticky top or bottom elements with raw `top: 0` or `top: 12px` without safe-area math:
- **Top Safe Area**: `padding-top: max(12px, env(safe-area-inset-top, 0px))`
- **Bottom Safe Area**: `padding-bottom: max(16px, env(safe-area-inset-bottom, 16px))`
- **Left/Right Safe Area (Landscape)**: `padding-left: env(safe-area-inset-left, 0px)`

### Why raw `top-3` fails on iPhone:
In standalone PWA mode with `black-translucent` status bar, the browser window starts at physical (0, 0).
- iPhone Notch safe-area is **47px**.
- iPhone Dynamic Island safe-area is **59px**.
- Any element placed at `top-3` (12px) will be rendered behind the battery icon, wifi icon, or hardware cutout, becoming completely invisible and unclickable!

## 2. iOS Header Design Architecture

Standard iOS pattern for top headers in mobile web:
```tsx
<header
  className="sticky top-0 z-30 w-full bg-white/85 dark:bg-[#141414]/85 backdrop-blur-xl border-b border-neutral-200/80 dark:border-neutral-800/80 select-none"
  style={{
    paddingTop: 'max(8px, env(safe-area-inset-top, 0px))',
  }}
>
  <div className="h-12 px-4 flex items-center justify-between">
    {/* Navigation Title / Logo */}
    <div className="flex items-center gap-2">...</div>
    {/* Actions with proper tap targets */}
    <div className="flex items-center gap-1.5">...</div>
  </div>
</header>
```

## 3. Apple Human Interface Guidelines (HIG) Touch Targets

1. **Minimum Touch Size**: Every clickable icon or button must have at least **44x44pt** (or minimum **36x36px** with generous padding).
2. **Visual Feedback**: Use subtle scale-down on active press: `active:scale-95 transition-all duration-150`.
3. **No Tap Delay / Highlight**: Disable gray WebKit tap box:
   `-webkit-tap-highlight-color: transparent;`
   `touch-action: manipulation;`

## 4. Modal & Bottom Sheet Ergonomics on iOS

1. Modals on mobile should either slide up from the bottom (iOS Bottom Sheet pattern) or be padded with safe-areas:
   `style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 16px)' }}`
2. Avoid fixed inputs that get hidden behind the virtual keyboard; use flex containers with scrollable bodies.
3. Form input font size must be at least `16px` (e.g. `text-base` or `text-[16px]` on mobile) to prevent iOS Safari from automatically zooming into the field when focused.

## 5. Bottom Navigation Bar Guidelines

1. Bottom nav bars must stay above the iOS home indicator:
   `padding-bottom: max(10px, env(safe-area-inset-bottom, 16px))`
2. Standard height is 49-56px excluding the home indicator padding.
3. Max 5 to 7 primary tabs with clear iconography and legible micro-labels.
