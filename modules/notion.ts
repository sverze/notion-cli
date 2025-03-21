import { Client } from "@notionhq/client";
import { NotionConfig, SimpleBlockType } from "../types";
const { getTextFromBlock, extractTextContent } = require("./notionUtils");

export class NotionWrapper {
  private client: Client;
  private pageId: string;

  constructor(config: NotionConfig) {
    this.client = new Client({ auth: config.token });
    this.pageId = config.pageId;
  }

  /**
   * Set a new page ID
   */
  setPageId(pageId: string) {
    this.pageId = pageId;
  }

  /**
   * Get the current page ID
   */
  getPageId(): string {
    return this.pageId;
  }

  /**
   * Retrieve a page from Notion
   */
  async getPage() {
    try {
      const response = await this.client.pages.retrieve({ page_id: this.pageId });
      return response;
    } catch (error) {
      console.error("Error retrieving Notion page:", error);
      throw error;
    }
  }

  /**
   * Add text block to a page
   * @param text The text content to add
   * @param parentBlock Optional parent block ID. If not provided, adds to the current page
   * @returns The created block
   */
  async addText(text: string, parentBlock?: string) {
    try {
      const blockId = parentBlock || this.pageId;
      
      const response = await this.client.blocks.children.append({
        block_id: blockId,
        children: [
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [
                {
                  type: 'text',
                  text: {
                    content: text
                  }
                }
              ]
            }
          }
        ]
      });
      
      return response;
    } catch (error) {
      console.error("Error adding text to Notion:", error);
      throw error;
    }
  }

  /**
   * Delete a block from Notion
   * @param blockId The ID of the block to delete
   * @returns The deleted block
   */
  async deleteBlock(blockId: string) {
    try {
      const response = await this.client.blocks.delete({
        block_id: blockId
      });
      
      return response;
    } catch (error) {
      console.error("Error deleting block from Notion:", error);
      throw error;
    }
  }

  /**
   * Update the text content of a block
   * @param blockId The ID of the block to update
   * @param text The new text content
   * @returns The updated block
   */
  async updateBlock(blockId: string, text: string) {
    try {
      // First check if the block exists and get its type
      const blockInfo = await this.client.blocks.retrieve({
        block_id: blockId
      });
      
      // Only paragraph blocks are supported for now
      if (blockInfo.type !== 'paragraph') {
        console.warn(`Block type ${blockInfo.type} is not supported for text updates. Only paragraph blocks can be updated.`);
      }
      
      const response = await this.client.blocks.update({
        block_id: blockId,
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: text
              }
            }
          ]
        }
      });
      
      return response;
    } catch (error) {
      console.error("Error updating block in Notion:", error);
      throw error;
    }
  }

  /**
   * Get all blocks from a page
   * @returns A list of SimpleBlockType objects
   */
  async getPageBlocks(): Promise<SimpleBlockType[]> {
    try {
      const response = await this.client.blocks.children.list({
        block_id: this.pageId
      });
      
      const blocks: SimpleBlockType[] = [];
      
      // Process each top-level block and its children
      for (const block of response.results) {
        // Process the block and its children recursively
        const processedBlocks = await getTextFromBlock(block, this.client);
        blocks.push(...processedBlocks);
      }
      
      return blocks;
    } catch (error) {
      console.error("Error retrieving page blocks from Notion:", error);
      throw error;
    }
  }
}
