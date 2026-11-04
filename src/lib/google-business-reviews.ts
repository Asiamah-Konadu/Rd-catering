const GOOGLE_OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_REVIEWS_API_URL = "https://mybusiness.googleapis.com/v4";
const REVIEWS_CACHE_SECONDS = 600;
let cachedAccessToken: { value: string; expiresAt: number } | null = null;

type GoogleStarRating = "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE" | "STAR_RATING_UNSPECIFIED";

type GoogleReviewRecord = {
  name: string;
  starRating: GoogleStarRating;
  comment?: string;
  createTime?: string;
  reviewer?: {
    displayName?: string;
    profilePhotoUrl?: string;
    isAnonymous?: boolean;
  };
};

type GoogleReviewsResponse = {
  reviews?: GoogleReviewRecord[];
  averageRating?: number;
  totalReviewCount?: number;
};

export type GoogleBusinessReview = {
  id: string;
  rating: number;
  comment: string;
  reviewerName: string;
  profilePhotoUrl?: string;
};

export type GoogleBusinessReviewsSnapshot = {
  averageRating: number;
  totalReviewCount: number;
  reviews: GoogleBusinessReview[];
};

const ratingValue: Record<GoogleStarRating, number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
  STAR_RATING_UNSPECIFIED: 0,
};

function requiredGoogleBusinessSettings() {
  const { GOOGLE_BUSINESS_CLIENT_ID, GOOGLE_BUSINESS_CLIENT_SECRET,
    GOOGLE_BUSINESS_REFRESH_TOKEN, GOOGLE_BUSINESS_ACCOUNT_ID,
    GOOGLE_BUSINESS_LOCATION_ID } = process.env;

  if (!GOOGLE_BUSINESS_CLIENT_ID || !GOOGLE_BUSINESS_CLIENT_SECRET ||
      !GOOGLE_BUSINESS_REFRESH_TOKEN || !GOOGLE_BUSINESS_ACCOUNT_ID ||
      !GOOGLE_BUSINESS_LOCATION_ID) {
    return null;
  }

  return {
    clientId: GOOGLE_BUSINESS_CLIENT_ID,
    clientSecret: GOOGLE_BUSINESS_CLIENT_SECRET,
    refreshToken: GOOGLE_BUSINESS_REFRESH_TOKEN,
    accountId: GOOGLE_BUSINESS_ACCOUNT_ID,
    locationId: GOOGLE_BUSINESS_LOCATION_ID,
  };
}

async function getAccessToken(settings: NonNullable<ReturnType<typeof requiredGoogleBusinessSettings>>) {
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60_000) {
    return cachedAccessToken.value;
  }

  const response = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: settings.clientId,
      client_secret: settings.clientSecret,
      refresh_token: settings.refreshToken,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`Google OAuth token request failed (${response.status}).`);
  const payload = await response.json() as { access_token?: string; expires_in?: number };
  if (!payload.access_token) throw new Error("Google OAuth response did not include an access token.");
  cachedAccessToken = {
    value: payload.access_token,
    expiresAt: Date.now() + Math.max(payload.expires_in || 3600, 60) * 1000,
  };
  return payload.access_token;
}

export async function getGoogleBusinessReviews(): Promise<GoogleBusinessReviewsSnapshot | null> {
  const settings = requiredGoogleBusinessSettings();
  if (!settings) return null;

  try {
    const accessToken = await getAccessToken(settings);
    const parent = `accounts/${encodeURIComponent(settings.accountId)}/locations/${encodeURIComponent(settings.locationId)}`;
    const url = new URL(`${GOOGLE_REVIEWS_API_URL}/${parent}/reviews`);
    url.searchParams.set("pageSize", "50");
    url.searchParams.set("orderBy", "rating desc");

    // Cache the untouched Google response briefly to limit repeat API calls. Reviews are filtered in memory.
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      next: { revalidate: REVIEWS_CACHE_SECONDS },
    });

    if (!response.ok) throw new Error(`Google Business Profile review request failed (${response.status}).`);
    const payload = await response.json() as GoogleReviewsResponse;
    const configuredMinimum = Number(process.env.GOOGLE_BUSINESS_MIN_REVIEW_RATING || "4");
    const minimumRating = Number.isInteger(configuredMinimum) && configuredMinimum >= 1 && configuredMinimum <= 5
      ? configuredMinimum
      : 4;

    const reviews = (payload.reviews || [])
      .map((review) => ({
        id: review.name,
        rating: ratingValue[review.starRating] || 0,
        comment: review.comment?.trim() || "",
        reviewerName: review.reviewer?.isAnonymous ? "Google reviewer" : review.reviewer?.displayName?.trim() || "Google reviewer",
        profilePhotoUrl: review.reviewer?.isAnonymous ? undefined : review.reviewer?.profilePhotoUrl,
      }))
      .filter((review) => review.rating >= minimumRating && review.comment.length > 0)
      .slice(0, 3);

    return {
      averageRating: payload.averageRating || 0,
      totalReviewCount: payload.totalReviewCount || 0,
      reviews,
    };
  } catch (error) {
    console.error("Unable to load Google Business Profile reviews:", error);
    return null;
  }
}
