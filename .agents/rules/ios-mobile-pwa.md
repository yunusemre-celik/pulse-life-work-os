# iOS Mobile & PWA Rules for Antigravity

- **Always apply safe area insets on mobile top elements**:
  Use `padding-top: max(8px, env(safe-area-inset-top, 0px))` or `top: max(12px, calc(env(safe-area-inset-top, 0px) + 8px))` for any top controls, never hardcode `top-2`, `top-3`, or `top-4` on mobile fixed elements.
- **Never allow content to slip behind notch / Dynamic Island**:
  Mobile headers must have translucent backdrop (`backdrop-blur-xl bg-white/80 dark:bg-[#141414]/80`) extending into the top safe area.
- **Ensure minimum touch target size (44x44pt / 36x36px minimum)**:
  All mobile interactive icon buttons must have `w-8 h-8` or `w-9 h-9` with tap padding and active state `active:scale-95`.
- **Bottom Navigation Safe Area**:
  Always pad bottom nav bars with `paddingBottom: 'max(10px, env(safe-area-inset-bottom, 16px))'`.
- **Input Zoom Prevention**:
  Mobile input fields should have `text-base` or `text-[16px]` to prevent iOS Safari auto-zoom on focus.
