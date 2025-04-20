// src/components/InventoryForm.jsx
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner" // updated import
import { db } from "../firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
// import uploadFile from "../services/uploadService" // Make sure this exists

const InventoryForm = () => {
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    imageFile: null,
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (name === "imageFile") {
      setProduct((prev) => ({ ...prev, imageFile: files[0] }))
    } else {
      setProduct((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let imageUrl = ""
      if (product.imageFile) {
        imageUrl = await uploadFile(product.imageFile)
      }

      await addDoc(collection(db, "products"), {
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        quantity: parseInt(product.quantity),
        imageUrl,
        createdAt: serverTimestamp(),
      })

      toast.success("Product added successfully!", {
        description: product.name,
      })

      setProduct({
        name: "",
        description: "",
        price: "",
        quantity: "",
        imageFile: null,
      })
    } catch (error) {
      console.error("Error adding product:", error)
      toast.error("Error adding product", {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-2xl font-semibold text-orange-600">Add New Product / Service</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Product Name</Label>
          <Input id="name" name="name" value={product.name} onChange={handleChange} required />
        </div>

        <div>
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            value={product.price}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="quantity">Stock Quantity</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min="0"
            value={product.quantity}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="imageFile">Image Upload</Label>
          <Input
            id="imageFile"
            name="imageFile"
            type="file"
            accept="image/*"
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={product.description}
          onChange={handleChange}
          required
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Product"}
      </Button>
    </form>
  )
}

export default InventoryForm
