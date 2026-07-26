import Mux from "@mux/mux-node";

export const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function createMuxUploadUrl() {
  const upload = await mux.video.uploads.create({
    cors_origin: process.env.NEXT_PUBLIC_APP_URL!,
    new_asset_settings: {
      playback_policy: ["signed"],
      encoding_tier: "smart",
    },
  });
  return upload;
}

export async function getMuxSignedPlaybackUrl(playbackId: string): Promise<string> {
  const token = await mux.jwt.signPlaybackId(playbackId, {
    type: "video",
    expiration: "1h",
    keyId: process.env.MUX_SIGNING_KEY_ID!,
    keySecret: process.env.MUX_SIGNING_KEY_PRIVATE!,
  });
  return `https://stream.mux.com/${playbackId}.m3u8?token=${token}`;
}
