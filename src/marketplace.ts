import { GetMasterResponse } from "@lionralfs/discogs-client";
import { DiscogsMarketplace } from "discogs-marketplace-api-nodejs";
import { ConditionType } from "discogs-marketplace-api-nodejs/dist/types";
import { bar } from "./constants";

export type _marketplaceResult = {
  id: number;
  title: {
    original: string;
    artist: string;
    item: string;
    formats: Array<string>;
  };
  url: string;
  labels: Array<string>;
  catnos: Array<string>;
  imageUrl: string;
  description: string;
  isAcceptingOffer: boolean;
  isAvailable: boolean;
  condition: {
    media: {
      full: string;
      short: "M" | "NM" | "VG+" | "G+" | "G" | "F" | "P";
    };
    sleeve: {
      full: string;
      short: "M" | "NM" | "VG+" | "G+" | "G" | "F" | "P";
    };
  };
  seller: {
    name: string;
    url: string;
    score: string;
    notes: number;
  };
  price: {
    base: string;
    shipping: string;
  };
  country: {
    name: string;
    code: string;
  };
  community: {
    have: number;
    want: number;
  };
  release: {
    id: number;
    url: string;
  };
};

const getListings = async (id: string, conditions: ConditionType[]) => {
  let totalResults: _marketplaceResult[] = [];
  for (const c of conditions) {
    let page = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      const result = await DiscogsMarketplace.search({
        limit: 250,
        sort: "Price Lowest",
        searchType: "master_id",
        searchValue: id,
        condition: [c as ConditionType],
        format: ["Vinyl"],
        currency: "USD",
        page,
      });

      totalResults.push(...(result.items as any));
      if (page >= Math.min(result.page.total, 4)) {
        hasMorePages = false;
      }

      page += 1;
    }
  }

  return totalResults;
};

export const getAllMarketplaceListings = async (
  masters: GetMasterResponse[],
  conditions: ConditionType[]
) => {
  const b = bar("marketplace");
  b.start(masters.length, 0);
  return await Promise.all(
    masters.map(async (master) => {
      try {
        const r = await getListings(master.id.toString(), conditions);
        b.increment();
        return r;
      } catch (e) {
        console.error(e);
        b.increment();
      }
    })
  ).then((results) => results.filter((r) => r !== undefined).flat());
};
