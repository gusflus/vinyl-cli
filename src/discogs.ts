import {
  DiscogsClient,
  WantlistEntryResponse,
} from "@lionralfs/discogs-client";
import { bar } from "./constants";

const discogsClient = (token: string) =>
  new DiscogsClient({
    userAgent: "vinylSearcher/1.0",
    auth: {
      userToken: token,
      consumerKey: process.env.DISCOGS_CONSUMER_KEY,
      consumerSecret: process.env.DISCOGS_CONSUMER_SECRET,
    },
  }).setConfig({
    exponentialBackoffIntervalMs: 1100,
    exponentialBackoffMaxRetries: 10,
    exponentialBackoffRate: 1.7,
  });

const getWants = async (username: string, token: string) => {
  console.log("getting wants");
  let page = 1;
  const wantlistReleases: WantlistEntryResponse[] = [];
  const r = await discogsClient(token).user().wantlist().getReleases(username, {
    page,
    per_page: 200,
  });
  wantlistReleases.push(...r.data.wants);
  const pages = r.data.pagination.pages;

  while (page < pages) {
    page++;
    const r = await discogsClient(token)
      .user()
      .wantlist()
      .getReleases(username, { page, per_page: 200 });
    wantlistReleases.push(...r.data.wants);
  }

  return wantlistReleases;
};

export const getMasters = async (username: string, token: string) => {
  const wants = await getWants(username, token);
  const b = bar("releases");
  b.start(wants.length, 0);
  const releases = await Promise.all(
    wants.map(async (want) => {
      try {
        const r = await discogsClient(token).database().getRelease(want.id);
        b.increment();
        return r.data;
      } catch (e) {
        console.error(e);
        b.increment();
      }
    })
  );

  const b2 = bar("masters");
  b2.start(releases.length, 0);
  const masters = await Promise.all(
    releases.map(async (release) => {
      if (release?.master_id) {
        try {
          const r = await discogsClient(token)
            .database()
            .getMaster(release.master_id);
          b2.increment();
          return r.data;
        } catch (e) {
          console.error(e);
          b2.increment();
        }
      }
    })
  );

  return masters.filter((m) => m !== undefined);
};
