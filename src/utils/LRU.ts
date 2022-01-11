type Node<ValueType> = {
    key: string
    value: ValueType
    prev?: Node<ValueType>
    next?: Node<ValueType>
}

// https://medium.com/dsinjs/implementing-lru-cache-in-javascript-94ba6755cda9
export class LRUCache<ValueType> {
    
    private capacity: number;
    private map: Map<string, Node<ValueType>>;
    private head?: Node<ValueType>;
    private tail?: Node<ValueType>;

    constructor(capacity: number){
        this.capacity = capacity;
        this.map = new Map<string, Node<ValueType>>();
        this.head = undefined;
        this.tail = undefined;
    }

    public put(key: string, value: ValueType) {
        const foundNode = this.map.get(key);
        if( foundNode ) {
            this.detach(foundNode);
            this.map.delete(key);
        } else if( this.map.size >= this.capacity && this.tail ) {
            this.map.delete(this.tail.key);
            this.detach(this.tail);
        }

        if( this.head ) {
            const node = {
                key, value, next: this.head
            }
            this.head.prev = node;
            this.head = node;
        } else {
            this.head = this.tail = {
                key, value
            }
        }

        this.map.set(key, this.head);
    }

    public get(key: string): ValueType | null {
        const foundNode = this.map.get(key);
        if( foundNode ) {
            if( this.head !== foundNode ) {
                this.put(key, foundNode.value);
            }
            return foundNode.value;
        }
        return null;
    }

    public clear() {
        this.head = undefined;
        this.tail = undefined;
        this.map.clear();
    }

    private detach(node: Node<ValueType>) {
        if( node.prev ) { node.prev.next = node.next }
        else { this.head = node.next }

        if( node.next ) { node.next.prev = node.prev }
        else { this.tail = node.next }
    }

}