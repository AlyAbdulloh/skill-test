export interface Feature {
  id: number
  parentId: number | null
  code: string
  name: string
  routePath: string
  icon: string
  sortOrder: number
  isActive: boolean
}
