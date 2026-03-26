# Mobile + Vercel Rollout

## QA Checklist
- Install PWA on iOS Safari and Android Chrome.
- Validate booking create, lookup, cancel from web.
- Validate Stripe checkout and webhook confirmation.
- Validate API fallback behavior when `BOOKING_SHEETS_API` is unset.
- Smoke test `/api/health` equivalent endpoints and `/api/claude`.

## Monitoring
- Enable Vercel function logs and alert on 5xx spikes.
- Track checkout success vs cancel ratio.
- Track booking conversion from mobile sessions.
- Add synthetic check to `GET /api/booking/availability`.

## Staged Release
1. Deploy preview and run QA checklist.
2. Enable production env vars in Vercel.
3. Deploy to production and monitor for 24 hours.
4. Cut Expo internal build pointed at production API.
