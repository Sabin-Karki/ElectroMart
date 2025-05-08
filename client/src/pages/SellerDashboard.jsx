import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from "wouter";
import { useAuth } from "../utils/auth";
import { apiRequest } from "../utils/api";
import { useToast } from "@/hooks/use-toast";
import ProductCard from '../components/ProductCard';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

// Fetch seller's products
const fetchSellerProducts = async () => {
  const response = await apiRequest('GET', '/api/seller/products');
  if (!response.ok) {
    throw new Error('Network response was not ok when fetching seller products');
  }
  return response.json();
};

// Add new product mutation
const addProduct = async (productData) => {
  const response = await apiRequest('POST', '/api/seller/products', productData);
  if (!response.ok) {
    // Try to get error message from backend
    const errorData = await response.json().catch(() => ({})); 
    throw new Error(errorData.message || 'Failed to add product');
  }
  return response.json();
};

// Edit existing product
const editProduct = async ({ id, ...productData }) => {
  const response = await apiRequest('PUT', `/api/seller/products/${id}`, productData);
   if (!response.ok) {
    const errorData = await response.json().catch(() => ({})); 
    throw new Error(errorData.message || 'Failed to update product');
  }
  return response.json();
};

// Delete product (soft delete)
const deleteProduct = async (id) => {
  const response = await apiRequest('DELETE', `/api/seller/products/${id}`);
   if (!response.ok) {
     const errorData = await response.json().catch(() => ({})); 
    throw new Error(errorData.message || 'Failed to delete product');
  }
  // No JSON body on 204 No Content
};

// Product Form (Used for both Add and Edit)
const ProductForm = ({ initialData = {}, onSubmit, isLoading, submitText = "Submit" }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    description: initialData.description || '',
    price: initialData.price || '',
    category: initialData.category || '',
    stock: initialData.stock || '',
    imageUrl: initialData.imageUrl || ''
  });
  const [imagePreview, setImagePreview] = useState(initialData.imageUrl || '');
  const { toast } = useToast();

  // Update form if initialData changes (for Edit)
  useEffect(() => {
    setFormData({
      name: initialData.name || '',
      description: initialData.description || '',
      price: initialData.price ? String(parseFloat(initialData.price).toFixed(2)) : '', // Format price for input
      category: initialData.category || '',
      stock: initialData.stock ? String(initialData.stock) : '',
      imageUrl: initialData.imageUrl || ''
    });
    setImagePreview(initialData.imageUrl || '');
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'imageUrl') {
      if (value && (value.startsWith('http://') || value.startsWith('https://'))) {
        setImagePreview(value);
      } else {
        setImagePreview('');
      }
    }
  };
  
  const handleSelectChange = (value) => {
      setFormData(prev => ({ ...prev, category: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ 
      ...formData, 
      price: String(formData.price), // Ensure price is string
      stock: parseInt(formData.stock) || 0
    });
  };
  
  const categories = ["Accessories", "Audio", "Monitors", "Laptops", "Phones", "Storage", "Wearables"];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <Input type="text" name="name" id="name" required value={formData.name} onChange={handleInputChange} />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <Textarea name="description" id="description" rows={3} required value={formData.description} onChange={handleInputChange} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
          <Input type="number" name="price" id="price" required min="0.01" step="0.01" value={formData.price} onChange={handleInputChange} />
        </div>
        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
          <Input type="number" name="stock" id="stock" required min="0" step="1" value={formData.stock} onChange={handleInputChange} />
        </div>
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <Select name="category" required value={formData.category} onValueChange={handleSelectChange}>
           <SelectTrigger>
             <SelectValue placeholder="Select a category" />
           </SelectTrigger>
           <SelectContent>
             {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
           </SelectContent>
         </Select>
      </div>
      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
        <Input type="url" name="imageUrl" id="imageUrl" placeholder="https://..." value={formData.imageUrl} onChange={handleInputChange} />
        {imagePreview && (
          <div className="mt-2 border rounded p-2 inline-block bg-gray-50">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="h-24 w-auto object-contain"
              onError={(e) => { 
                e.target.style.display='none'; 
                setImagePreview(''); 
                toast({ title: "Invalid Image URL", variant: "destructive"});
              }}
             />
          </div>
        )}
      </div>
       <DialogFooter className="pt-4">
          <DialogClose asChild>
             <Button type="button" variant="outline">Cancel</Button>
           </DialogClose>
           <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : submitText}</Button>
        </DialogFooter>
    </form>
  );
};

