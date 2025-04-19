import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { db, storage, auth } from "../../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import { onAuthStateChanged } from "firebase/auth";

const ProductsTab = () => {
    const [products, setProducts] = useState([]);
    const [newProduct, setNewProduct] = useState({
        name: "",
        price: "",
        stock: "",
        category: "",
        description: "",
        imageUrl: ""
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [editProductId, setEditProductId] = useState(null);
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            if (user) {
                
            }
        });
        return () => unsubscribe();
    }, []);
    // Fetch products from Firestore
    const handleEditClick = (product) => {
        setNewProduct({
            name: product.name,
            price: product.price,
            stock: product.stock,
            category: product.category,
            sellerid: currentUser?.uid || "",
            description: product.description,
            imageUrls: product.imageUrls || []
        });
        setImageFiles([]);
        setEditProductId(product.id);
    };

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const querySnapshot = await getDocs(collection(db, "products"));
                const productsData = [];
                querySnapshot.forEach((doc) => {
                    productsData.push({ id: doc.id, ...doc.data() });
                });
                setProducts(productsData);
            } catch (error) {
                console.error("Error fetching products: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleImageChange = (e) => {
        if (e.target.files.length > 0) {
            setImageFiles(Array.from(e.target.files));
        }
    };

    const uploadImagesToCloudinary = async () => {
        const uploadedUrls = [];

        for (const file of imageFiles) {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "ruralEmpowerment");
            formData.append("cloud_name", "dczpxrdq1");

            try {
                const res = await fetch("https://api.cloudinary.com/v1_1/dczpxrdq1/image/upload", {
                    method: "POST",
                    body: formData
                });
                const data = await res.json();
                uploadedUrls.push(data.secure_url);
            } catch (err) {
                console.error("Error uploading to Cloudinary:", err);
            }
        }

        return uploadedUrls;
    };

    const sendWhatsAppMessage = async (productId, productName, category, price) => {
        try {
            // Get current user's phone number from Firebase
            const user = auth.currentUser;
            if (!user) throw new Error("User not authenticated");

            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (!userDoc.exists()) throw new Error("User document not found");

            const userData = userDoc.data();
            const phoneNumber = userData.phoneNumber; // Assuming phoneNumber is stored in user document

            if (!phoneNumber) throw new Error("Phone number not found for user");

            // Create product link
            const productLink = `${window.location.origin}/product/${productId}`;

            // Create message
            const message = `New Product Added!\n\n` +
                `*Name:* ${productName}\n` +
                `*Category:* ${category}\n` +
                `*Price:* ₹${price}\n\n` +
                `View product: ${productLink}`;

            // Send to backend
            const response = await fetch('/api/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    number: phoneNumber,
                    message: message
                })
            });

            if (!response.ok) throw new Error('Failed to send message');

            return await response.json();
        } catch (error) {
            console.error("Error sending WhatsApp message:", error);
            throw error;
        }
    };

    const handleAddOrUpdateProduct = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let uploadedUrls = [];

            // Upload new files if selected
            if (imageFiles.length > 0) {
                uploadedUrls = await uploadImagesToCloudinary();
            }

            const finalImageUrls = imageFiles.length > 0 ? uploadedUrls : newProduct.imageUrls;

            const productData = {
                name: newProduct.name,
                price: Number(newProduct.price),
                stock: Number(newProduct.stock),
                category: newProduct.category,
                description: newProduct.description,
                imageUrls: finalImageUrls,
                updatedAt: new Date().toISOString()
            };

            if (editProductId) {
                // UPDATE
                const productRef = doc(db, "products", editProductId);
                await updateDoc(productRef, productData);

                setProducts(products.map(p =>
                    p.id === editProductId ? { id: editProductId, ...productData } : p
                ));
            } else {
                // ADD NEW
                const docRef = await addDoc(collection(db, "products"), {
                    ...productData,
                    createdAt: new Date().toISOString()
                });

                // Send WhatsApp message for new products only
                try {
                    await sendWhatsAppMessage(
                        docRef.id,
                        newProduct.name,
                        newProduct.category,
                        newProduct.price
                    );
                } catch (error) {
                    console.error("WhatsApp notification failed, but product was added", error);
                }

                setProducts([...products, { id: docRef.id, ...productData }]);
            }

            // Clear form
            setNewProduct({ name: "", price: "", stock: "", category: "", description: "", imageUrls: [] });
            setImageFiles([]);
            setEditProductId(null);
        } catch (error) {
            console.error("Error adding/updating product: ", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Products table */}
            <Card>
                <CardHeader>
                    <CardTitle>My Products</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading && products.length === 0 ? (
                        <p>Loading products...</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>#{product.id.substring(0, 8)}</TableCell>
                                        <TableCell className="flex items-center gap-2">
                                            {product.imageUrl && (
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className="w-10 h-10 object-cover rounded"
                                                />
                                            )}
                                            {product.name}
                                        </TableCell>
                                        <TableCell>₹{product.price}</TableCell>
                                        <TableCell>
                                            <Badge variant={product.stock < 10 ? "destructive" : "default"}>
                                                {product.stock} left
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{product.category}</TableCell>
                                        <TableCell>
                                            <Button
                                                size="sm"
                                                className="mr-2"
                                                onClick={() => handleEditClick(product)}
                                            >
                                                Edit
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Add Product Form */}
            <Card>
                <CardHeader>
                    <CardTitle>{editProductId ? "Edit Product" : "Add New Product"}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddOrUpdateProduct} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Product Name</label>
                                <Input
                                    value={newProduct.name}
                                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                    placeholder="Enter product name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Price (₹)</label>
                                <Input
                                    type="number"
                                    value={newProduct.price}
                                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                    placeholder="Enter price"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Stock Quantity</label>
                                <Input
                                    type="number"
                                    value={newProduct.stock}
                                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                                    placeholder="Enter stock quantity"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Category</label>
                                <Input
                                    value={newProduct.category}
                                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                    placeholder="Enter category"
                                    required
                                />
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Product Image</label>
                            <Input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                            />

                            {imageFiles.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                                    {imageFiles.map((file, idx) => (
                                        <div key={idx}>
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt="preview"
                                                className="h-20 w-full object-cover rounded"
                                            />
                                            <p className="text-xs text-gray-500">{file.name}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <Textarea
                                value={newProduct.description}
                                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                placeholder="Enter product description"
                                rows={3}
                            />
                        </div>
                        {editProductId && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setEditProductId(null);
                                    setNewProduct({ name: "", price: "", stock: "", category: "", description: "", imageUrls: [] });
                                    setImageFiles([]);
                                }}
                                className="mt-4 ml-2"
                            >
                                Cancel
                            </Button>
                        )}
                        <div className="flex justify-end">
                            <Button type="submit" className="mt-4" disabled={loading}>
                                {editProductId ? "Update Product" : "Add Product"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProductsTab;