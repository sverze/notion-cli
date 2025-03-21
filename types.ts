export interface NotionConfig {
  token: string;
  pageId: string;
}

export interface SimpleBlockType {
  blockId: string;
  text: string;
  blockType: string;
  parentBlockId?: string;
}
