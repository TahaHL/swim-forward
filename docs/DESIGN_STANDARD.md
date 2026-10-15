# Required design standard — section 5c

User-approved requirements, 13 October 2026. This document records requirements, not completed work.

Quality references: Apple Fitness, Monzo, Linear and Stripe Dashboard; do not copy them. Aim for a polished native app, without template styling.

## Tokens

- Ink #14212B; surface #FFFFFF; grouped tile #F2F5F6.
- Lane blue #0A5BD3 for actions only. Rope red #E04A2F only for the single next focus.
- Needs Practice, Fair, Good: one blue scale, light to strong. Pass: solid ink with tick. Not Assessed: dashed neutral outline. Always include text and shape.
- Full dark mode; verify WCAG 2.2 AA contrast in both modes.
- One system UI font family (SF Pro, Segoe UI, Roboto fallbacks). Sizes 13, 15, 17, 22, 28, 34 px; weights 400 and 600. Sentence case, tabular dates/times, lines under 75 characters.
- Spacing 4, 8, 12, 16, 24, 32, 48 px. Radius 8 px controls, 14 px groups, full only avatars.
- One shadow level for overlays only; 1 px dividers elsewhere. One outline icon set, constant stroke width, only where useful.

## Avoid

Gradient hero cards, percentage rings, big-number/small-label stats, identical rounded shadow cards, icons on every heading, excessive pills or small stacked labels, navy/teal stock palettes, cream backgrounds, gradient washes, uppercase eyebrows, middle-dot metadata, link arrows, accented headline words, entrance animations, ubiquitous hover effects, repeated disclaimers, template copy and slogans in the UI. Put explanations in one help sheet linked by a small info control.

## Parent Home order

1. Child name and week.
2. The lane: six-week programme, completed weeks solid, swimmer position in current week, pool-floor T at week 6. Accessible equivalent such as “Week 3 of 6”. This is the only decorative element.
3. Latest coach note and date.
4. One tappable next focus with rope-red marker.
5. Improved skill with old and new labels.
6. Needs work: skill, label, tap for why and next target.
7. Next session.

No percentage figure.

## Poolside

One row per skill, five-step segmented control at least 48 px tall. Swipe or arrow between group swimmers. Fixed Publish update bar. Android haptic tick on rating. Keys 1–5 set ratings on desktop. Offline drafts saved and restored.

## Behaviour

Route prefetching and optimistic updates; matching skeletons without layout shift; no spinner over 300 ms. Mobile bottom sheets, desktop centred dialogs. Pull to refresh. Action-matched toast wording (Update published), five-second Undo where reversible. Actionable empty states and errors, without apologies. User-triggered motion only, 150–250 ms, reduced-motion support. Safe-area insets. Installable PWA with proper icons and splash screen. Targets: mobile Lighthouse >=90, LCP <2.5 s, INP <200 ms; report measured evidence, not assumptions.

## M1a approval gate — before building screens

1. Build and document button, segmented status control, list row, grouped section, sheet, toast, skeleton and lane in Storybook or /design.
2. Produce two contrasting static directions, each showing parent Home and instructor assessment at 390 px and 1440 px, light and dark. Stop for the owner's selection.
3. After building each screen, capture 390 px and 1440 px screenshots, critique against this standard, and remove one decorative element before calling it done. Preserve the required lane; avoid inventing decoration merely to remove it.

The M0, M1, M1a, M2, M3 and M4 stop-and-report gates remain in force. No public, costly or irreversible action without approval. The supplied production brief ends mid-sentence at section 9 (“Never”); request the remaining text before proceeding beyond the audit.

## Superseded visual direction
On 13 October the owner explicitly chose the later navy/teal/rounded-card direction and waived the static mockup selection pause. Preserve simplicity, accessible controls and progressive disclosure; do not reinstate the old palette or design gate.
