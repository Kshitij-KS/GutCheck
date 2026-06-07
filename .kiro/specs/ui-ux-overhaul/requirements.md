# Requirements Document

## Introduction

This feature is a comprehensive UI/UX overhaul of the GutCheck web application. GutCheck is a Next.js (React/TSX) wellness journal application with an established warm, minimalist, "anti-AI" design system defined in `app/globals.css` (warm off-white backgrounds, muted organic traffic-light palette, Cormorant/DM Sans/DM Mono typography). The overhaul preserves this existing aesthetic while raising the perceived quality to a "subtle but premium" level.

The work spans four areas: (1) reinforcing design philosophy and aesthetic guardrails, (2) refining primary layouts and fixing a critical banner overlap bug on the Dashboard, (3) introducing a cohesive micro-interaction and motion-design system based on Emil Kowalski design-engineering principles, and (4) optimizing responsive behavior and touch ergonomics across mobile, tablet, and desktop.

The overhaul is visual and interaction-focused. It MUST NOT change application data models, business logic, or feature behavior; it changes presentation, layout, motion, and responsiveness only.

This requirements document focuses on observable, testable outcomes (the "what"). Implementation choices (the "how"), including the constraint to consult `node_modules/next/dist/docs/` for this Next.js version's conventions before coding, are deferred to the design phase.

## Glossary

- **GutCheck_UI**: The collective front-end presentation layer of the GutCheck web application, including all pages, layout components, and shared UI components.
- **Design_System**: The set of design tokens and base component styles defined in `app/globals.css` (color custom properties, typography variables, card/button/input classes).
- **Design_Token**: A named CSS custom property representing a reusable design value (for example `--accent`, `--bg-primary`, `--font-display`).
- **Dashboard**: The page rendered at `/dashboard` (`app/dashboard/page.tsx`).
- **Profile_Page**: The page rendered at `/profile` (`app/profile/page.tsx`).
- **Content_View**: Any primary content page other than Dashboard and Profile_Page, specifically Scan Menu (`/scan`), Groceries (`/grocery`), Chef's Card (`/chef-card`), and History (`/history`).
- **Save_Profile_Banner**: The dismissible notification component rendered at the top of the Dashboard (`components/dashboard/SaveProfilePrompt.tsx`) containing a "Save your profile" message, a close control, and a "Sign in with Google" action.
- **Dismiss_Control**: The close (x) button within the Save_Profile_Banner.
- **Sign_In_Action**: The "Sign in with Google" button within the Save_Profile_Banner.
- **App_Shell**: The application layout wrapper (`components/layout/AppShell.tsx`) that hosts navigation, banners, page content, and toasts.
- **Navigation_Bar**: The primary navigation component (`components/layout/Navbar.tsx`).
- **Interactive_Element**: Any element a user can activate or focus, including buttons, links, form fields, toggle switches, and navigation items.
- **Motion_System**: The shared set of animation rules, durations, easing curves, and entrance patterns applied across GutCheck_UI.
- **Reduced_Motion_Preference**: The user setting expressed by the CSS media query `prefers-reduced-motion: reduce`.
- **Fine_Pointer_Environment**: A device environment matching both `hover: hover` and `pointer: fine` media queries (typically mouse-driven desktops).
- **Touch_Target**: The activatable hit area of an Interactive_Element.
- **Mobile_Viewport**: A viewport width from 320px to 480px inclusive.
- **Tablet_Viewport**: A viewport width from 768px to 1024px inclusive.
- **Desktop_Viewport**: A viewport width of 1200px or greater.
- **Thumb_Zone**: The lower region of a mobile screen that is comfortably reachable by a thumb during one-handed use.
- **Focus_State**: The visual treatment applied to an Interactive_Element when it receives keyboard or programmatic focus.

## Requirements

### Requirement 1: Preserve the established minimalist aesthetic

**User Story:** As a returning GutCheck user, I want the refreshed interface to feel like the same calm, comforting app, so that the overhaul improves quality without disrupting my familiarity.

#### Acceptance Criteria

1. THE GutCheck_UI SHALL use the existing color values defined as Design_Tokens in the Design_System without introducing new hue families outside the established warm, muted palette.
2. THE GutCheck_UI SHALL use the existing typography Design_Tokens (`--font-display`, `--font-body`, `--font-mono`) for all rendered text.
3. THE GutCheck_UI SHALL render all color and typography values by referencing Design_Tokens rather than hard-coded literal color or font-family values in components.
4. THE GutCheck_UI SHALL apply box-shadow values with a maximum blur radius of 12px and a maximum opacity of 0.12 for elevation effects.
5. THE GutCheck_UI SHALL render background fills and borders using Design_Tokens.
6. THE GutCheck_UI SHALL NOT render bright multi-stop gradients in any context, including surface fills, button states, and loading indicators.
7. WHERE a visual grouping is applied to a surface, THE GutCheck_UI SHALL convey the grouping using soft borders or subtle background tints from the Design_System.