const SellerDashboard = () => {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  
  const { 
    data: products = [], 
    isLoading, 
    error 
  } = useQuery({ 
    queryKey: ['sellerProducts', user?.id], 
    queryFn: fetchSellerProducts,
    enabled: !!user,
    staleTime: 30000, // Consider data fresh for 30 seconds
    cacheTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });

  const addMutation = useMutation({ 
    mutationFn: addProduct,
    onMutate: async (newProduct) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['sellerProducts', user?.id] });

      // Snapshot the previous value
      const previousProducts = queryClient.getQueryData(['sellerProducts', user?.id]);

      // Optimistically update to the new value
      queryClient.setQueryData(['sellerProducts', user?.id], old => [...(old || []), { 
        ...newProduct, 
        id: 'temp-' + Date.now(),
        isActive: true,
        createdAt: new Date()
      }]);

      return { previousProducts };
    },
    onError: (err, newProduct, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(['sellerProducts', user?.id], context.previousProducts);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure data is in sync
      queryClient.invalidateQueries({ queryKey: ['sellerProducts', user?.id] });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Product added successfully." });
      setIsAddModalOpen(false);
    }
  });

  const editMutation = useMutation({
    mutationFn: editProduct,
    onMutate: async (updatedProduct) => {
      await queryClient.cancelQueries({ queryKey: ['sellerProducts', user?.id] });
      const previousProducts = queryClient.getQueryData(['sellerProducts', user?.id]);

      queryClient.setQueryData(['sellerProducts', user?.id], old =>
        old.map(product => product.id === updatedProduct.id ? { ...product, ...updatedProduct } : product)
      );

      return { previousProducts };
    },
    onError: (err, updatedProduct, context) => {
      queryClient.setQueryData(['sellerProducts', user?.id], context.previousProducts);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerProducts', user?.id] });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Product updated successfully." });
      setIsEditModalOpen(false);
      setCurrentProduct(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ['sellerProducts', user?.id] });
      const previousProducts = queryClient.getQueryData(['sellerProducts', user?.id]);

      queryClient.setQueryData(['sellerProducts', user?.id], old =>
        old.map(product => 
          product.id === deletedId 
            ? { ...product, isActive: false } 
            : product
        )
      );

      return { previousProducts };
    },
    onError: (err, deletedId, context) => {
      queryClient.setQueryData(['sellerProducts', user?.id], context.previousProducts);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerProducts', user?.id] });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Product deleted successfully." });
    }
  });

  const handleOpenEditModal = (product) => {
    setCurrentProduct(product);
    setIsEditModalOpen(true);
  };
  
  const handleDeleteProduct = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteMutation.mutate(id);
    }
  };

  const renderProductList = () => {
    if (isLoading) {
      // Skeleton Loading for Products
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-48 w-full" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
              <CardFooter>
                 <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load products: {error.message}</AlertDescription>
        </Alert>
      );
    }

    if (!products || products.length === 0) {
      return <p className="text-gray-500 text-center py-10">You haven't listed any products yet.</p>;
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
           <Card key={product.id} className="flex flex-col">
              <CardHeader className="p-0 relative">
                  <Badge variant={product.isActive ? "secondary" : "destructive"} className="absolute top-2 right-2 z-10">
                      {product.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <img 
                      src={product.imageUrl || 'https://via.placeholder.com/300/cccccc/000000?text=No+Image'} 
                      alt={product.name} 
                      className="w-full h-48 object-cover rounded-t-lg"
                      onError={(e) => { e.target.src='https://via.placeholder.com/300/cccccc/000000?text=Load+Error'; }}
                  />
              </CardHeader>
              <CardContent className="pt-4 flex-grow">
                  <CardTitle className="text-lg font-semibold mb-1 truncate" title={product.name}>{product.name}</CardTitle>
                  <p className="text-sm text-gray-500 mb-2 capitalize">{product.category || 'Uncat.'}</p>
                  <p className="text-lg font-bold text-primary mb-2">${parseFloat(product.price).toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Stock: {product.stock}</p>
              </CardContent>
              <CardFooter className="flex justify-between pt-4 border-t">
                  <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(product)}>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product.id)} disabled={deleteMutation.isLoading}>
                      {deleteMutation.isLoading && deleteMutation.variables === product.id ? 'Deleting...' : 'Delete'}
                  </Button>
              </CardFooter>
           </Card>
        ))}
      </div>
    );
  };
  
  return (
    <div className="container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
         <h1 className="text-3xl font-bold text-gray-800">Seller Dashboard</h1>
         {/* Add Product Dialog Trigger */}
         <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
           <DialogTrigger asChild>
              <Button>Add New Product</Button>
           </DialogTrigger>
           <DialogContent className="sm:max-w-[600px]">
             <DialogHeader>
               <DialogTitle>Add New Product</DialogTitle>
             </DialogHeader>
             <ProductForm 
                onSubmit={(data) => addMutation.mutate(data)} 
                isLoading={addMutation.isLoading}
                submitText="Add Product"
             />
           </DialogContent>
         </Dialog>
      </div>
      
      {/* My Products Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">My Listed Products</h2>
        {renderProductList()}
              </div>
              
      {/* Edit Product Dialog */}
      {currentProduct && (
          <Dialog open={isEditModalOpen} onOpenChange={(open) => { if (!open) setCurrentProduct(null); setIsEditModalOpen(open); }}>
           <DialogContent className="sm:max-w-[600px]">
             <DialogHeader>
               <DialogTitle>Edit Product: {currentProduct.name}</DialogTitle>
             </DialogHeader>
             <ProductForm 
                initialData={currentProduct}
                onSubmit={(data) => editMutation.mutate({ id: currentProduct.id, ...data })} 
                isLoading={editMutation.isLoading}
                submitText="Update Product"
             />
           </DialogContent>
         </Dialog>
      )}

       {/* Add CSS for input fields focus state if not handled globally by Shadcn */}
       <style jsx global>{`
         /* You might not need this if using Shadcn Input component correctly */
         .input-field:focus {
           /* Shadcn Input likely handles focus styles */
         }
       `}</style>
    </div>
  );
};

export default SellerDashboard;
