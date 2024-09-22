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

type ByStoreResult = {
  seller: {
    name: string;
    url: string;
  };
  listings: PrintListing[];
};

type PrintStore = {
  name: string;
  url: string;
  condition: {
    sleeve: string;
    media: string;
  };
  price: string;
  shipping: string;
};

type ByTitleResult = {
  title: string;
  listings: PrintStore[];
};

type ByPriceResult = PrintListing & {
  store: {
    name: string;
    url: string;
    otherListings: PrintStore[];
  };
};

export const organizeListingsByStore = (listings: _marketplaceResult[]) => {
  const availableListings = listings.filter((listing) => listing.isAvailable);
  const sellerAggregated: { [sellerId: string]: ByStoreResult } = {};

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

export const organizeListingsByTitle = (listings: _marketplaceResult[]) => {
  const availableListings = listings.filter((listing) => listing.isAvailable);
  const titleAggregated: { [title: string]: ByTitleResult } = {};

  availableListings.forEach((listing) => {
    const title = listing.title.item;
    if (!titleAggregated[title]) {
      titleAggregated[title] = {
        title: title,
        listings: [],
      };
    }

    titleAggregated[title].listings.push({
      name: listing.seller.name,
      url: listing.seller.url,
      condition: {
        sleeve: listing.condition.sleeve.short,
        media: listing.condition.media.short,
      },
      price: listing.price.base,
      shipping: listing.price.shipping,
    });
  });

  for (const title in titleAggregated) {
    const titleInfo = titleAggregated[title];
    const uniqueListings: { [store: string]: PrintStore } = {};

    titleInfo.listings.forEach((listing) => {
      const key = listing.name;
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

    titleInfo.listings = Object.values(uniqueListings);

    // Sort listings by cheapest price
    titleInfo.listings.sort((a, b) => {
      const totalA = parseFloat(a.price) + parseFloat(a.shipping);
      const totalB = parseFloat(b.price) + parseFloat(b.shipping);
      return totalA - totalB;
    });
  }

  fs.writeFileSync("ListingsByStore.json", JSON.stringify(titleAggregated));
};

export const organizeListingsByPrice = (listings: _marketplaceResult[]) => {
  const availableListings = listings.filter((listing) => listing.isAvailable);
  const priceAggregated: { [key: string]: ByPriceResult } = {};

  availableListings.forEach((listing) => {
    const totalPrice =
      parseFloat(listing.price.base) + parseFloat(listing.price.shipping);
    const key = listing.title.item + listing.seller.name + listing.seller.url;

    const newListing: PrintStore = {
      name: listing.title.item,
      url: listing.url,
      condition: {
        sleeve: listing.condition.sleeve.short,
        media: listing.condition.media.short,
      },
      price: listing.price.base,
      shipping: listing.price.shipping,
    };

    if (!priceAggregated[key]) {
      priceAggregated[key] = {
        title: listing.title.item,
        url: listing.url,
        condition: {
          sleeve: listing.condition.sleeve.short,
          media: listing.condition.media.short,
        },
        price: listing.price.base,
        shipping: listing.price.shipping,
        store: {
          name: listing.seller.name,
          url: listing.seller.url,
          otherListings: [newListing],
        },
      };
    } else {
      const current = priceAggregated[key];
      if (
        totalPrice <
        parseFloat(current.price) + parseFloat(current.shipping)
      ) {
        priceAggregated[key] = {
          ...current,
          price: listing.price.base,
          shipping: listing.price.shipping,
          url: listing.url,
          condition: {
            sleeve: listing.condition.sleeve.short,
            media: listing.condition.media.short,
          },
        };
      }
      current.store.otherListings.push(newListing);
    }
  });

  // Remove duplicates by title
  const uniqueListings: { [title: string]: ByPriceResult } = {};
  for (const key in priceAggregated) {
    const listing = priceAggregated[key];
    if (!uniqueListings[listing.title]) {
      uniqueListings[listing.title] = listing;
    } else {
      const current = uniqueListings[listing.title];
      const totalCurrent =
        parseFloat(current.price) + parseFloat(current.shipping);
      const totalNew = parseFloat(listing.price) + parseFloat(listing.shipping);
      if (totalNew < totalCurrent) {
        uniqueListings[listing.title] = listing;
      }
    }
  }

  const sortedListings = Object.values(uniqueListings).sort((a, b) => {
    const totalA = parseFloat(a.price) + parseFloat(a.shipping);
    const totalB = parseFloat(b.price) + parseFloat(b.shipping);
    return totalA - totalB;
  });

  fs.writeFileSync("ListingsByPrice.json", JSON.stringify(sortedListings));
};
