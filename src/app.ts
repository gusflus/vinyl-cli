// get all releases in discogs wantlist
// get all masters of those releases
// get all marketplace listings of those masters with parameters
// optimize

import dotenv from "dotenv";
import fs from "fs";
import { getMasters } from "./discogs";
import { organizeListingsByStore } from "./export";
import { getAllMarketplaceListings } from "./marketplace";
dotenv.config();

const username = "gusflus";
const token = process.env.DISCOGS_PERSONAL_TOKEN as string;

const main = async () => {
  const masters = await getMasters(username, token);
  console.log("got " + masters.length + " masters");
  fs.writeFileSync("masters.json", JSON.stringify(masters));
  // const masters = JSON.parse(fs.readFileSync("masters.json", "utf8"));
  const allListings = await getAllMarketplaceListings(masters);
  console.log("writing " + allListings.length + " listings to file");
  fs.writeFileSync("listings.json", JSON.stringify(allListings));
  //   const allListings = JSON.parse(fs.readFileSync("listings.json", "utf8"));
  organizeListingsByStore(allListings);
};

main();
