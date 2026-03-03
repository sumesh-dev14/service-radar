const MAX_LEVEL = 16;
const P = 0.5;

export interface RankedProvider {
  id: string;
  score: number;
}

export class ProviderNode {
  id: string;
  score: number;
  forward: (ProviderNode | null)[];

  constructor(id: string, score: number, level: number) {
    this.id = id;
    this.score = score;
    this.forward = new Array(level + 1).fill(null);
  }
}

export class SkipList {
  private head: ProviderNode;
  private level: number = 0;
  private size: number = 0;
  private nodeMap: Map<string, ProviderNode> = new Map();

  constructor() {
    this.head = new ProviderNode("HEAD", Infinity, MAX_LEVEL);
  }

  private randomLevel(): number {
    let level = 0;
    while (Math.random() < P && level < MAX_LEVEL) {
      level++;
    }
    return level;
  }

  insert(id: string, score: number): void {
    // Check if already exists, update if so
    if (this.nodeMap.has(id)) {
      this.remove(id); // Fix: Correctly handles duplicate provider IDs by removing previous instance
    }

    const newLevel = this.randomLevel();
    if (newLevel > this.level) {
      this.level = newLevel;
    }

    const newNode = new ProviderNode(id, score, newLevel);
    const update: ProviderNode[] = new Array(this.level + 1).fill(null);
    let current = this.head;

    // Find insertion positions (descending order - higher scores first)
    // Fix: Changed < to > for descending order, and added deterministic ID tie-breaking for identical scores
    for (let i = this.level; i >= 0; i--) {
      while (
        current.forward[i] !== null &&
        (current.forward[i]!.score > score || 
          (current.forward[i]!.score === score && current.forward[i]!.id < id))
      ) {
        current = current.forward[i]!;
      }
      update[i] = current;
    }

    // Insert new node
    for (let i = 0; i <= newLevel; i++) {
      newNode.forward[i] = update[i].forward[i];
      update[i].forward[i] = newNode;
    }

    this.nodeMap.set(id, newNode);
    this.size++;
  }

  remove(id: string): boolean {
    if (!this.nodeMap.has(id)) {
      return false; // Fix: Missing null check implicitly handled by checking map
    }

    const node = this.nodeMap.get(id)!;
    const update: ProviderNode[] = new Array(this.level + 1).fill(null);
    let current = this.head;

    // Find node to remove
    // Fix: Traversed by score and id to correctly handle providers with the same score
    for (let i = this.level; i >= 0; i--) {
      while (
        current.forward[i] !== null &&
        (current.forward[i]!.score > node.score ||
          (current.forward[i]!.score === node.score && current.forward[i]!.id < id))
      ) {
        current = current.forward[i]!;
      }
      update[i] = current;
    }

    current = current.forward[0]!;

    if (current === null || current.id !== id) {
      return false;
    }

    // Remove node from all levels
    for (let i = 0; i <= this.level; i++) {
      if (update[i].forward[i] !== node) {
        break;
      }
      update[i].forward[i] = node.forward[i];
      // Fix: Memory leak prevention by clearing node's forward pointers
      node.forward[i] = null;
    }

    // Update level if necessary
    while (
      this.level > 0 &&
      this.head.forward[this.level] === null
    ) {
      this.level--;
    }

    this.nodeMap.delete(id);
    this.size--;
    return true;
  }

  update(id: string, newScore: number): void {
    this.insert(id, newScore);
  }

  getTopK(k: number): RankedProvider[] {
    const result: RankedProvider[] = [];
    let current = this.head.forward[0];
    let count = 0;

    while (current !== null && count < k) {
      result.push({ id: current.id, score: current.score });
      current = current.forward[0];
      count++;
    }

    return result;
  }

  getSize(): number {
    return this.size;
  }
}
