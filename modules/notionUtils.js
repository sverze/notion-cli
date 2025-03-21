/**
 * Utility functions for parsing Notion content
 * Based on the parsing logic from PARSE_CONTENT.md
 */

/**
 * Take rich text array from a block child that supports rich text and return the plain text.
 * @param {Array} richText - Array of rich text objects
 * @returns {string} Plain text content
 */
const getPlainTextFromRichText = (richText) => {
  if (!richText || !Array.isArray(richText)) return "";
  return richText.map(t => t.plain_text || "").join("");
};

/**
 * Get the text content from a block based on its type
 * @param {Object} block - The Notion block
 * @returns {string} Text representation of the block
 */
const extractTextContent = (block) => {
  // Get rich text from blocks that support it
  if (block[block.type] && block[block.type].rich_text) {
    return getPlainTextFromRichText(block[block.type].rich_text);
  }
  
  // For other block types, just return a simple indicator
  return `[${block.type}]`;
};

/**
 * Process a block and its children recursively
 * @param {Object} block - The Notion block
 * @param {Object} client - The Notion client instance
 * @param {string} parentId - Optional parent block ID
 * @returns {Promise<Array>} Array of SimpleBlockType objects
 */
const processBlockWithChildren = async (block, client, parentId = null) => {
  const results = [];
  
  // Add the current block
  results.push({
    blockId: block.id,
    text: extractTextContent(block),
    blockType: block.type,
    parentBlockId: parentId
  });
  
  // Process children if they exist
  if (block.has_children) {
    try {
      const childrenResponse = await client.blocks.children.list({
        block_id: block.id
      });
      
      for (const childBlock of childrenResponse.results) {
        const childResults = await processBlockWithChildren(childBlock, client, block.id);
        results.push(...childResults);
      }
    } catch (error) {
      console.error(`Error fetching children for block ${block.id}:`, error);
    }
  }
  
  return results;
};

/**
 * Get blocks and their children from a page or block
 * @param {Object} block - The Notion block
 * @param {Object} client - The Notion client instance
 * @returns {Promise<Array>} Array of SimpleBlockType objects
 */
const getTextFromBlock = async (block, client) => {
  return await processBlockWithChildren(block, client);
};

module.exports = {
  getPlainTextFromRichText,
  getTextFromBlock,
  extractTextContent
};
