import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from "../utils/auth";
import { apiRequest } from "../utils/api";
import ProductCard from '../components/ProductCard';
import { Link } from 'wouter';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

// Function to fetch orders
const fetchOrders = async () => {
  const response = await apiRequest('GET', '/api/orders');
  if (!response.ok) {
    throw new Error('Network response was not ok when fetching orders');
  }
  return response.json();
};

// Function to fetch products
const fetchProducts = async () => {
  const response = await apiRequest('GET', '/api/products');
  if (!response.ok) {
    throw new Error('Network response was not ok when fetching products');
  }
  return response.json();
};

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    }).format(new Date(dateString));
  } catch (e) {
    return 'Invalid Date';
  }
};

// Get status badge class helper
const getStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case "processing":
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "paid":
    case "completed":
      return "bg-green-100 text-green-800";
    case "shipped":
      return "bg-blue-100 text-blue-800";
    case "delivered":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatPrice = (dollars) => {
    const number = parseFloat(dollars || '0');
    return `$${number.toFixed(2)}`;
};

// --- Order Detail Modal --- 
const OrderDetailModal = ({ order }) => {
    if (!order) return null;
    
    return (
        <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Order Details #{order.id}</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4">
                <div>
                    <h3 className="font-semibold mb-1">Order Information</h3>
                    <p className="text-sm text-gray-600">Date: {formatDate(order.orderDate)}</p>
                    <p className="text-sm text-gray-600">Status: 
                         <Badge variant="outline" className={`ml-1 ${getStatusBadgeClass(order.status)}`}>
                            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Unknown'}
                         </Badge>
                    </p>
                    <p className="text-sm text-gray-600">Total: {formatPrice(order.totalAmount)}</p>
                </div>
                <div>
                     <h3 className="font-semibold mb-1">Shipping Address</h3>
                     <p className="text-sm text-gray-600 whitespace-pre-wrap">{order.shippingAddress || 'Not provided'}</p>
                </div>
                 <div>
                     <h3 className="font-semibold mb-2">Items</h3>
                     <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                         {order.items && order.items.length > 0 ? order.items.map(item => (
                             <div key={item.id} className="flex justify-between items-center border-b pb-1">
                                <span className="text-sm">{item.quantity} x Product ID: {item.productId}</span> 
                                <span className="text-sm font-medium">{formatPrice(item.price)}</span>
                                {/* TODO: Could fetch product name here if needed */} 
                             </div>
                         )) : <p className="text-sm text-gray-500">No items found for this order.</p>}
                     </div>
                 </div>
            </div>
        </DialogContent>
    );
};

const BuyerDashboard = () => {
  const { user } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Fetch Orders Query
  const { 
    data: orders = [], // Default to empty array
    isLoading: isLoadingOrders, 
    error: errorOrders 
  } = useQuery({ 
    queryKey: ['orders', user?.id], // Query key includes user ID
    queryFn: fetchOrders,
    enabled: !!user // Only run query if user is logged in
  });

  // Fetch Products Query
  const { 
    data: products = [], // Default to empty array
    isLoading: isLoadingProducts, 
    error: errorProducts 
  } = useQuery({ queryKey: ['products'], queryFn: fetchProducts });

  const isLoading = isLoadingOrders || isLoadingProducts;

  const renderOrderList = () => {
    if (isLoadingOrders) {
       return (
           <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Total</TableHead><TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(3)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-4 w-16" /></TableCell>
                             <TableCell className="text-right"><Skeleton className="h-8 w-20" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
           </Table>
       );
    }

    if (errorOrders) {
      return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>Failed to load orders: {errorOrders.message}</AlertDescription></Alert>;
    }

    if (!orders || orders.length === 0) {
      return <p className="text-gray-500 text-center py-10">You haven't placed any orders yet.</p>;
    }

    return (
       <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Total</TableHead><TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.id}</TableCell>
                <TableCell>{formatDate(order.orderDate)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusBadgeClass(order.status)}>
                     {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Unknown'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{formatPrice(order.totalAmount)}</TableCell>
                <TableCell className="text-right">
                    <Dialog onOpenChange={(open) => !open && setSelectedOrder(null)}>
                       <DialogTrigger asChild>
                           <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>View Details</Button>
                       </DialogTrigger>
                       {/* Render modal only when this button is clicked and order matches selected */} 
                       {selectedOrder?.id === order.id && <OrderDetailModal order={selectedOrder} />} 
                    </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    );
  };
  
   const renderProductList = () => {
     if (isLoadingProducts) {
       return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
             <div key={i} className="border rounded-lg p-4 space-y-2">
               <Skeleton className="h-40 w-full" />
               <Skeleton className="h-4 w-3/4" />
               <Skeleton className="h-4 w-1/2" />
               <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      );
     }
     
     if (errorProducts) {
       return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>Failed to load products: {errorProducts.message}</AlertDescription></Alert>;
     }
     
     if (!products || products.length === 0) {
        return <p className="text-gray-500 text-center py-10">No products available at the moment.</p>;
     }
     
     return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
        </div>
     );
   };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">My Dashboard</h1>
      
      {/* Orders Section */}
      <div className="mb-10 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">My Orders</h2>
        {renderOrderList()}
      </div>
      
      {/* Products Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Browse Products</h2>
         {renderProductList()}
      </div>
    </div>
  );
};

export default BuyerDashboard;
