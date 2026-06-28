export const APP_NAME = "MediQ";

export const TIER_LIMITS = {
  free: {
    maxPdfs: 1,
    maxPages: 10,
    maxFileMb: 5,
    runsPerDay: 1,
  },
  byok: {
    maxPdfs: 5,
    maxPages: 100,
    maxFileMb: 20,
    runsPerDay: null,
  },
};

export const ROUTES = {
  LANDING: "/",
  AUTH: "/auth",
  CHAT: "/chat",
  PROFILE: "/profile",
  API_KEYS: "/api-keys",
};
