import React from "react";
import { motion } from "framer-motion";
import { Badge } from "primereact/badge";
import { Tag } from "primereact/tag";
import { formatCurrency } from "../../../../../utils/helper";
import {
  FiPackage, FiMapPin, FiDollarSign, FiTag,
  FiBox, FiImage, FiInfo, FiEye, FiTool,
  FiCalendar, FiAlertCircle
} from "react-icons/fi";

export default function ProductPreview({ formData, previews, user }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="sticky top-24"
    >
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
          <h3 className="text-white font-semibold text-lg flex items-center">
            <FiEye className="mr-2" />
            Live Preview
          </h3>
          <p className="text-blue-100 text-sm mt-1">
            See how your product will appear to customers
          </p>
        </div>
        
        {/* Product Images */}
        {previews.length > 0 ? (
          <div className="relative h-64 bg-gray-100">
            <img
              src={previews[0].preview}
              alt="Product preview"
              className="w-full h-full object-cover"
            />
            {previews.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                +{previews.length - 1} more
              </div>
            )}
          </div>
        ) : (
          <div className="h-64 bg-gray-100 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <FiImage className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">No images uploaded</p>
            </div>
          </div>
        )}
        
        {/* Product Info */}
        <div className="p-6 space-y-4">
          {/* Title and Status */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-xl font-bold text-gray-900">
                {formData.productName || "Product Name"}
              </h4>
              <Tag
                severity={formData.status === "Rental" ? "info" : "success"}
                value={formData.status}
                className="text-xs"
              />
            </div>
            {formData.companyProductName && (
              <p className="text-sm text-gray-500">
                by {formData.companyProductName}
              </p>
            )}
          </div>
          
          {/* Description */}
          {formData.productDescription && (
            <div className="border-t pt-4">
              <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <FiInfo className="mr-1" />
                Description
              </h5>
              <p className="text-sm text-gray-600 line-clamp-3">
                {formData.productDescription}
              </p>
            </div>
          )}
          
          {/* Pricing */}
          <div className="border-t pt-4">
            <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FiDollarSign className="mr-1" />
              Pricing
            </h5>
            {formData.status === "Rental" ? (
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">
                  {formData.rentPrice 
                    ? formatCurrency(formData.rentPrice, user?.currencyKey)
                    : "---"}
                </p>
                <p className="text-sm text-gray-500">per day</p>
              </div>
            ) : (
              <p className="text-2xl font-bold text-gray-900">
                {formData.salePrice 
                  ? formatCurrency(formData.salePrice, user?.currencyKey)
                  : "---"}
              </p>
            )}
          </div>
          
          {/* Categories */}
          {(formData.category || formData.subCategory) && (
            <div className="border-t pt-4">
              <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <FiTag className="mr-1" />
                Categories
              </h5>
              <div className="flex flex-wrap gap-2">
                {formData.category && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                    {formData.category}
                  </span>
                )}
                {formData.subCategory && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                    {formData.subCategory}
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Specifications */}
          {(formData.weight || formData.length || formData.width || formData.height) && (
            <div className="border-t pt-4">
              <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <FiBox className="mr-1" />
                Specifications
              </h5>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {formData.weight && (
                  <div>
                    <span className="text-gray-500">Weight:</span>
                    <span className="ml-1 text-gray-700">
                      {formData.weight} {formData.weightUnit}
                    </span>
                  </div>
                )}
                {formData.length && (
                  <div>
                    <span className="text-gray-500">Length:</span>
                    <span className="ml-1 text-gray-700">
                      {formData.length} {formData.lengthUnit}
                    </span>
                  </div>
                )}
                {formData.width && (
                  <div>
                    <span className="text-gray-500">Width:</span>
                    <span className="ml-1 text-gray-700">
                      {formData.width} {formData.lengthUnit}
                    </span>
                  </div>
                )}
                {formData.height && (
                  <div>
                    <span className="text-gray-500">Height:</span>
                    <span className="ml-1 text-gray-700">
                      {formData.height} {formData.lengthUnit}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Stock Info */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm">
                <FiMapPin className="mr-1 text-gray-400" />
                <span className="text-gray-500">Location:</span>
                <span className="ml-1 text-gray-700">
                  {formData.depots || "Not specified"}
                </span>
              </div>
              <Badge 
                value={`${formData.quantity || 0} units`} 
                severity={formData.quantity > 0 ? "success" : "danger"}
              />
            </div>
          </div>
          
          {/* Asset Number */}
          {formData.uniqueAssetNo && (
            <div className="border-t pt-4">
              <p className="text-xs text-gray-500">
                Asset #: {formData.uniqueAssetNo}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}