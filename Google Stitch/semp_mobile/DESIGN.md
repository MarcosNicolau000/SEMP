---
name: SEMP Mobile
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#4c4354'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#7e7385'
  outline-variant: '#cfc2d6'
  surface-tint: '#832ad3'
  primary: '#6200a9'
  on-primary: '#ffffff'
  primary-container: '#7e22ce'
  on-primary-container: '#e4c5ff'
  inverse-primary: '#ddb8ff'
  secondary: '#bb0112'
  on-secondary: '#ffffff'
  secondary-container: '#e02928'
  on-secondary-container: '#fffbff'
  tertiary: '#004d33'
  on-tertiary: '#ffffff'
  tertiary-container: '#006746'
  on-tertiary-container: '#5beaad'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#f0dbff'
  primary-fixed-dim: '#ddb8ff'
  on-primary-fixed: '#2c0051'
  on-primary-fixed-variant: '#6800b4'
  secondary-fixed: '#ffdad6'
  secondary-fixed-dim: '#ffb4ab'
  on-secondary-fixed: '#410002'
  on-secondary-fixed-variant: '#93000b'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: '0'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: '0'
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
  numeric-pin:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '500'
    lineHeight: 36px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.25rem
---

## Brand & Style

The design system operates under an imperative of dual nature: **Absolute Protective Efficacy** during crisis, and **Unobtrusive Discretion** during everyday life. It is engineered specifically for women carrying court-ordered protective measures (*medidas protetivas*), demanding an interface that shifts instantly between reassuring institutional protection and an unidentifiable utility camouflage.

### Brand Personality & Emotional Intent
- **Vigilant & Unfailing:** The UI must convey immediate, latency-free responsiveness. In an emergency, there is zero tolerance for cognitive friction, visual ambiguity, or decorative delays.
- **Supportive & Dignified:** Non-crisis touchpoints provide institutional authority without cold bureaucracy, establishing a safe, respectful harbor.
- **Stealth & Dissimulation:** The application must masquerade instantly as an unsuspicious utility (a clean calculator), protecting the user from real-world surveillance or violent scrutiny.

### Aesthetic Movement
The design system combines **Functional Modernism** with **Tactile Safety Metaphors**:
- Hyper-legible structure using crisp tonal surfaces.
- High-contrast touch targets scaled up to withstand physiological tremors and acute stress responses.
- Explicit visual feedback loops, physical hold-to-confirm patterns, and quick-mask escape affordances built directly into the spatial layout.

## Colors

The color architecture is built around three operational states: **Shield** (Institutional Safety), **Distress** (Urgent SOS), and **Discretion** (Neutral Camouflage).

### Palette Architecture
- **Primary (`#7E22CE` - Deep Protective Purple):** Represents institutional authority, security, and systemic protection. Used for primary navigation, secure status indicators, verified court orders, and non-distress confirmations.
- **Secondary (`#DC2626` - Critical SOS Carmine):** Reserved exclusively for high-stakes emergency triggers, active SOS broadcast rings, and critical boundary breaches. It must never be diluted or used for minor warnings.
- **Tertiary (`#10B981` - Safe Confirmation Emerald):** Communicates active geofence protection, device sync confirmations, verified dispatch reception, and safe check-in statuses.
- **Neutral Core (`#0F172A` - Deep Slate):** Anchors high-contrast readability against crisp backgrounds (`#F8FAFC` base surface). Prevents visual vibration under sunlight or in low-light hiding scenarios.

### Functional States & Camouflage Modes
1. **Normal Protected State:** Pure `#F8FAFC` foundation, `#FFFFFF` cards, `#0F172A` typography, and `#7E22CE` active elements.
2. **Panic / SOS State:** High-contrast saturated overlays utilizing dynamic pulse rings around `#DC2626`, switching background cards to alert-tinted surfaces (`#FEF2F2`) to confirm transmission success immediately.
3. **Discreet Calculator Mask:** Strict neutral monochrome mimicking default smartphone OS utilities (Slate `#1E293B`, `#64748B`, and `#F1F5F9`), stripping all purple and carmine branding until the user inputs their private unlock PIN.

## Typography

Typography relies on **Inter** across all roles to guarantee legibility, open counters, and high distinction between similar characters (`I`, `l`, `1`, `0`, `O`) during high-stress scenarios.

### Tactical Typographic Principles
- **Emergency Parsing:** Headlines and status labels avoid ambiguous flourishes. Numbers must be rendered with tabular figures (`tnum`) in CSS to ensure pin codes, GPS coordinates, judicial process numbers, and countdown timers remain stable on screen.
- **Stress-State Legibility:** Standard text lines should remain between 40 and 65 characters per line to maintain readability when hands or eyes are shaking.
- **Hierarchy Under Panic:** SOS screens collapse typography into two distinct hierarchy tiers: an undeniable primary order status (`headline-lg-mobile`) and a single contextual guidance readout (`body-lg`).

## Layout & Spacing

The layout utilizes an 8pt dynamic fluid grid designed for single-handed mobile navigation, prioritizing quick access to safe areas.

