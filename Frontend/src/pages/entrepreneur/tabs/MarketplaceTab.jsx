import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import { useNavigate } from "react-router-dom";

const MarketplaceTab = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [minRating, setMinRating] = useState("");

    const navigate = useNavigate();

    const handleViewDetails = (productId) => {
        navigate(`/products/${productId}`);
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "products"));
                const productsData = [];

                querySnapshot.forEach((doc) => {
                    productsData.push({
                        id: doc.id,
                        ...doc.data(),
                    });
                });

                setProducts(productsData);
                setFilteredProducts(productsData);
            } catch (error) {
                console.error("Error fetching products: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        const results = products.filter(product =>
            product.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (minRating === "" || (product.rating || 0) >= parseFloat(minRating))
        );
        setFilteredProducts(results);
    }, [searchTerm, minRating, products]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <CardTitle>Marketplace Products</CardTitle>
                        <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                            <Input
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full md:w-64"
                            />
                            <select
                                value={minRating}
                                onChange={(e) => setMinRating(e.target.value)}
                                className="border border-gray-300 rounded px-3 py-2 text-sm"
                            >
                                <option value="">All Ratings</option>
                                <option value="1">1★ and up</option>
                                <option value="2">2★ and up</option>
                                <option value="3">3★ and up</option>
                                <option value="4">4★ and up</option>
                                <option value="5">5★ only</option>
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex gap-4">
                                    <Skeleton className="h-5 w-1/4" />
                                    <Skeleton className="h-5 w-1/6" />
                                    <Skeleton className="h-5 w-1/6" />
                                    <Skeleton className="h-5 w-1/6" />
                                    <Skeleton className="h-5 w-1/6" />
                                </div>
                            ))}
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-lg">No products found</p>
                            {searchTerm && (
                                <p className="text-sm text-gray-500 mt-2">
                                    No matches for "{searchTerm}"
                                </p>
                            )}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Views</TableHead>
                                    <TableHead>Orders</TableHead>
                                    <TableHead>Conversion</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProducts.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>{product.views || 0}</TableCell>
                                        <TableCell>{product.orders || 0}</TableCell>
                                        <TableCell>{product.conversion ? `${product.conversion}%` : "0%"}</TableCell>
                                        <TableCell>{product.rating ? `${product.rating} ★` : "0 ★"}</TableCell>
                                        <TableCell>
                                            <button
                                                onClick={() => handleViewDetails(product.id)}
                                                className="text-blue-600 hover:underline"
                                            >
                                                View
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default MarketplaceTab;