### Requirement 2: Improve visual hierarchy and white space

**User Story:** As a user scanning a page, I want clear hierarchy and breathing room, so that I can find information without feeling crowded.

#### Acceptance Criteria

1. THE GutCheck_UI SHALL apply spacing values drawn from a single defined spacing scale for padding and margins between layout regions.
2. THE GutCheck_UI SHALL render a single primary heading per page using the `--font-display` Design_Token.
3. THE GutCheck_UI SHALL establish a visual distinction between heading text and body text using the defined typography scale.
4. WHERE a page presents grouped content sections, THE GutCheck_UI SHALL separate adjacent sections with spacing of at least 1.5rem.
5. THE GutCheck_UI SHALL preserve the existing set of information fields displayed on the Dashboard, Profile_Page, and each Content_View.

### Requirement 3: Refine primary layouts

**User Story:** As a user navigating GutCheck, I want the Dashboard, Profile, and content pages to feel cohesive and intentional, so that the experience reads as premium and uncluttered.

#### Acceptance Criteria

1. THE GutCheck_UI SHALL apply a consistent card treatment using the `gc-card` Design_System class for grouped content on the Dashboard, Profile_Page, and each Content_View.
2. WHERE related controls or fields are presented together, THE GutCheck_UI SHALL group them within a single bordered or tinted container rather than separating them with full-width hard divider lines.
3. THE GutCheck_UI SHALL maintain a consistent maximum content width and horizontal centering across the Dashboard, Profile_Page, and each Content_View.
4. THE GutCheck_UI SHALL render the same navigation destinations defined in the Navigation_Bar before and after the overhaul.

### Requirement 4: Fix the Save Profile banner overlap (critical bug)

**User Story:** As an unauthenticated user on the Dashboard, I want the "Save your profile" banner to display its close control and sign-in button without overlap, so that I can read and use both controls at any screen size.

#### Acceptance Criteria

1. THE Save_Profile_Banner SHALL render the Dismiss_Control and the Sign_In_Action so that their bounding boxes do not intersect.
2. WHILE the viewport width is within the Mobile_Viewport range, THE Save_Profile_Banner SHALL render the Dismiss_Control and the Sign_In_Action without overlapping bounding boxes.
3. WHILE the viewport width is within the Tablet_Viewport range, THE Save_Profile_Banner SHALL render the Dismiss_Control and the Sign_In_Action without overlapping bounding boxes.
4. WHILE the viewport width is within the Desktop_Viewport range, THE Save_Profile_Banner SHALL render the Dismiss_Control and the Sign_In_Action without overlapping bounding boxes.
5. THE Save_Profile_Banner SHALL reserve layout space for the Dismiss_Control such that the Dismiss_Control does not overlap the banner heading text or body text.
6. WHEN the user activates the Dismiss_Control, THE Save_Profile_Banner SHALL be removed from view.
7. WHEN the user activates the Sign_In_Action, THE GutCheck_UI SHALL initiate the Google sign-in flow.
8. THE Dismiss_Control SHALL expose an accessible name describing its dismiss action.

### Requirement 5: Modernize form fields, buttons, and toggles

**User Story:** As a user interacting with controls, I want sleek, cohesive inputs and buttons, so that the interface feels polished and consistent.

#### Acceptance Criteria

1. THE GutCheck_UI SHALL style text inputs, buttons, and toggle switches using shared Design_System classes so that controls of the same type share a consistent appearance across all pages.
2. THE GutCheck_UI SHALL render primary actions with the primary button treatment and secondary actions with the secondary button treatment from the Design_System.
3. WHEN an Interactive_Element receives focus, THE GutCheck_UI SHALL render a Focus_State that meets a minimum contrast ratio of 3:1 against its adjacent background.
4. THE GutCheck_UI SHALL render the Focus_State using outline or ring styling, which MAY remain in use even if it introduces a minimal sub-pixel layout shift.
5. WHERE a toggle switch is present, THE GutCheck_UI SHALL visually indicate its on and off states using a non-color cue in addition to color.

### Requirement 6: Establish a cohesive motion system

**User Story:** As a user interacting with GutCheck, I want quick, subtle, consistent motion, so that the interface feels responsive and alive without being distracting.

#### Acceptance Criteria

1. THE Motion_System SHALL animate only the CSS `transform` and `opacity` properties for hover, focus, active, and entrance transitions.
2. WHEN an Interactive_Element changes between hover, focus, or active states, THE Motion_System SHALL complete the transition within a duration between 150ms and 200ms inclusive.
3. THE Motion_System SHALL apply an ease-out or custom decelerating easing curve to state transitions.
4. WHEN the user presses an Interactive_Element to its active state, THE Motion_System SHALL apply a `scale(0.97)` transform during the press.
5. WHEN a collapsible region expands or collapses, THE Motion_System SHALL animate the change using `transform` or `opacity` rather than animating layout-affecting properties that trigger reflow.
6. THE Motion_System SHALL apply the same duration and easing rules to Interactive_Elements of the same type across all pages.

