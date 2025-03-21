import { describe, test, expect, beforeEach } from "bun:test";
import { NotionWrapper } from "../modules/notion";
import { NotionConfig } from "../types";
import { NOTION_PAGE_ID, NOTION_PARENT_BLOCK_ID } from "../modules/constants";

describe("NotionWrapper", () => {
  let notionWrapper: NotionWrapper;
  
  beforeEach(() => {
    // Setup with environment variables or test values
    const config: NotionConfig = {
      token: process.env.NOTION_TOKEN,
      pageId: NOTION_PAGE_ID
    };
    
    notionWrapper = new NotionWrapper(config);
  });
  
  test("getPage should retrieve a page from Notion", async () => {
    // This test will fail with an exception if environment is not properly configured
    const page = await notionWrapper.getPage();
    
    expect(page).toBeDefined();
    expect(page.id).toBeDefined();
    expect(page.object).toBe("page");
    expect(page.parent.type).toBe("workspace");
    expect(page.archived).toBe(false);
    expect(page.properties).toBeDefined();
    expect(page.properties.title).toBeDefined();
  }, 10000); // Increase timeout to 10 seconds
  
  test("addText should add a text block to a page", async () => {
    const testText = `Test text ${new Date().toISOString()}`;
    const response = await notionWrapper.addText(testText);
    
    expect(response).toBeDefined();
    expect(response.results).toBeDefined();
    expect(response.results.length).toBeGreaterThan(0);
    
    // Verify the first block is our text block
    const firstBlock = response.results[0];
    expect(firstBlock.type).toBe("paragraph");
    
    // Verify the content matches what we sent
    if (firstBlock.paragraph && firstBlock.paragraph.rich_text) {
      const content = firstBlock.paragraph.rich_text[0]?.text?.content;
      if (content) {
        expect(content).toContain(testText);
      }
    }
  }, 10000); // Increase timeout to 10 seconds
  
  test("deleteBlock should delete a block from Notion", async () => {
    // First create a block to delete
    const testText = `Block to delete ${new Date().toISOString()}`;
    const addResponse = await notionWrapper.addText(testText);
    
    expect(addResponse.results).toBeDefined();
    expect(addResponse.results.length).toBeGreaterThan(0);
    
    const blockId = addResponse.results[0].id;
    
    // Now delete the block
    const deleteResponse = await notionWrapper.deleteBlock(blockId);
    
    expect(deleteResponse).toBeDefined();
    expect(deleteResponse.id).toBe(blockId);
    expect(deleteResponse.archived).toBe(true);
  }, 10000); // Increase timeout to 10 seconds
  
  test("addText should add text to a parent block", async () => {
    // Test adding text to a specific parent block
    const testText = `Child block text ${new Date().toISOString()}`;
    const response = await notionWrapper.addText(testText, NOTION_PARENT_BLOCK_ID);
    
    expect(response).toBeDefined();
    expect(response.results).toBeDefined();
    expect(response.results.length).toBeGreaterThan(0);
    
    // Verify the first block is our text block
    const firstBlock = response.results[0];
    expect(firstBlock.type).toBe("paragraph");
    
    // Verify the content matches what we sent
    if (firstBlock.paragraph && firstBlock.paragraph.rich_text) {
        expect(firstBlock.paragraph.rich_text[0]?.text?.content).toContain(testText);
    } else {
        fail("Child content was not created")
    }
  }, 10000); // Increase timeout to 10 seconds
  
  test("getPageBlocks should return a list of SimpleBlockType objects", async () => {
    // First add a text block to ensure there's at least one block
    const testText = `Test block for getPageBlocks ${new Date().toISOString()}`;
    await notionWrapper.addText(testText);
    
    // Now get the blocks
    const blocks = await notionWrapper.getPageBlocks();
    
    // Verify we got a valid response
    expect(blocks).toBeDefined();
    expect(Array.isArray(blocks)).toBe(true);
    
    // There should be at least one block
    expect(blocks.length).toBeGreaterThan(0);
    
    // Verify the structure of the blocks
    const firstBlock = blocks[0];
    expect(firstBlock).toHaveProperty('blockId');
    expect(firstBlock).toHaveProperty('text');
    expect(firstBlock).toHaveProperty('blockType');
    expect(typeof firstBlock.blockId).toBe('string');
    expect(typeof firstBlock.text).toBe('string');
    expect(typeof firstBlock.blockType).toBe('string');
    
    // At least one block should contain our test text
    const hasTestBlock = blocks.some(block => block.text.includes(testText));
    expect(hasTestBlock).toBe(true);
    
    // All blocks should have non-empty blockId
    blocks.forEach(block => {
      expect(block.blockId).toBeTruthy();
    });
  }, 10000); // Increase timeout to 10 seconds
  
  test("updateBlock should update the text content of a block", async () => {
    // First create a block to update
    const initialText = `Block to update ${new Date().toISOString()}`;
    const addResponse = await notionWrapper.addText(initialText);
    
    expect(addResponse.results).toBeDefined();
    expect(addResponse.results.length).toBeGreaterThan(0);
    
    const blockId = addResponse.results[0].id;
    
    try {
      // Now update the block
      const updatedText = `Updated text ${new Date().toISOString()}`;
      const updateResponse = await notionWrapper.updateBlock(blockId, updatedText);
      
      expect(updateResponse).toBeDefined();
      expect(updateResponse.id).toBe(blockId);
      expect(updateResponse.paragraph).toBeDefined();
      
      // Verify the content was updated
      if (updateResponse.paragraph && updateResponse.paragraph.rich_text) {
        const content = updateResponse.paragraph.rich_text[0]?.text?.content;
        expect(content).toBe(updatedText);
      }
    } finally {
      // Clean up by deleting the block - ensure this runs even if test fails
      await notionWrapper.deleteBlock(blockId);
    }
  }, 20000); // Increase timeout to 20 seconds
});
