import fs from "fs";
import { _marketplaceResult } from "./marketplace";

type PrintListing = {
  title: string;
  url: string;
  condition: {
    sleeve: string;
    media: string;
  };
  price: string;
  shipping: string;
};

type OrganizedResult = {
  seller: {
    name: string;
    url: string;
  };
  listings: PrintListing[];
};

export const organizeListingsByStore = (listings: _marketplaceResult[]) => {
  const availableListings = listings.filter((listing) => listing.isAvailable);
  const sellerAggregated: { [sellerId: string]: OrganizedResult } = {};

  availableListings.forEach((listing) => {
    const sellerId = listing.seller.url;
    if (!sellerAggregated[sellerId]) {
      sellerAggregated[sellerId] = {
        seller: {
          name: listing.seller.name,
          url: listing.seller.url,
        },
        listings: [],
      };
    }

    sellerAggregated[sellerId].listings.push({
      title: listing.title.item,
      url: listing.url,
      condition: {
        sleeve: listing.condition.sleeve.short,
        media: listing.condition.media.short,
      },
      price: listing.price.base,
      shipping: listing.price.shipping,
    });
  });

  for (const sellerId in sellerAggregated) {
    const seller = sellerAggregated[sellerId];
    const uniqueListings: { [title: string]: PrintListing } = {};

    seller.listings.forEach((listing) => {
      const key =
        listing.title + listing.condition.sleeve + listing.condition.media;
      if (!uniqueListings[key]) {
        uniqueListings[key] = listing;
      } else {
        const current = uniqueListings[key];
        if (
          parseFloat(listing.price) + parseFloat(listing.shipping) <
          parseFloat(current.price) + parseFloat(current.shipping)
        ) {
          uniqueListings[key] = listing;
        }
      }
    });

    seller.listings = Object.values(uniqueListings);
  }

  fs.writeFileSync("organizedListings.json", JSON.stringify(sellerAggregated));
};