### Requirement 7: Staggered entrance animations for content collections

**User Story:** As a user opening the Dashboard, I want cards and list items to settle into place gracefully, so that the page feels considered rather than abrupt.

#### Acceptance Criteria

1. WHEN the Dashboard first renders, THE Motion_System SHALL apply a fade-in-up entrance animation to dashboard cards.
2. WHEN a collection of cards or list items enters, THE Motion_System SHALL apply a per-item entrance delay between 30ms and 80ms inclusive relative to the preceding item.
3. THE Motion_System SHALL produce the fade-in-up visual effect, transitioning each item from a lower offset and reduced opacity to its final position and full opacity.
4. WHEN entrance animations complete, THE GutCheck_UI SHALL render content at full opacity and at its final position.

### Requirement 8: Respect reduced-motion and pointer capabilities

**User Story:** As a user who is sensitive to motion or who uses a touch device, I want animations to respect my preferences and device, so that the interface remains comfortable and appropriate.

#### Acceptance Criteria

1. WHILE the Reduced_Motion_Preference is active, THE Motion_System SHALL disable hover and press animations.
2. WHILE the Reduced_Motion_Preference is active, THE Motion_System SHALL present entrance animations as an opacity-only fade without positional movement.
3. WHILE the Reduced_Motion_Preference is active, THE GutCheck_UI SHALL keep all Interactive_Elements fully operable.
4. WHERE the environment is not a Fine_Pointer_Environment, THE Motion_System SHALL NOT apply hover-triggered animations.
5. WHERE the environment is a Fine_Pointer_Environment, THE Motion_System SHALL apply hover-triggered animations as defined by the Motion_System.

### Requirement 9: Fluid responsive layout across devices

**User Story:** As a user on any device, I want layouts to adapt fluidly, so that GutCheck is usable and attractive from small phones to large desktops.

#### Acceptance Criteria

1. WHILE the viewport width is within the Mobile_Viewport range, THE GutCheck_UI SHALL render all primary content within the viewport width without horizontal scrolling.
2. WHILE the viewport width is within the Tablet_Viewport range, THE GutCheck_UI SHALL render all primary content within the viewport width without horizontal scrolling.
3. WHILE the viewport width is within the Desktop_Viewport range, THE GutCheck_UI SHALL render all primary content within the viewport width without horizontal scrolling.
4. WHILE the viewport width is within the Mobile_Viewport range, THE Dashboard SHALL render its quick-action cards in a single-column or two-column arrangement.
5. WHILE the viewport width is at or above the Desktop_Viewport range, THE Dashboard SHALL render its quick-action cards in a multi-column arrangement of three or more columns, except WHERE the available content width is too narrow to display three columns legibly, in which case THE Dashboard SHALL reduce the column count down to a single column as needed.
6. WHEN the viewport width crosses a defined breakpoint, THE GutCheck_UI SHALL preserve the visibility of every information field present before the crossing.

### Requirement 10: Accessible touch targets

**User Story:** As a touch-device user, I want controls that are easy to tap, so that I can use GutCheck accurately without mis-taps.

#### Acceptance Criteria

1. WHILE the viewport width is within the Mobile_Viewport range, THE GutCheck_UI SHALL render every Interactive_Element with a Touch_Target of at least 44px by 44px.
2. WHILE the viewport width is within the Tablet_Viewport range, THE GutCheck_UI SHALL render every Interactive_Element with a Touch_Target of at least 44px by 44px.
3. WHERE an Interactive_Element's visible graphic is smaller than 44px by 44px, THE GutCheck_UI SHALL extend the Touch_Target to at least 44px by 44px using padding or hit-area expansion.
4. THE GutCheck_UI SHALL maintain spacing between adjacent Touch_Targets so that their 44px by 44px hit areas do not overlap.

### Requirement 11: Thumb-optimized mobile navigation

**User Story:** As a one-handed mobile user, I want navigation within easy reach, so that I can move between sections comfortably.

#### Acceptance Criteria

1. WHILE the viewport width is within the Mobile_Viewport range, THE Navigation_Bar SHALL present its primary navigation through a Thumb_Zone-reachable control, implemented as either a bottom navigation bar or a slide-out navigation sheet.
2. WHILE the viewport width is at or above the Desktop_Viewport range, THE Navigation_Bar SHALL present navigation destinations as a persistent top or side bar.
3. WHEN the user activates a navigation destination, THE Navigation_Bar SHALL navigate to the corresponding route.
4. WHILE a slide-out navigation sheet is open, THE Navigation_Bar SHALL provide a control to close the sheet and SHALL trap keyboard focus within the open sheet.
5. THE Navigation_Bar SHALL render the same set of navigation destinations on Mobile_Viewport, Tablet_Viewport, and Desktop_Viewport.