### Mobile Screen Distribution
- **One-Hand Accessibility:** Critical triggers (SOS trigger, Quick Exit, Quick Call) reside strictly in the thumb zone (lower 40% of the screen viewport). Informational badges and judicial logs inhabit the middle-to-upper viewport.
- **Safe Clearance Margins:** Outer margin stays locked at `1.25rem` (20px) to prevent accidental palm triggering on curved screen edges.
- **Grid Structure:** Fluid 4-column layout on mobile devices with `1rem` (16px) gutters, shifting to an 8-column layout on tablet screens capped at a 640px content container to retain compact mobile ergonomics.
- **Thumb Targets:** Primary interaction points maintain a minimum interactive hit area of 48x48px, with the central SOS component exceeding 84x84px.

## Elevation & Depth

Visual depth serves functional safety rather than decoration. It differentiates operational surfaces from non-interactive background indicators.

### Depth Hierarchy
1. **Base Foundation (Level 0):** Neutral `#F8FAFC`. Zero elevation. Houses passive legal texts, historical registries, and background trackers.
2. **Elevated Cards (Level 1):** Solid `#FFFFFF` surfaces with a 1px border of `#E2E8F0` and an ultra-soft ambient shadow (`box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05), 0 1px 2px rgba(15, 23, 42, 0.03)`). Used for Protective Order status, Geofence radius monitors, and Trusted Contacts.
3. **Tactile Interactive Layer (Level 2):** Critical action controls, primary inputs, and interactive chips. Subtle shadow (`box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`).
4. **Distress Floating Surface (Level 3 - Critical SOS):** Elevated above all navigation stacks (`z-index: 999`). Includes tactile radial depth: a solid `#DC2626` base accompanied by concentric dynamic pulse rings that expand outwards to signal continuous geolocated broadcasting.
5. **Quick-Exit Escape Button:** Always anchored on top of non-emergency views with a high-contrast pill elevation (`box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.15)`), allowing an instant blind swipe to camouflage the screen.

## Shapes

The design system incorporates **Rounded** geometry (`roundedness: 2`, where standard components carry `0.5rem` / 8px, cards carry `1rem` / 16px, and modals carry `1.5rem` / 24px).

### Geometric Rationale
- **Psychological Shielding:** Softer corners reduce visual aggression and create a welcoming, safe psychological environment, balancing the gravity of court orders and emergency tracking.
- **Full Pills for Escape & Trigger:** The SOS button and Quick Exit button use pure circular or pill shapes (`9999px` radius). This distinct form factor differentiates high-consequence survival triggers from regular content containers and form fields.

## Components

### 1. SOS / Panic Trigger
- **Layout & Anatomy:** A central circular button (minimum 88x88px) centered in the primary action zone.
- **Interaction Logic:** Requires a sustained "Hold for 1.5 Seconds" with an animated SVG radial progress border to eliminate false positives caused by accidental taps.
- **Haptic & Visual Feedback:** Delivers a distinctive triple-haptic pulse when engaged. Triggers an immediate change in screen state: the circular button transforms into a pulsating beacon showing "Disparando Socorro / Enviando Localização".
- **Silent Trigger Alternative:** Includes an optional discrete double-tap gesture on the volume key or screen header to trigger the SOS silently.

### 2. "Quick Exit" (Disfarçar / Sair Rápido) Floating Action Button
- **Placement:** Affixed to the top-right or bottom-right corner, always visible above non-emergency UI.
- **Styling:** Pill-shaped, high-contrast dark slate (`#0F172A`) with a subtle eye-slash or calculator icon and the label "Disfarçar".
- **Behavior:** A single tap instantly drops the SEMP UI and opens the **Camouflaged Calculator**. It clears the application from the mobile device's recent apps preview pane.

### 3. Camouflaged Calculator Screen
- **Visual Camouflage:** Replicates a standard system utility down to the pixel: clean monochrome grid, zero branding, zero mention of protective orders, domestic violence, or legal assistance.
- **Functional Mask:** Fully operational as a real mathematical calculator.
- **Emergency Unlock:** Entering the pre-configured secret PIN (e.g., `9482` followed by `=`) returns the user back to the secure SEMP dashboard.

### 4. Protective Measure Status Card (Card de Medida Protetiva)
- **Status Badges:**
  - *Ativa & Monitorada:* Solid emerald `#10B981` pill badge with check icon.
  - *Em Renovação:* Amber `#F59E0B` pill badge.
  - *Alerta de Proximidade:* Carmine `#DC2626` high-visibility badge.
- **Content:** Process number (`numeric-pin` styling), judicial district, expiration countdown, and quick-link to legal defense or public defenders.

### 5. Trusted Emergency Contacts (Rede de Apoio)
- **Structure:** Horizontal or compact vertical card list.
- **Anatomy:** Contact avatar, relationship label, notification toggle status (SMS/WhatsApp location link), and a single-tap direct secure call button.

### 6. Form Fields & Judicial Incident Reports
- **Inputs:** 48px height minimum, solid white background with `#CBD5E1` border, transitioning to `#7E22CE` focus rings with 2px stroke.
- **Audio & Photo Upload:** Integrated secure-drop zone for evidence recording (voice notes, threats, photos) with direct encrypted local caching that does not save items to the public device gallery.