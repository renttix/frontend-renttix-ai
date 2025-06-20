import React from 'react';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import Link from 'next/link';
import { formatCurrency } from '../../../utils/helper';

const ProductCard = ({ product, currency, onEdit, onDelete }) => {
  const getSeverity = (status) => {
    switch (status) {
      case "INSTOCK":
        return "success";
      case "LOWSTOCK":
        return "warning";
      case "OUTOFSTOCK":
        return "danger";
      default:
        return null;
    }
  };

  const header = (
    <Link href={`/product/${product.id}`}>
      <img 
        alt={product.productName}
        src={`${process.env.NEXT_PUBLIC_API_URL_IMAGE}${product.thumbnail}`}
        onError={(e) => (e.currentTarget.src = "/images/product/placeholder.webp")}
        className="w-full h-48 object-cover"
        aria-label={`Product image for ${product.productName}`}
      />
    </Link>
  );

  const footer = (
    <div className="flex gap-2">
      <Button 
        icon="pi pi-pen-to-square" 
        className="p-button-rounded p-button-text p-button-primary"
        onClick={() => onEdit(product.id)}
        aria-label={`Edit ${product.productName}`}
        style={{ minWidth: '40px', minHeight: '40px' }}
      />
      <Button 
        icon="pi pi-trash" 
        className="p-button-rounded p-button-text p-button-danger"
        onClick={() => onDelete(product)}
        aria-label={`Delete ${product.productName}`}
        style={{ minWidth: '40px', minHeight: '40px' }}
      />
    </div>
  );

  return (
    <Card 
      title={
        <Link href={`/product/${product.id}`} className="text-[#0068d6] no-underline">
          {product.productName}
        </Link>
      }
      subTitle={
        <div className="flex items-center gap-2 mt-2">
          <span className="font-semibold">
            {formatCurrency(product.rentPrice || product.salePrice, currency)}
          </span>
          <Tag 
            severity={product.status === "Rental" ? "warning" : "info"} 
            value={product.status}
          />
        </div>
      }
      footer={footer}
      header={header}
      className="shadow-md hover:shadow-lg transition-shadow duration-200"
      role="article"
      aria-label={`Product card for ${product.productName}`}
    >
      <div className="space-y-3">
        {/* Depot Information */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Depot:</span>
          <Tag severity="success" value={product.depots} />
        </div>

        {/* Stock Status */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Status:</span>
          <Tag value={product.stockStatus} severity={getSeverity(product.stockStatus)} />
        </div>

        {/* Quantity Information */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Total Qty:</span>
          <span className="font-medium">{product.totalQuantity || 0}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600">Available:</span>
          <span className="font-medium">{product.quantity || 0}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600">Rented:</span>
          <span className="font-medium">{product.onRent || 0}</span>
        </div>

        {/* Minimum Rental Period */}
        {product.minimumRentalPeriod > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Min Rental:</span>
            <span className="font-medium">
              {product.minimumRentalPeriod} {product.minimumRentalPeriod > 1 ? 'days' : 'day'}
            </span>
          </div>
        )}

        {/* Asset Numbers */}
        {product.assetNumbers && product.assetNumbers.length > 0 && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Assets:</span>
              <span className="font-medium">
                {product.assetNumbers.length} Asset{product.assetNumbers.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {product.assetNumbers.slice(0, 3).map((asset, index) => {
                const assetObj = typeof asset === 'string' ? { number: asset, status: 'available' } : asset;
                return (
                  <Link
                    key={index}
                    href={`/asset/${assetObj.number || assetObj}`}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors no-underline"
                  >
                    <span className="text-[#0068d6] text-sm">{assetObj.number || assetObj}</span>
                    <span className={`px-2 py-1 text-xs rounded ${
                      assetObj.status === 'available' ? 'bg-green-100 text-green-800' :
                      assetObj.status === 'rented' ? 'bg-yellow-100 text-yellow-800' :
                      assetObj.status === 'maintenance' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {assetObj.status || 'available'}
                    </span>
                  </Link>
                );
              })}
              {product.assetNumbers.length > 3 && (
                <Link 
                  href={`/product/${product.id}`}
                  className="block text-center text-sm text-[#0068d6] hover:underline mt-2"
                >
                  View all {product.assetNumbers.length} assets
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProductCard;