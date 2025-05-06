import { ConditionType } from "discogs-marketplace-api-nodejs/dist/types";
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

const CONDITIONS: ConditionType[] = [
  // "Mint (M)",
  "Near Mint (NM or M-)",
  "Very Good Plus (VG+)",
  "Very Good (VG)",
  // "Good Plus (G+)",
  // "Good (G)",
  // "Fair (F)",
  // "Poor (P)",
];

const app = async () => {
  if (!fs.existsSync("loaded")) {
    fs.mkdirSync("loaded");
  }
  if (!fs.existsSync("organized")) {
    fs.mkdirSync("organized");
  }

  let masters: any, listings: any;
  if (fs.existsSync("loaded/masters.json")) {
    masters = JSON.parse(fs.readFileSync("loaded/masters.json", "utf8"));
    console.log("loaded existing masters from file");
  } else {
    masters = await getMasters(username, token);
    fs.writeFileSync("loaded/masters.json", JSON.stringify(masters));
  }

  if (fs.existsSync("loaded/listings.json")) {
    listings = JSON.parse(fs.readFileSync("loaded/listings.json", "utf8"));
    console.log("loaded existing listings from file");
  } else {
    listings = await getAllMarketplaceListings(masters, CONDITIONS);
    fs.writeFileSync("loaded/listings.json", JSON.stringify(listings));
  }

  organizeListingsByStore(listings);
  organizeListingsByTitle(listings);
  organizeListingsByPrice(listings);
};

app();
