import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

const formatCloudinaryUrl = (url) => {
  if (!url) return null;
  return url.replace("upload/", "upload/w_500,h_500,c_fill,q_auto/");
};

const ProductDetails = () => {
  const { id } = useParams(); // URL param
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productRef = doc(db, "products", id);
        const productSnap = await getDoc(productRef);
        if (productSnap.exists()) {
          const data = productSnap.data();
          setProduct({
            ...data,
            imageUrl: formatCloudinaryUrl(data.imageUrl || data.imageUrls?.[0] || "")
          });
        }
      } catch (error) {
        console.error("Error loading product: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <Skeleton className="w-full h-80 rounded-lg mb-4" />
          <Skeleton className="h-6 w-1/2 mb-2" />
          <Skeleton className="h-4 w-1/3 mb-1" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-10 w-40 mt-4" />
        </CardContent>
      </Card>
    );
  }

  if (!product) {
    return <p className="text-center text-lg mt-10">Product not found.</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{product.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/2">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-auto rounded-lg object-cover"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/500";
              }}
            />
          </div>
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">{product.category}</p>
            <p className="text-xl font-semibold text-primary">₹{product.price}</p>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.floor(product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                />
              ))}
              <span className="ml-2 text-sm text-gray-500">({product.rating?.toFixed(1) || 0})</span>
            </div>
            <p className="text-sm text-gray-600">{product.description}</p>
            <p className="text-sm text-gray-500">Stock: {product.stock || 0}</p>
            <p className="text-sm text-gray-500">{product.views || 0} views</p>
            <p className="text-sm text-gray-500">{product.orders || 0} orders</p>
            <Button className="w-full mt-4">Buy Now</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductDetails;
