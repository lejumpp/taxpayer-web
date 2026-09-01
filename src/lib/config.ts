// Feature flags driven by build/dev-time env vars (all VITE_* ship in the client bundle).

export const isBetaInviteEnabled =
  import.meta.env.VITE_BETA_INVITE_ENABLED === 'true'
