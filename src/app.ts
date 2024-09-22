import dotenv from "dotenv";
import fs from "fs";
import { getMasters } from "./discogs";
import {
  organizeListingsByPrice,
  organizeListingsByStore,
  organizeListingsByTitle,
} from "./export";
import { getAllMarketplaceListings } from "./marketplace";
dotenv.config();

const username = "gusflus";
const token = process.env.DISCOGS_PERSONAL_TOKEN as string;

const main = async () => {
  const masters = await getMasters(username, token);
  console.log("got " + masters.length + " masters");
  fs.writeFileSync("masters.json", JSON.stringify(masters));
  const allListings = await getAllMarketplaceListings(masters);
  console.log("writing " + allListings.length + " listings to file");
  fs.writeFileSync("listings.json", JSON.stringify(allListings));
  organizeListingsByStore(allListings);
  organizeListingsByTitle(allListings);
  organizeListingsByPrice(allListings);
};

main();
