import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

import { db, auth } from "../../firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Plus, Minus, MessageSquare } from "lucide-react";
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import { toast } from "react-hot-toast";
import { onAuthStateChanged } from "firebase/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const formatCloudinaryUrl = (url) => {
  if (!url) return null;
  return url.replace("upload/", "upload/w_500,h_500,c_fill,q_auto/");
};

const ProductDetails = () => {
  const { id } = useParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [cartItems, setCartItems] = useState([]);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [userReview, setUserReview] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Calculate total amount
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        fetchCartItems(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  // Effect to fetch product and check user review when product id or user changes
  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Effect to check user review when product or user changes
  useEffect(() => {
    if (currentUser && product) {
      checkUserReview(currentUser.uid);
    }
  }, [currentUser, product]);

  // Reset review form when dialog opens/closes
  useEffect(() => {
    if (isReviewModalOpen && userReview) {
      // If editing existing review, load the existing values
      setRating(userReview.rating);
      setReview(userReview.comment);
    } else if (!isReviewModalOpen) {
      // If closing dialog and no user review, reset form
      if (!userReview) {
        setRating(0);
        setReview("");
      }
    }
  }, [isReviewModalOpen, userReview]);

  const fetchCartItems = async (userId) => {
    try {
      const cartRef = doc(db, "carts", userId);
      const cartSnap = await getDoc(cartRef);
      if (cartSnap.exists()) {
        setCartItems(cartSnap.data().items || []);
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  const checkUserReview = async (userId) => {
    try {
      if (!product || !product.reviews) return;
      
      const userReview = product.reviews.find((r) => r.userId === userId);
      setUserReview(userReview || null);
      
      if (userReview) {
        setRating(userReview.rating);
        setReview(userReview.comment);
      }
    } catch (error) {
      console.error("Error checking user review:", error);
    }
  };

  const [sliderRef] = useKeenSlider({
    loop: true,
    slides: {
      perView: 1,
    },
  });

  // Helper function to ensure rating is a number
  const getNumericRating = (ratingValue) => {
    if (typeof ratingValue === 'string') {
      return parseFloat(ratingValue) || 0;
    }
    return ratingValue || 0;
  };

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const productRef = doc(db, "products", id);
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const data = productSnap.data();
        const imageUrls = data.imageUrls?.length
          ? data.imageUrls.map((url) => formatCloudinaryUrl(url))
          : [formatCloudinaryUrl(data.imageUrl)];
        
        // Ensure rating is a number
        const numericRating = getNumericRating(data.rating);
        
        setProduct({ 
          ...data, 
          id: productSnap.id, 
          imageUrls,
          rating: numericRating
        });
      }
    } catch (error) {
      console.error("Error loading product: ", error);
      toast.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const updateCart = async (items) => {
    try {
      const cartRef = doc(db, "carts", currentUser.uid);
      await updateDoc(cartRef, {
        items,
        updatedAt: new Date().toISOString(),
      });
      setCartItems(items);
    } catch (error) {
      console.error("Error updating cart:", error);
      throw error;
    }
  };

  const addToCart = async () => {
    if (!currentUser) {
      toast.error("Please login to add items to cart");
      return;
    }

    setCartLoading(true);
    try {
      const cartRef = doc(db, "carts", currentUser.uid);
      const cartSnap = await getDoc(cartRef);

      const cartItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrls?.[0] || product.imageUrl,
        quantity: quantity,
        addedAt: new Date().toISOString(),
      };

      if (cartSnap.exists()) {
        const existingItemIndex = cartItems.findIndex(
          (item) => item.productId === product.id
        );

        if (existingItemIndex >= 0) {
          const updatedItems = [...cartItems];
          updatedItems[existingItemIndex].quantity += quantity;
          await updateCart(updatedItems);
        } else {
          await updateDoc(cartRef, {
            items: arrayUnion(cartItem),
            updatedAt: new Date().toISOString(),
          });
          setCartItems([...cartItems, cartItem]);
        }
      } else {
        await setDoc(cartRef, {
          userId: currentUser.uid,
          items: [cartItem],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        setCartItems([cartItem]);
      }

      toast.success(`${quantity} ${product.name} added to cart!`);
      setQuantity(1);
    } catch (error) {
      console.error("Error adding to cart: ", error);
      toast.error("Failed to add to cart");
    } finally {
      setCartLoading(false);
    }
  };

  const submitReview = async () => {
    if (!currentUser) {
      toast.error("Please login to submit a review");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setReviewSubmitting(true);
    try {
      const productRef = doc(db, "products", id);
      const reviewData = {
        userId: currentUser.uid,
        userName: currentUser.displayName || "Anonymous",
        rating,
        comment: review,
        createdAt: new Date().toISOString(),
      };

      // Transaction to safely update reviews
      if (userReview) {
        // First remove the old review
        await updateDoc(productRef, {
          reviews: arrayRemove(userReview),
        });
      }
      
      // Then add the new/updated review
      await updateDoc(productRef, {
        reviews: arrayUnion(reviewData),
      });

      // Update average rating
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const updatedProduct = productSnap.data();
        const reviews = updatedProduct.reviews || [];
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        
        // Store rating as a number
        const numericRating = parseFloat(avgRating.toFixed(1));
        
        await updateDoc(productRef, {
          rating: numericRating
        });
        
        // Update local product state with numeric rating
        setProduct({
          ...product,
          reviews,
          rating: numericRating
        });
        
        // Update user review state
        setUserReview(reviewData);
      }

      toast.success(userReview ? "Review updated successfully!" : "Review submitted successfully!");
      setIsReviewModalOpen(false);
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleOpenReviewModal = () => {
    if (!currentUser) {
      toast.error("Please login to submit a review");
      return;
    }
    setIsReviewModalOpen(true);
  };

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

  // Get the rating as a number for display
  const displayRating = getNumericRating(product.rating);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{product.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/2">
            <div ref={sliderRef} className="keen-slider rounded-lg overflow-hidden">
              {product.imageUrls.map((url, idx) => (
                <div key={idx} className="keen-slider__slide">
                  <img
                    src={url}
                    alt={`Product ${idx + 1}`}
                    className="w-full h-[300px] object-contain"
                    onError={(e) => (e.target.src = "https://via.placeholder.com/500")}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">{product.category}</p>
            <p className="text-xl font-semibold text-primary">₹{product.price}</p>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(displayRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-gray-500">
                ({displayRating.toFixed(1)}) from {product.reviews?.length || 0} reviews
              </span>
              <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="link" size="sm" className="ml-2" onClick={handleOpenReviewModal}>
                    <MessageSquare className="h-4 w-4 mr-1" />
                    {userReview ? "Edit Review" : "Add Review"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{userReview ? "Edit your review" : "Rate this product"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-8 w-8 cursor-pointer ${
                            i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                          onClick={() => setRating(i + 1)}
                        />
                      ))}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="review">Your Review</Label>
                      <Textarea
                        id="review"
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder="Share your thoughts about this product..."
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsReviewModalOpen(false)}
                        disabled={reviewSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={submitReview} 
                        disabled={reviewSubmitting}
                      >
                        {reviewSubmitting ? "Submitting..." : "Submit"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <p className="text-sm text-gray-600">{product.description}</p>
            <div className="flex items-center gap-2">
              <Badge variant={product.stock < 10 ? "destructive" : "default"}>
                {product.stock} left in stock
              </Badge>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className="px-2"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-4">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={increaseQuantity}
                  disabled={quantity >= product.stock}
                  className="px-2"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-sm text-gray-500">
                Max: {product.stock}
              </span>
            </div>

            {/* Subtotal for this product */}
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm font-medium">Subtotal:</span>
              <span className="text-lg font-semibold">
                ₹{(product.price * quantity).toFixed(2)}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button
                className="w-full sm:w-auto"
                onClick={addToCart}
                disabled={cartLoading || product.stock === 0}
              >
                {cartLoading ? "Adding..." : "Add to Cart"}
              </Button>
              <Button className="w-full sm:w-auto" variant="secondary">
                Buy Now
              </Button>
            </div>

            {/* Cart Summary */}
            {cartItems.length > 0 && (
              <div className="mt-6 p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Your Cart Summary</h3>
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="flex justify-between">
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-semibold mt-3 pt-2 border-t">
                  <span>Total:</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reviews Section */}
      {product.reviews?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {product.reviews.map((review, index) => (
                <div key={index} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{review.userName}</div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductDetails;