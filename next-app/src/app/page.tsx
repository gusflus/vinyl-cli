"use client";

import rawData from "@/listings.json";
import type { Item } from "@/types";
import {
  Anchor,
  Badge,
  Center,
  Group,
  ScrollArea,
  Table,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import {
  IconChevronDown,
  IconChevronUp,
  IconSearch,
  IconSelector,
} from "@tabler/icons-react";
import { useState } from "react";
import classes from "./TableSort.module.css";

interface ThProps {
  children: React.ReactNode;
  reversed: boolean;
  sorted: boolean;
  onSort: () => void;
}

function Th({ children, reversed, sorted, onSort }: ThProps) {
  const Icon = sorted
    ? reversed
      ? IconChevronUp
      : IconChevronDown
    : IconSelector;
  return (
    <Table.Th className={classes.th}>
      <UnstyledButton onClick={onSort} className={classes.control}>
        <Group justify="space-between">
          <Text fw={500} fz="sm">
            {children}
          </Text>
          <Center className={classes.icon}>
            <Icon size={16} stroke={1.5} />
          </Center>
        </Group>
      </UnstyledButton>
    </Table.Th>
  );
}

function filterData(data: Item[], search: string): Item[] {
  const query = search.toLowerCase().trim();
  return data.filter(
    (item) =>
      item.title.item.toLowerCase().includes(query) ||
      item.title.artist.toLowerCase().includes(query) ||
      item.seller.name.toLowerCase().includes(query) ||
      item.labels.some((l) => l.toLowerCase().includes(query))
  );
}

function sortData(
  data: Item[],
  payload: { sortBy: string | null; reversed: boolean; search: string }
): Item[] {
  const { sortBy, reversed, search } = payload;
  const filtered = filterData(data, search);

  if (!sortBy) return filtered;

  return [...filtered].sort((a, b) => {
    let aVal: number | string = "";
    let bVal: number | string = "";

    switch (sortBy) {
      case "title":
        aVal = a.title.item;
        bVal = b.title.item;
        break;
      case "price":
        aVal = parseFloat(a.price.base.replace(" USD", ""));
        bVal = parseFloat(b.price.base.replace(" USD", ""));
        break;
      case "condition":
        aVal = a.condition.media.short;
        bVal = b.condition.media.short;
        break;
      case "seller":
        aVal = a.seller.name;
        bVal = b.seller.name;
        break;
      case "isAvailable":
        aVal = a.isAvailable ? 1 : 0;
        bVal = b.isAvailable ? 1 : 0;
        break;
      default:
        return 0;
    }

    if (typeof aVal === "number" && typeof bVal === "number") {
      return reversed ? bVal - aVal : aVal - bVal;
    }

    return reversed
      ? bVal.toString().localeCompare(aVal.toString())
      : aVal.toString().localeCompare(bVal.toString());
  });
}

export default function RecordTable() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<keyof Item | null>(null);
  const [reversed, setReversed] = useState(false);
  const [sortedData, setSortedData] = useState(() =>
    sortData(rawData as Item[], { sortBy, reversed, search })
  );

  const setSorting = (field: string) => {
    const reversedNext = field === sortBy ? !reversed : false;
    setReversed(reversedNext);
    setSortBy(field as keyof Item);
    setSortedData(
      sortData(rawData as Item[], {
        sortBy: field as keyof Item,
        reversed: reversedNext,
        search,
      })
    );
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    setSearch(value);
    setSortedData(
      sortData(rawData as Item[], { sortBy, reversed, search: value })
    );
  };

  const rows = sortedData
    .filter((i) => i.isAvailable)
    .map((item) => (
      <Table.Tr key={item.id}>
        <Table.Td>
          <Group gap="xs" wrap="nowrap">
            {/* <Image
            src={item.imageUrl}
            alt={item.title.item}
            width={32}
            height={32}
            fit="contain"
            radius="sm"
            style={{ flexShrink: 0 }}
          /> */}
            <div>
              <Anchor href={item.release.url} size="sm" target="_blank">
                {item.title.item}
              </Anchor>
              <Text size="xs" c="dimmed">
                {item.title.artist}
              </Text>
            </div>
          </Group>
        </Table.Td>
        <Table.Td>{item.price.base}</Table.Td>
        <Table.Td>
          <Group gap="xs">
            <Badge color="blue" size="sm">
              {item.condition.media.short}
            </Badge>
            <Badge color="blue" size="sm">
              {item.condition.sleeve.short}
            </Badge>
          </Group>
        </Table.Td>
        <Table.Td>
          <Anchor size="sm" href={item.seller.url} target="_blank">
            {item.seller.name}
          </Anchor>
        </Table.Td>
        <Table.Td>
          <Badge size="sm" color={item.isAvailable ? "green" : "gray"}>
            {item.isAvailable ? "Available" : "Sold"}
          </Badge>
          {item.isAcceptingOffer && (
            <Badge size="sm" color="blue" ml="xs">
              Offers
            </Badge>
          )}
        </Table.Td>
      </Table.Tr>
    ));

  return (
    <ScrollArea>
      <TextInput
        placeholder="Search by title, artist, label"
        mb="md"
        leftSection={<IconSearch size={16} stroke={1.5} />}
        value={search}
        onChange={handleSearchChange}
      />
      <Table
        striped
        highlightOnHover
        withColumnBorders
        verticalSpacing="xs"
        fs="sm"
      >
        <Table.Thead>
          <Table.Tr>
            <Th
              sorted={sortBy === "title"}
              reversed={reversed}
              onSort={() => setSorting("title")}
            >
              Title
            </Th>
            <Th
              sorted={sortBy === "price"}
              reversed={reversed}
              onSort={() => setSorting("price")}
            >
              Price
            </Th>
            <Th
              sorted={sortBy === "condition"}
              reversed={reversed}
              onSort={() => setSorting("condition")}
            >
              Condition (media / sleeve)
            </Th>
            <Th
              sorted={sortBy === "seller"}
              reversed={reversed}
              onSort={() => setSorting("seller")}
            >
              Seller
            </Th>
            <Th
              sorted={sortBy === "isAvailable"}
              reversed={reversed}
              onSort={() => setSorting("isAvailable")}
            >
              Status
            </Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.length > 0 ? (
            rows
          ) : (
            <Table.Tr>
              <Table.Td colSpan={5}>
                <Text fw={500} ta="center">
                  Nothing found
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
