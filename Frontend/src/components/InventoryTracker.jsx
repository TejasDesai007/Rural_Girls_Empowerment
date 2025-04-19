// src/components/InventoryTracker.jsx
import React from "react"; // Added React import
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { CircleAlert, Plus, Trash2 } from "lucide-react"

const InventoryTracker = ({ simplified = false }) => {
  // Sample inventory data
  const [inventory, setInventory] = React.useState([
    { id: 1, name: "Cotton Fabric", quantity: 15, unit: "meters", lowStock: 5 },
    { id: 2, name: "Thread", quantity: 8, unit: "spools", lowStock: 3 },
    { id: 3, name: "Buttons", quantity: 2, unit: "packets", lowStock: 4 }
  ])

  const [newItem, setNewItem] = React.useState({
    name: "",
    quantity: "",
    unit: "",
    lowStock: ""
  })

  const handleAddItem = () => {
    if (newItem.name && newItem.quantity) {
      setInventory([
        ...inventory,
        {
          id: inventory.length + 1,
          name: newItem.name,
          quantity: parseInt(newItem.quantity),
          unit: newItem.unit || "units",
          lowStock: parseInt(newItem.lowStock) || 2
        }
      ])
      setNewItem({ name: "", quantity: "", unit: "", lowStock: "" })
    }
  }

  const handleRemoveItem = (id) => {
    setInventory(inventory.filter(item => item.id !== id))
  }

  const lowStockItems = inventory.filter(item => item.quantity <= item.lowStock)

  return (
    <div className="space-y-4">
      {!simplified && (
        <div className="flex items-center gap-2">
          <Input
            placeholder="Item name"
            value={newItem.name}
            onChange={(e) => setNewItem({...newItem, name: e.target.value})}
            className="max-w-xs"
          />
          <Input
            placeholder="Qty"
            type="number"
            value={newItem.quantity}
            onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
            className="w-20"
          />
          <Input
            placeholder="Unit"
            value={newItem.unit}
            onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
            className="w-24"
          />
          <Button size="sm" onClick={handleAddItem}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      )}

      {lowStockItems.length > 0 && (
        <Alert variant="destructive">
          <CircleAlert className="h-4 w-4" />
          <AlertTitle>Low stock alert!</AlertTitle>
          <AlertDescription>
            {lowStockItems.map(item => `${item.name} (${item.quantity} ${item.unit})`).join(", ")}
          </AlertDescription>
        </Alert>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            {!simplified && <TableHead className="text-right">Alert Level</TableHead>}
            {!simplified && <TableHead className="text-right">Action</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {inventory.map((item) => (
            <TableRow 
              key={item.id} 
              className={item.quantity <= item.lowStock ? "bg-red-50" : ""}
            >
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="text-right">
                {item.quantity} {item.unit}
              </TableCell>
              {!simplified && (
                <TableCell className="text-right text-sm text-gray-500">
                  Alerts at {item.lowStock}
                </TableCell>
              )}
              {!simplified && (
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {simplified && (
        <Button variant="outline" size="sm" className="w-full mt-2">
          View Full Inventory
        </Button>
      )}
    </div>
  )
}

export default InventoryTracker