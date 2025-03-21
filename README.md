# Notion CLI Tool

A command-line interface for interacting with Notion pages and blocks.

## Setup

### Prerequisites

- [Bun](https://bun.sh) v1.2.5 or later
- A Notion integration token (set as `NOTION_TOKEN` environment variable)

### Installation

To install dependencies:

```bash
bun install
```

### Environment Variables

Create a `.env` file with the following variables:

```
NOTION_TOKEN=your_notion_integration_token
```

## Commands

### Get Page

Retrieves a Notion page and displays its contents.

```bash
# Use default page ID from constants
bun run index.ts get-page

# Specify a custom page ID
bun run index.ts get-page --id your-page-id
```

### Add Text

Adds a text block to a Notion page.

```bash
# Add text to the default page
bun run index.ts add-text "Hello, Notion!"

# Add text to a specific page
bun run index.ts add-text "Page specific text" --id your-page-id

# Add text as a child of a specific block
bun run index.ts add-text "Child block text" --block your-block-id
```

### Delete Block

Deletes (archives) a specific block from Notion.

```bash
bun run index.ts delete-block your-block-id
```

### List Blocks

Lists all blocks on a Notion page in a simplified format.

```bash
# List blocks from the default page
bun run index.ts list-blocks

# List blocks from a specific page
bun run index.ts list-blocks --id your-page-id
```

### Update Block

Updates the text content of a specific block.

```bash
bun run index.ts update-block your-block-id "Updated text content"
```

## Features

- **Page Management**: Retrieve and interact with Notion pages
- **Block Operations**: Add, update, delete, and list blocks
- **Text Content**: Work with rich text content in Notion
- **Hierarchical Structure**: Support for parent-child block relationships

## Notion Wrapper Usage

The `NotionWrapper` class provides a programmatic interface to interact with Notion. Here are examples of how to use each method:

### Initialization

```typescript
import { NotionWrapper } from "./modules/notion";
import { NotionConfig } from "./types";

// Initialize with configuration
const config: NotionConfig = {
  token: process.env.NOTION_TOKEN,
  pageId: "your-page-id"
};

const notion = new NotionWrapper(config);
```

### Get Page

```typescript
// Retrieve a page
const page = await notion.getPage();
console.log(page);

// Change the active page ID
notion.setPageId("different-page-id");
const differentPage = await notion.getPage();
```

### Add Text

```typescript
// Add text to the current page
const response = await notion.addText("Hello, Notion!");

// Add text to a specific block as a child
const childResponse = await notion.addText("This is a child block", "parent-block-id");
```

### Delete Block

```typescript
// Delete (archive) a block
const deletedBlock = await notion.deleteBlock("block-id-to-delete");
```

### Update Block

```typescript
// Update the text content of a paragraph block
const updatedBlock = await notion.updateBlock("block-id-to-update", "New text content");
```

### List Blocks

```typescript
// Get all blocks from the current page
const blocks = await notion.getPageBlocks();

// Process the blocks
blocks.forEach(block => {
  console.log(`Block ID: ${block.blockId}`);
  console.log(`Content: ${block.text}`);
  console.log(`Type: ${block.blockType}`);
});
```

### Get Current Page ID

```typescript
// Get the currently active page ID
const currentPageId = notion.getPageId();
```

## Development

This project was created using `bun init` in bun v1.2.5. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

To run the project:

```bash
bun run index.ts
```

For help with available commands:

```bash
bun run index.ts --help
```
