import { Command } from "commander";
import { NotionWrapper } from "./modules/notion";
import { NotionConfig } from "./types";
import { NOTION_PAGE_ID } from "./modules/constants";

const program = new Command();

// Setup the CLI program
program
  .name("notion-cli")
  .description("CLI to interact with Notion API")
  .version("1.0.0");

// Initialize the Notion client
function createNotionClient() {
  // Check if environment variables are set
  if (!process.env.NOTION_TOKEN) {
    throw new Error("Missing required environment variable: NOTION_TOKEN must be set");
  }

  const config: NotionConfig = {
    token: process.env.NOTION_TOKEN,
    pageId: NOTION_PAGE_ID
  };

  return new NotionWrapper(config);
}

/**
 * Usage:
 * bun run index.ts get-page
 * bun run index.ts get-page --id your-page-id
 * 
 * This command retrieves a Notion page and displays its contents.
 * If no page ID is specified, it uses the default page ID from constants.
 */
program
  .command("get-page")
  .description("Retrieve a page from Notion")
  .option("-i, --id <pageId>", "Specify a custom page ID (optional)")
  .addHelpText('after', `
  Examples:
    $ bun run index.ts get-page
    $ bun run index.ts get-page --id <page-id>
  `)
  .action(async (options) => {
    try {
      const notion = createNotionClient();
      
      // If a custom page ID is provided, use it temporarily
      if (options.id) {
        notion.setPageId(options.id);
      }
      
      const page = await notion.getPage();
      console.log(JSON.stringify(page, null, 2));
    } catch (error) {
      console.error("Error retrieving page:", error);
    }
  });

/**
 * Usage:
 * bun run index.ts add-text "Your text here"
 * bun run index.ts add-text "Your text here" --id your-page-id
 * bun run index.ts add-text "Your text here" --block your-block-id
 * 
 * This command adds a text block to a Notion page.
 * The text argument is required and specifies the content to add.
 * Use --id to specify a different page than the default.
 * Use --block to add the text to a specific block instead of directly to the page.
 */
program
  .command("add-text")
  .description("Add text to a Notion page")
  .argument("<text>", "The text content to add")
  .option("-i, --id <pageId>", "Specify a custom page ID (optional)")
  .option("-b, --block <blockId>", "Specify a parent block ID (optional)")
  .addHelpText('after', `
  Examples:
    $ bun run index.ts add-text "Hello, Notion!"
    $ bun run index.ts add-text "Page specific text" --id <page-id>
    $ bun run index.ts add-text "Child block text" --block <block-id>
  `)
  .action(async (text, options) => {
    try {
      const notion = createNotionClient();
      
      // If a custom page ID is provided, use it temporarily
      if (options.id) {
        notion.setPageId(options.id);
      }
      
      const response = await notion.addText(text, options.block);
      console.log("Text added successfully!");
      console.log(JSON.stringify(response, null, 2));
    } catch (error) {
      console.error("Error adding text:", error);
    }
  });

/**
 * Usage:
 * bun run index.ts delete-block your-block-id
 * 
 * This command deletes a specific block from Notion.
 * The blockId argument is required and must be a valid Notion block ID.
 * Deleted blocks are archived in Notion, not permanently removed.
 */
program
  .command("delete-block")
  .description("Delete a block from Notion")
  .argument("<blockId>", "The ID of the block to delete")
  .addHelpText('after', `
  Example:
    $ bun run index.ts delete-block <block-id>
    
  Note: You can get block IDs by first adding text and noting the ID in the response.
  `)
  .action(async (blockId) => {
    try {
      const notion = createNotionClient();
      const response = await notion.deleteBlock(blockId);
      console.log("Block deleted successfully!");
      console.log(JSON.stringify(response, null, 2));
    } catch (error) {
      console.error("Error deleting block:", error);
    }
  });

/**
 * Usage:
 * bun run index.ts list-blocks
 * bun run index.ts list-blocks --id your-page-id
 * 
 * This command lists all blocks on a Notion page in a simplified format.
 * If no page ID is specified, it uses the default page ID from constants.
 */
program
  .command("list-blocks")
  .description("List all blocks on a Notion page")
  .option("-i, --id <pageId>", "Specify a custom page ID (optional)")
  .addHelpText('after', `
  Examples:
    $ bun run index.ts list-blocks
    $ bun run index.ts list-blocks --id <page-id>
  `)
  .action(async (options) => {
    try {
      const notion = createNotionClient();
      
      // If a custom page ID is provided, use it temporarily
      if (options.id) {
        notion.setPageId(options.id);
      }
      
      const blocks = await notion.getPageBlocks();
      console.log("Page blocks:");
      blocks.forEach(block => {
        console.log(`- Block ID: ${block.blockId}`);
        console.log(`  Type: ${block.blockType}`);
        console.log(`  Text: ${block.text}`);
        if (block.parentBlockId) {
          console.log(`  Parent: ${block.parentBlockId}`);
        }
        console.log();
      });
    } catch (error) {
      console.error("Error listing blocks:", error);
    }
  });

/**
 * Usage:
 * bun run index.ts update-block <blockId> <text>
 * 
 * This command updates the text content of a specific block.
 * The blockId argument is required and must be a valid Notion block ID.
 * The text argument is required and specifies the new content.
 */
program
  .command("update-block")
  .description("Update the text content of a block")
  .argument("<blockId>", "The ID of the block to update")
  .argument("<text>", "The new text content")
  .addHelpText('after', `
  Example:
    $ bun run index.ts update-block <block-id> "Updated text content"
    
  Note: You can get block IDs by using the list-blocks command.
  `)
  .action(async (blockId, text) => {
    try {
      const notion = createNotionClient();
      const response = await notion.updateBlock(blockId, text);
      console.log("Block updated successfully!");
      console.log(JSON.stringify(response, null, 2));
    } catch (error) {
      console.error("Error updating block:", error);
    }
  });

// Parse command line arguments
program.parse(process.argv);

// Show help if no arguments provided
if (!process.argv.slice(2).length) {
  program.help();
}
