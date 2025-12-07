export interface GraphNode {
    node_id: number
    label: string
    description: string
    x: number
    y: number
    z: number
}

export type Coordinates = [number, number, number]

export interface GraphEdge {
    source: Coordinates
    target: Coordinates
}

export interface GraphResponse {
    nodes: GraphNode[]
    edges: GraphEdge[]
}